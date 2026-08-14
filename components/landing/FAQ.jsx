"use client";

import { useState } from "react";
import { MessageCircle, ChevronDown } from "lucide-react";
import { P, Eyebrow, useInView } from "./shared";

/* ─── FAQ ─── */
export default function FAQ() {
  const { ref, inView } = useInView();
  const [openIdx, setOpenIdx] = useState(0);
  const faqs = [
    { q: "Apakah LoopLink gratis digunakan?", a: "Ya, sepenuhnya gratis untuk pengguna individu dan UMKM. Kami berencana menghadirkan paket premium dengan fitur analitik lanjutan dan prioritas tampil di masa mendatang." },
    { q: "Bagaimana sistem klaim eksklusif bekerja?", a: "Saat kamu mengajukan klaim, listing tersebut dikunci selama 24 jam khusus untukmu. Jika serah terima tidak dikonfirmasi dalam waktu tersebut, listing otomatis kembali tersedia untuk umum." },
    { q: "Seberapa akurat klasifikasi AI-nya?", a: "Model kami mencapai akurasi 94% pada 5 kategori utama (Organik, Plastik, Logam, Kertas, Tekstil). Kamu selalu bisa mengubah klasifikasi secara manual jika hasilnya tidak sesuai." },
    { q: "Apa yang terjadi jika pihak lain tidak responsif?", a: "Klaim otomatis batal setelah 24 jam tanpa konfirmasi. Kamu bisa melaporkan pengguna tidak responsif - sistem kami akan menurunkan visibilitas listing mereka secara otomatis." },
    { q: "Apakah ada batasan jarak pencarian?", a: "Tidak ada batasan maksimum. Default radius adalah 10 km, tapi kamu bisa ubah ke seluruh kota, kabupaten, atau bahkan provinsi sesuai kebutuhanmu." },
    { q: "Bagaimana cara kerja pengiriman atau penjemputan?", a: "LoopLink tidak menyediakan jasa pengiriman - koordinasi dilakukan langsung antara pemilik dan pencari melalui chat terenkripsi. Banyak pertukaran dilakukan dengan penjemputan sendiri karena rata-rata jarak hanya 4.8 km." },
  ];
  return (
    <section
      id="bantuan"
      ref={ref}
      className={`reveal${inView ? " in-view" : ""}`}
      style={{ backgroundColor: "#F6F3EA", padding: "60px 0 100px" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div className="faq-layout">
          <div className="faq-left">
            <Eyebrow>Pertanyaan Umum</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                color: "#1C2B22",
                fontSize: "clamp(2rem,4vw,3.2rem)",
                lineHeight: 1.05,
                margin: "14px 0 20px",
              }}
            >
              Ada yang
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400, color: "#3C7A5C" }}>ingin kamu tanyakan?</em>
            </h2>
            <p style={{ color: "#8C9184", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: 36 }}>
              Tidak menemukan jawaban yang kamu cari? Hubungi tim kami langsung.
            </p>
            <a
              className="btn-primary"
              href="/login"
              style={{ ...P.base, padding: "13px 26px", fontSize: "0.9rem" }}
              onMouseEnter={(e) => P.on(e.currentTarget)}
              onMouseLeave={(e) => P.off(e.currentTarget)}
            >
              <MessageCircle size={16} /> Hubungi Kami
            </a>
            {/* mini stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 48 }}>
              {[
                { val: "<2 jam", label: "Waktu respons rata-rata" },
                { val: "97%", label: "Kepuasan pengguna" },
                { val: "7 hari", label: "Dukungan setiap minggu" },
                { val: "Gratis", label: "Selalu tanpa biaya" },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: "#fff", borderRadius: 12, padding: "16px", border: "1px solid #DCE3D3" }}
                >
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.1rem", color: "#3C7A5C", marginBottom: 4 }}>
                    {s.val}
                  </div>
                  <div style={{ color: "#8C9184", fontSize: "0.78rem", lineHeight: 1.4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="faq-right">
            {faqs.map((item, i) => (
              <FAQItem
                key={i}
                {...item}
                open={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .faq-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 80px; align-items: start; }
        @media (max-width: 1023px) { .faq-layout { grid-template-columns: 1fr; gap: 40px; } }
      `}</style>
    </section>
  );
}

function FAQItem({ q, a, open, onToggle }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ borderBottom: "1px solid #DCE3D3", overflow: "hidden" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          textAlign: "left",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "22px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          fontFamily: "var(--font-body)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: open ? 700 : 600,
            fontSize: "1.05rem",
            color: open ? "#3C7A5C" : hovered ? "#3C7A5C" : "#1C2B22",
            transition: "color 0.2s",
            lineHeight: 1.3,
          }}
        >
          {q}
        </span>
        <div
          style={{
            flexShrink: 0,
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: open ? "#3C7A5C" : hovered ? "#DCE3D3" : "transparent",
            border: `1.5px solid ${open ? "#3C7A5C" : "#DCE3D3"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background-color 0.2s, border-color 0.2s",
            color: open ? "#F6F3EA" : "#8C9184",
          }}
        >
          <ChevronDown
            size={15}
            style={{
              transform: open ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        </div>
      </button>
      <div style={{ maxHeight: open ? 300 : 0, overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.22,1,0.36,1)" }}>
        <p style={{ color: "#8C9184", fontSize: "0.95rem", lineHeight: 1.8, padding: "0 40px 22px 0", margin: 0 }}>
          {a}
        </p>
      </div>
    </div>
  );
}
