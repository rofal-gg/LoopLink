"use client";

import { useState } from "react";
import { MessageCircle, ChevronDown } from "lucide-react";
import { P, Eyebrow, useInView } from "./shared";
import { SourceLabel, formatAngka, formatPersen } from "./format";

/* ─── FAQ ───
 * Jawaban yang sebelumnya mengaku angka palsu ("akurasi 94%", "jarak
 * rata-rata 4.8 km", "dikunci 24 jam", "default 10 km") dirapikan menjadi
 * pernyataan netral. Satu-satunya angka yang boleh muncul di FAQ adalah
 * data statistik nyata (via prop `statistik`) atau fakta produk ("12 kelas
 * limbah model", "gratis").
 */

export default function FAQ({ statistik = null }) {
  const { ref, inView } = useInView();
  const [openIdx, setOpenIdx] = useState(0);

  const persen = statistik ? formatPersen(statistik.rata_rata_confidence) : null;

  const faqs = [
    { q: "Apakah LoopLink gratis digunakan?", a: "Ya, sepenuhnya gratis untuk pengguna individu dan UMKM. Kami berencana menghadirkan paket premium dengan fitur analitik lanjutan dan prioritas tampil di masa mendatang." },
    { q: "Bagaimana sistem klaim eksklusif bekerja?", a: "Saat kamu mengajukan klaim, listing dikunci khusus untukmu. Jika serah terima tidak dikonfirmasi dalam waktu yang ditentukan, listing otomatis kembali tersedia untuk umum." },
    {
      q: "Seberapa akurat klasifikasi AI-nya?",
      a: persen
        ? `Model memberi nilai keyakinan per foto; rata-rata keyakinan saat ini sekitar ${persen} (dari listing yang ada). Kamu selalu bisa mengoreksi kategori manual.`
        : "Model memberi nilai keyakinan per foto. Kamu selalu bisa mengoreksi kategori manual jika hasilnya tidak sesuai.",
    },
    { q: "Apa yang terjadi jika pihak lain tidak responsif?", a: "Klaim otomatis batal jika tidak ada konfirmasi dalam waktu yang ditentukan. Kamu bisa melaporkan pengguna tidak responsif - sistem kami akan menurunkan visibilitas listing mereka secara otomatis." },
    { q: "Apakah ada batasan jarak pencarian?", a: "Tidak ada batasan: semua listing tersedia tetap ditampilkan walau di luar radius jangkauan, dan ditandai jaraknya." },
    { q: "Bagaimana cara kerja pengiriman atau penjemputan?", a: "LoopLink tidak menyediakan jasa pengiriman - koordinasi dilakukan langsung antara pemilik dan pencari melalui chat. Banyak pertukaran dilakukan dengan penjemputan sendiri." },
  ];

  const miniStats = [
    {
      val: statistik?.jumlah_listing != null ? formatAngka(statistik.jumlah_listing) : "—",
      label: "Listing tercatat di platform",
    },
    {
      val: statistik?.jumlah_anggota != null ? formatAngka(statistik.jumlah_anggota) : "—",
      label: "Anggota terdaftar",
    },
    { val: "12", label: "Kelas limbah dikenal model AI" },
    { val: "Gratis", label: "Selalu tanpa biaya untuk individu & UMKM" },
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
            {/* mini stats — angka nyata dari data.statistik / fakta produk */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 48 }}>
              {miniStats.map((s, i) => (
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
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
              <SourceLabel tanggal={statistik?.tanggal_pembaruan ?? null} />
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