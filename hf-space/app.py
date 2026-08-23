# app.py — LoopLink · HuggingFace Space (Gradio SDK + ZeroGPU)
# ======================================================================
# TUJUAN
#   Menjalankan model klasifikasi citra `watersplash/waste-classification`
#   (ViT, image-classification, input 224x224) sebagai layanan inference
#   untuk aplikasi LoopLink. Model di-load SATU KALI di module scope dan
#   fungsi inference dibungkus `@spaces.GPU(duration=10)` agar hemat kuota
#   ZeroGPU (bukan duration default 60).
#
# KONTRAK ENDPOINT  POST /klasifikasi
#   - Header : X-API-KEY: <nilai env API_KEY dari Space Secrets>
#   - Body   : raw bytes gambar (Content-Type: application/octet-stream)
#   - Respon : 200 {"hasil": [{"label": "...", "score": 0.xxxx}, ...]}
#              5 item teratas (top-5). Lainnya:
#              401 (X-API-KEY salah / tidak ada), 400 (body kosong),
#              413 (payload melebihi batas), 500 (inference gagal).
#
# CATATAN LABEL
#   Label dikembalikan APA ADANYA dari model.config.id2label (lowercase,
#   mis. "brown-glass", "white-glass"). Space ini TIDAK melakukan
#   mapping/normalisasi/renormalisasi label — backend LoopLink yang
#   memetakan ke format KELAS_MODEL (Battery, Biological, Brown-glass, dst).
#   Jadi jangan tambahkan mapping label apa pun di file ini.
#
# PORT
#   Space Gradio dijalankan platform di port 7860 (override via env PORT
#   untuk uji lokal). Traffic utama dilayani `uvicorn.run(app, ...)` dengan
#   `app` = hasil `gr.mount_gradio_app(...)` (FastAPI + Gradio), karena
#   `demo.launch()` stand-alone akan membuat rute /klasifikasi HILANG.
#   Mounting dilakukan DI DALAM blok `if __name__ == "__main__":` (bukan
#   module scope) — mounting di module scope (SSR mode default) membuat
#   `demo.launch()` hang di "Stopping Node.js server..." (terbukti empiris).
#
# ZeroGPU — pola hybrid (lihat blok __main__), urutan WAJIB:
#   1. `demo.launch(prevent_thread_lock=True, server_name="0.0.0.0",
#      server_port=8000, ...)` dipanggil DI DALAM blok __main__ untuk memicu
#      hook startup ZeroGPU: platform mem-patch `gr.Blocks.launch` (via
#      `gradio.one_launch`) sehingga panggilan launch() ini menjalankan
#      `torch.pack()` + `client.startup_report()` dan membuat scan startup
#      platform mendeteksi @spaces.GPU.
#   2. Mount ke FastAPI dengan `ssr_mode=False` (menghindari hang
#      "Stopping Node.js server..." akibat SSR Node.js). Dua cabang (ZeroGPU
#      dan off-ZeroGPU) memakai try/except karena tidak semua versi gradio
#      menerima parameter `ssr_mode`; fallback mount tanpa parameter itu.
#   3. `demo.close()` mematikan server background hasil launch() itu.
#   4. `uvicorn.run(app, ...)` serve app hasil mounting di port 7860.
#   Alasan: `zero.startup()` manual TERBUKTI TIDAK cukup — platform tetap
#   menampilkan "No @spaces.GPU function detected during startup" walau log
#   menunjukkan packing + startup-report sukses; scan platform menuntut
#   alur `demo.launch()` resmi. Guard env `SPACES_ZERO_GPU` (hanya ada di
#   mode ZeroGPU) menahan tahap 1 (launch) agar off-ZeroGPU tidak melaunch
#   server ganda.
# ======================================================================

import spaces  # WAJIB PALING ATAS — ZeroGPU monkey-patch torch.cuda sebelum torch di-import

import hmac
import io
import logging
import os
from pathlib import Path

import torch
from PIL import Image
from transformers import AutoImageProcessor, AutoModelForImageClassification

import gradio as gr
import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.concurrency import run_in_threadpool

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("looplink-hf-space")

# ----------------------------------------------------------------------
# Konfigurasi
# ----------------------------------------------------------------------
MODEL_ID = "watersplash/waste-classification"
TOP_K = 5
MAX_BYTES = 10 * 1024 * 1024  # batas aman ukuran upload (10 MB)

# API key untuk endpoint /klasifikasi. Selalu dari environment variable
# (Space Secrets di HF / .env lokal) — TIDAK PERNAH di-hardcode.
API_KEY = os.environ.get("API_KEY")
if not API_KEY:
    logger.warning(
        "API_KEY belum di-set di environment. Endpoint /klasifikasi berjalan "
        "TANPA autentikasi (mode development). Di produksi, set Secret API_KEY "
        "di pengaturan Space."
    )

# ----------------------------------------------------------------------
# Load model SATU KALI di module scope (bukan per-request).
#
# ZeroGPU: `import spaces` membuat torch.cuda.is_available() bernilai True
# di module scope walau GPU asli belum menempel; `.to("cuda")` di sini
# mendaftarkan bobot agar di-streaming ke VRAM saat worker @spaces.GPU
# pertama kali dijalankan (bukan lazy-load di dalam fungsi).
# ----------------------------------------------------------------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
logger.info("Load model %s → device: %s", MODEL_ID, DEVICE)

_processor = AutoImageProcessor.from_pretrained(MODEL_ID)
_model = AutoModelForImageClassification.from_pretrained(MODEL_ID).to(DEVICE).eval()


def _label_for_index(indeks: int) -> str:
    """Ambil label dari model.config.id2label.

    Key id2label bisa bertipe int atau str tergantung versi transformers —
    ditangani dua-duanya. Label dibiarkan apa adanya (lowercase).
    """
    id2label = _model.config.id2label or {}
    if str(indeks) in id2label:
        return id2label[str(indeks)]
    if indeks in id2label:
        return id2label[indeks]
    return str(indeks)  # fallback: jangan sampai crash di produksi


@spaces.GPU(duration=10)
def classify_sync(image_input):
    """Inference 1 gambar → top-5 [{"label", "score"}] dari id2label model.

    `image_input` bisa berupa:
      - bytes        → dipanggil FastAPI endpoint /klasifikasi, atau
      - path file (str) → dipanggil UI Gradio (gr.Image type="filepath").
    Kedua jalur memakai fungsi yang SAMA (yang dibungkus @spaces.GPU).

    Argumen/return harus picklable (ZeroGPU memindahkannya ke GPU worker
    lewat pickle): bytes/str dan list-of-dict JSON aman.
    """
    if isinstance(image_input, (str, os.PathLike)):
        path = Path(image_input)
        if not path.exists():
            raise FileNotFoundError(f"File gambar tidak ditemukan: {path}")
        image_bytes = path.read_bytes()
    elif isinstance(image_input, bytes):
        image_bytes = image_input
    else:
        raise TypeError("input harus bytes (endpoint) atau path file (UI Gradio)")

    if not image_bytes:
        raise ValueError("Gambar kosong (0 byte).")

    # bytes → PIL Image RGB (model dilatih pada input 224x224, processor
    # menangani resize/normalisasi).
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = _processor(images=image, return_tensors="pt").to(DEVICE)

    with torch.no_grad():
        logits = _model(**inputs).logits

    probs = torch.nn.functional.softmax(logits, dim=-1)[0]
    top5 = torch.topk(probs, k=min(TOP_K, probs.shape[0]))

    hasil = []
    for nilai, indeks in zip(top5.values.tolist(), top5.indices.tolist()):
        hasil.append(
            {
                "label": _label_for_index(int(indeks)),
                "score": round(float(nilai), 6),
            }
        )
    return hasil


# ----------------------------------------------------------------------
# UI Gradio sederhana untuk pengujian manual di browser.
# Handler tombol = `classify_sync` (fungsi berbungkus @spaces.GPU) — selain
# memenuhi syarat "satu fungsi inference untuk semua jalur", ini juga yang
# dideteksi scan startup ZeroGPU saat mencari @spaces.GPU pada event handler.
# ----------------------------------------------------------------------
def _build_demo() -> gr.Blocks:
    with gr.Blocks(title="LoopLink — Klasifikasi Citra Limbah") as demo:
        gr.Markdown(
            "# LoopLink · Klasifikasi Citra Limbah\n\n"
            f"Model **`{MODEL_ID}`** (ViT 86M, input 224×224, ZeroGPU `duration=10`).\n\n"
            "### Catatan label\n"
            "Label yang tampil adalah **apa adanya** dari `id2label` model "
            "(lowercase, mis. `brown-glass`) — Space ini **tidak** menormalisasi "
            "label. Backend LoopLink yang memetakan ke format KELAS_MODEL "
            "(Battery, Biological, Brown-glass, dst)."
        )
        with gr.Row():
            gambar = gr.Image(
                type="filepath",
                sources=["upload", "clipboard"],
                label="Foto limbah",
            )
            # Output JSON persis meniru respons API /klasifikasi ({label, score}),
            # dan tidak bergantung pada perilaku postprocess komponen Dataframe.
            hasil_ui = gr.JSON(label="Top-5 prediksi")
        tombol = gr.Button("Klasifikasikan", variant="primary")
        tombol.click(fn=classify_sync, inputs=gambar, outputs=hasil_ui)
    return demo


# ----------------------------------------------------------------------
# FastAPI: endpoint khusus untuk backend LoopLink.
# Rute didefinisikan SEBELUM mount Gradio agar menang saat di-match
# (Starlette mencocokkan rute sesuai urutan registrasi; Mount("/") berada
# paling akhir sehingga tidak menelan /klasifikasi dan /health).
# ----------------------------------------------------------------------
app = FastAPI(
    title="LoopLink Waste Classifier",
    description="Klasifikasi citra limbah (watersplash/waste-classification) untuk LoopLink.",
)


@app.get("/health")
def health() -> dict:
    """Cek kesehatan sederhana (dipakai monitoring/healthcheck backend)."""
    return {"status": "ok", "model": MODEL_ID, "device": DEVICE, "top_k": TOP_K}


@app.post("/klasifikasi")
async def klasifikasi(request: Request):
    """Terima raw bytes gambar → top-5 prediksi.

    Autentikasi: header `X-API-KEY` dicocokkan dengan env `API_KEY`
    (constant-time lewat hmac.compare_digest). Jika env `API_KEY` kosong
    (development), endpoint berjalan tanpa autentikasi + warning saat boot.
    """
    api_key_env = os.environ.get("API_KEY")
    if api_key_env:
        provided = request.headers.get("X-API-KEY", "")
        if not provided or not hmac.compare_digest(provided, api_key_env):
            return JSONResponse(
                {"error": "Unauthorized: X-API-KEY tidak cocok."}, status_code=401
            )

    body = await request.body()
    if not body:
        return JSONResponse({"error": "Bad Request: body kosong."}, status_code=400)
    if len(body) > MAX_BYTES:
        return JSONResponse(
            {"error": f"Payload terlalu besar (maks {MAX_BYTES} bytes)."},
            status_code=413,
        )

    try:
        # GPU call bersifat blocking → jalankan di threadpool agar tidak
        # memblokir event loop FastAPI.
        hasil = await run_in_threadpool(classify_sync, body)
    except Exception as exc:  # noqa: BLE001 — dikembalikan ke client sebagai JSON
        logger.exception("Klasifikasi gagal")
        return JSONResponse(
            {"error": f"Klasifikasi gagal: {exc}"}, status_code=500
        )

    return {"hasil": hasil}


# ----------------------------------------------------------------------
# Demo Gradio dibangun di module scope. Mounting ke FastAPI TIDAK dilakukan
# di sini — dilakukan di blok `__main__` (mount di module scope / SSR mode
# default membuat `demo.launch()` hang di "Stopping Node.js server...").
# ----------------------------------------------------------------------
demo = _build_demo()
demo.queue()


if __name__ == "__main__":
    # PORT: platform Gradio Space menjalankan aplikasi di 7860; boleh
    # dioverride via env PORT untuk uji lokal. Jangan hardcode selain default.
    port = int(os.environ.get("PORT", "7860"))

    if os.environ.get("SPACES_ZERO_GPU"):
        # ZeroGPU: scan platform memerlukan Blocks.launch() benar-benar
        # dipanggil (spaces mem-patch gr.Blocks.launch → hook startup →
        # torch.pack() + startup-report). Urutan PENTING: launch DULU
        # (server gradio background di port 8000), lalu mount ke FastAPI
        # dengan ssr_mode=False (mencegah hang "Stopping Node.js server"),
        # lalu close server background, lalu serve via uvicorn di 7860.
        demo.launch(
            prevent_thread_lock=True,
            server_name="0.0.0.0",
            server_port=8000,
            quiet=True,
        )
        try:
            app = gr.mount_gradio_app(app, demo, path="/", ssr_mode=False)
        except TypeError:
            app = gr.mount_gradio_app(app, demo, path="/")
        demo.close()
    else:
        # Off-ZeroGPU (uji lokal/CPU): mount tanpa SSR sama seperti ZeroGPU.
        try:
            app = gr.mount_gradio_app(app, demo, path="/", ssr_mode=False)
        except TypeError:
            app = gr.mount_gradio_app(app, demo, path="/")

    logger.info("Menjalankan LoopLink classifier di 0.0.0.0:%s", port)
    uvicorn.run(app, host="0.0.0.0", port=port)