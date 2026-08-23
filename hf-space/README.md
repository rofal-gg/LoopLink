---
title: LoopLink — Klasifikasi Citra Limbah
emoji: ♻️
colorFrom: green
colorTo: indigo
sdk: gradio
app_file: app.py
hardware: zero-a10g
pinned: false
short_description: Klasifikasi citra limbah 12 kelas untuk LoopLink (ZeroGPU)
python_version: "3.12"
---

# LoopLink · Klasifikasi Citra Limbah (ZeroGPU Space)

Space ini menjalankan model **`watersplash/waste-classification`** (ViT,
image-classification, input 224×224, 12 kelas) sebagai layanan klasifikasi
citra untuk aplikasi LoopLink. Terdiri dari **dua jalur akses**:

1. **HTTP endpoint `POST /klasifikasi`** — dipakai backend LoopLink
   (dikirimi raw bytes gambar, dibalas top-5 prediksi JSON).
2. **UI Gradio** di root (`/`) — untuk pengujian manual di browser.

Model di-load **satu kali** di module scope dan inference dibungkus
`@spaces.GPU(duration=10)` (ZeroGPU size `large`; duration pendek agar
menghemat kuota dan mendapat prioritas antrean lebih tinggi).

## File dalam folder ini

| File              | Fungsi                                                        |
| ----------------- | ------------------------------------------------------------- |
| `app.py`          | App utama (FastAPI + Gradio mount, inference ZeroGPU)         |
| `requirements.txt`| Dependencies (bound longgar, kompatibel ZeroGPU)              |

---

## Cara pakai (deploy)

### 1. Buat Space

1. Buka <https://huggingface.co/new-space>.
2. Nama Space: misal `looplink-waste-classifier`.
3. **SDK: `Gradio`**.
4. **Hardware: `ZeroGPU` (size large)** — dipilih di bagian *Hardware* saat
   pembuatan, atau nanti lewat *Settings → Hardware*.
   > Catatan: `hardware: zero-a10g` di frontmatter README adalah metadata;
   > hardware yang benar-benar dipakai harus dipilih juga di pengaturan Space.
5. Klik **Create Space**.

### 2. Letakkan file di root Space

Space adalah repo git. Buka root repo Space lalu letakkan **`app.py`** dan
**`requirements.txt`** **di root** (bukan folder `hf-space/`). Dua cara:

**Cara A — via web UI**
Buka halaman Space → tab **Files** → *Add file → Upload files* → unggah
`app.py` dan `requirements.txt`.

**Cara B — via git**

```bash
# clone repo Space Anda
git clone https://huggingface.co/spaces/<USERNAME>/<SPACE_NAME>
cd <SPACE_NAME>

# salin file dari folder proyek LoopLink
cp /path/ke/project/hf-space/app.py .
cp /path/ke/project/hf-space/requirements.txt .

git add app.py requirements.txt
git commit -m "Deploy LoopLink waste classifier (ZeroGPU)"
git push
```

Setiap push memicu rebuild Space (1–3 menit; model ~170MB diunduh saat
startup pertama).

### 3. Set Secret `API_KEY`

Endpoint `/klasifikasi` memeriksa header `X-API-KEY` terhadap env `API_KEY`.

- Buka **Settings → Variables and secrets → New secret**.
- Name: `API_KEY`, Value: string rahasia apa pun (mis. hasil
  `openssl rand -hex 32`).
- Simpan → Space restart otomatis. **Ulangi file ini jika belum terisi.**

> Tanpa `API_KEY`, Space tetap berjalan tapi `/klasifikasi` TANPA
> autentikasi dan ada log peringatan saat boot (mode development saja).
> Jangan hardcode secret apa pun di `app.py`.

### 4. Test dengan curl

URL Space berbentuk `https://\<SPACE_NAME\>-\<USERNAME\>.hf.space`
(username lowercase, spasi diganti tanda hubung).

```bash
# healthcheck
curl -s https://looplink-waste-classifier-<USERNAME>.hf.space/health

# klasifikasi satu gambar (raw bytes di body)
curl -sS -X POST "https://looplink-waste-classifier-<USERNAME>.hf.space/klasifikasi" \
  -H "X-API-KEY: <RAHASIA_API_KEY>" \
  -H "Content-Type: application/octet-stream" \
  --data-binary "@foto-limbah.jpg"
```

Contoh respons JSON (label = persis `id2label` model, lowercase; score 0–1):

```json
{
  "hasil": [
    { "label": "cardboard", "score": 0.972031 },
    { "label": "paper", "score": 0.021008 },
    { "label": "brown-glass", "score": 0.003271 },
    { "label": "green-glass", "score": 0.001462 },
    { "label": "trash", "score": 0.000886 }
  ]
}
```

Status code lain: `401` (X-API-KEY salah), `400` (body kosong),
`413` (gambar > 10 MB), `500` (inference gagal).

---

## Kontrak endpoint `POST /klasifikasi`

| Aspek   | Nilai                                                        |
| ------- | ------------------------------------------------------------ |
| Body    | Raw bytes gambar (`application/octet-stream`)                |
| Header  | `X-API-KEY` (wajib bila env `API_KEY` di-set)                |
| Respon  | `{"hasil": [{"label": string, "score": float}, ...]}` (top-5)|

Label **tidak dinormalisasi/dimapping** di Space. Backend LoopLink yang
memetakan label lowercase ini ke format `KELAS_MODEL` (Battery, Biological,
Brown-glass, dst.) dan yang menerapkan threshold confidence 0.6.

---

## Uji lokal (CPU)

```bash
cd hf-space
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export API_KEY="rahasia-lokal"
python app.py
# lalu buka http://127.0.0.1:7860 (UI) atau curl POST /klasifikasi
```

Di luar ZeroGPU, `@spaces.GPU` adalah passthrough (no-op), jadi kode yang
sama jalan di CPU/laptop.

---

## Risiko & fallback

1. **`demo.launch()` vs `uvicorn.run(app, ...)`** — `app.py` sengaja TIDAK
   memakai `demo.launch()` sebagai server utama. Setelah
   `gr.mount_gradio_app(...)`, `demo.launch()` menjalankan Gradio
   stand-alone sehingga rute `/klasifikasi` hilang. Yang diserve adalah
   `app` hasil mounting (FastAPI + Gradio sekaligus) lewat
   `uvicorn.run(app, ...)`. Bila Anda hanya ingin UI tanpa endpoint,
   ganti blok `__main__` dengan `demo.launch()`.
   - **Mounting DI DALAM `__main__`, bukan module scope.** Percobaan
     menunjukkan mount di module scope (SSR mode default) membuat
     `demo.launch()` hang di "*Stopping Node.js server...*". Karena itu
     mounting dipindah ke blok `__main__` dengan `ssr_mode=False`.
   - **ZeroGPU (pola hybrid):** blok `__main__` memakai pola 4 langkah:
     (1) `demo.launch(prevent_thread_lock=True, server_name="0.0.0.0",
     server_port=8000)` DULU — HANYA untuk memicu hook startup ZeroGPU
     (`import spaces` mem-patch `gr.Blocks.launch` via `gradio.one_launch`
     → `torch.pack()` + `client.startup_report()`), (2) mount ke FastAPI
     dengan `ssr_mode=False` (menghindari hang SSR Node.js; dibungkus
     try/except dengan fallback tanpa `ssr_mode` untuk gradio versi lama),
     (3) `demo.close()` mematikan server background itu, (4)
     `uvicorn.run(app, ...)` serve app hasil mount di port 7860. Tahap 1
     di-guard env `SPACES_ZERO_GPU` (hanya ada di mode ZeroGPU).
     Versi lama memakai `zero.startup()` eksplisit dan TERBUKTI GAGAL:
     log menunjukkan packing + startup-report sukses tapi halaman Space
     tetap "*No @spaces.GPU function detected during startup*" karena scan
     platform menuntut alur `demo.launch()` resmi.
2. **ZeroGPU + FastAPI mount** — kombinasi `@spaces.GPU` yang dipanggil dari
   rute FastAPI, plus UI Gradio yang memanggil fungsi yang sama. Handler
   Gradio juga memakai `classify_sync`, sehingga scan startup ZeroGPU
   menemukan fungsi berbungkus `@spaces.GPU` (dipicu lewat `demo.launch()`
   pola hybrid di blok `__main__`, lihat poin 1).
   - Bila endpoint `/klasifikasi` bermasalah di runtime, fallback
     machine-readable bawaan Gradio tetap tersedia:
     `POST /gradio_api/call/classify_sync`
     (Gradio 5) atau `POST /gradio_api/call/v2/classify_sync` (Gradio 6),
     lalu ambil hasil dari
     `GET /gradio_api/call/classify_sync/{event_id}`.
3. **Mount di path `"/"`** — bug redirect berulang `//` pernah ada di
   gradio 5.25.2 dan sudah diperbaiki (versi lebih baru). Platform
   menginstal Gradio terbaru otomatis lewat
   `gradio>=5.26,<7` di requirements.
4. **Durasi `duration=10`** — cukup untuk ViT 86M (<1 dtk per inference).
   Jika muncul error *ZeroGPU illegal duration* / timeout saat cold start,
   naikkan ke `30` atau `60` (ingat: nilai lebih kecil = prioritas antrean
   lebih tinggi dan kuota lebih hemat).
5. **Quota ZeroGPU** — akun gratis ~5 menit/hari; tiap panggilan memakai
   ~10 detik kuota (sesuai `duration`). Backend LoopLink yang memanggil
   lewat server-side sebaiknya menyimpan hasil cache bila perlu.