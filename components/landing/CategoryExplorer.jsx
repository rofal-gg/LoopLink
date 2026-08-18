"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Recycle,
  FileText,
  Wrench,
  Sprout,
  Shirt,
  Zap,
  ArrowRight,
  Newspaper,
  BatteryCharging,
  Footprints,
  GlassWater,
  Trash2,
  Package,
  Layers,
} from "lucide-react";
import { P, Eyebrow, useInView } from "./shared";
import { SourceLabel, labelKategori, formatAngka } from "./format";

/* ─── Category Explorer ───
 * Kategori berasal dari data.kategori (agregat listing tersedia per
 * kategori, hasil lib/api/landing). COUNT = `jumlah` (nyata). Foto pakai
 * `foto_url` nyata; kalau null → placeholder ikon-gradient (bukan Unsplash).
 * Edukasi (desc/tags/tip) dipertahankan tanpa angka jualan.
 */

// Profil tampilan per kategori (label Indonesia dari KATEGORI_LABEL).
// icon/color/desc/tags/tip hanyalah informasi edukasi umum — angka yang
// tampil (jumlah) selalu dari database.
const PROFIL = {
  Plastik: {
    Icon: Recycle,
    color: "#3C7A5C",
    desc: "Botol PET, kantong HDPE, ember PP, pipa PVC - semua kategori plastik tersedia di platform kami.",
    tags: ["Botol PET", "Kantong HDPE", "Pipa PVC", "Ember PP", "Film Plastik"],
    tip: "Plastik bersih (tidak terkontaminasi makanan) memiliki nilai jual lebih tinggi.",
  },
  Kertas: {
    Icon: FileText,
    color: "#E8752C",
    desc: "Kardus, kertas HVS, koran bekas, hingga buku - semua bisa menjadi bahan baku baru.",
    tags: ["Kardus", "Kertas HVS", "Koran", "Majalah", "Box Packaging"],
    tip: "Kardus gelombang (corrugated) paling banyak dicari untuk packaging ulang.",
  },
  "Karton/Kardus": {
    Icon: Newspaper,
    color: "#E8752C",
    desc: "Kardus gelombang dan karton kemasan bekas bisa langsung menjadi bahan baku packaging baru.",
    tags: ["Kardus Gelombang", "Box Packaging", "Karton Lipat", "Kartonsekat"],
    tip: "Kardus gelombang (corrugated) paling banyak dicari untuk packaging ulang.",
  },
  Logam: {
    Icon: Wrench,
    color: "#8C9184",
    desc: "Besi tua, aluminium, tembaga, dan campuran logam lain yang bernilai tinggi di pasar daur ulang.",
    tags: ["Besi Tua", "Aluminium", "Tembaga", "Kuningan", "Seng"],
    tip: "Tembaga dan aluminium memiliki harga jual tertinggi per kg di kategori logam.",
  },
  Organik: {
    Icon: Sprout,
    color: "#6bba91",
    desc: "Sisa dapur, daun kering, ampas kopi - dapat diolah menjadi kompos atau biogas.",
    tags: ["Sisa Dapur", "Daun Kering", "Ampas Kopi", "Serbuk Gergaji", "Kulit Buah"],
    tip: "Limbah organik yang sudah dipilah dapat langsung diambil oleh pembuatan kompos lokal.",
  },
  Pakaian: {
    Icon: Shirt,
    color: "#9B6B9B",
    desc: "Kain perca, pakaian bekas layak, serat tekstil - bahan baku UMKM kreatif di bidang daur ulang.",
    tags: ["Kain Perca", "Pakaian Bekas", "Benang Sisa", "Serat Kapas", "Denim"],
    tip: "Kain perca warna cerah banyak dicari pengrajin tas dan aksesori daur ulang.",
  },
  Sepatu: {
    Icon: Footprints,
    color: "#9B6B9B",
    desc: "Sepatu bekas layak pakai atau bahan sol karet yang bisa diolah kembali.",
    tags: ["Sepatu Layak Pakai", "Sol Karet", "Tali Sepatu"],
    tip: "Sepatu dalam kondisi baik biasanya lebih cepat diambil oleh pengelola barang bekas.",
  },
  Baterai: {
    Icon: BatteryCharging,
    color: "#E8752C",
    desc: "Baterai bekas perlu penanganan khusus agar logam dan kimianya tidak mencemari lingkungan.",
    tags: ["Baterai AA", "Baterai Lithium", "Aki Bekas", "Baterai HP"],
    tip: "Baterai mengandung logam berat - jangan dicampur dengan sampah umum.",
  },
  "Kaca Cokelat": {
    Icon: GlassWater,
    color: "#6B84A8",
    desc: "Botol dan pecahan kaca cokelat dapat didaur ulang menjadi bahan baku gelas baru.",
    tags: ["Botol Bir", "Botol Kecap", "Pecahan Kaca"],
    tip: "Kaca bersih tanpa tutup plastik lebih mudah diterima pengepul.",
  },
  "Kaca Hijau": {
    Icon: GlassWater,
    color: "#6B84A8",
    desc: "Botol kaca hijau bekas minuman dapat diolah kembali menjadi wadah baru.",
    tags: ["Botol Wine", "Botol Sirup", "Pecahan Kaca"],
    tip: "Kaca bersih tanpa tutup plastik lebih mudah diterima pengepul.",
  },
  "Kaca Putih": {
    Icon: GlassWater,
    color: "#6B84A8",
    desc: "Kaca putih bening (seperti botol air mineral) memiliki pasar daur ulang yang luas.",
    tags: ["Botol Mineral", "Pecahan Kaca Bening"],
    tip: "Kaca bersih tanpa tutup plastik lebih mudah diterima pengepul.",
  },
  "Sampah Campuran": {
    Icon: Trash2,
    color: "#8C9184",
    desc: "Limbah campuran yang belum terpilah - cek detail listing untuk kondisi dan cara penukarannya.",
    tags: ["Sampah Rumah Tangga", "Sampah Kantor"],
    tip: "Memilah limbah sebelum mengunggah listing membantu pencari menemukannya lebih cepat.",
  },
};

const FALLBACK_PROFIL = {
  Icon: Package,
  color: "#3C7A5C",
  desc: "Kategori limbah yang tersedia untuk dipertukarkan di platform.",
  tags: [],
  tip: "",
};

export default function CategoryExplorer({ kategori = [] }) {
  const { ref, inView } = useInView();
  const [activeIdx, setActiveIdx] = useState(0);
  const tanggal = null;

  const categories = (kategori ?? []).map((k) => {
    const label = labelKategori(k.kategori_citra);
    const profil = PROFIL[label] ?? FALLBACK_PROFIL;
    return {
      label,
      jumlah: k.jumlah ?? 0,
      foto_url: k.foto_url ?? null,
      ...profil,
    };
  });

  const amanIdx =
    categories.length === 0
      ? -1
      : activeIdx >= categories.length
        ? categories.length - 1
        : activeIdx;
  const active = amanIdx >= 0 ? categories[amanIdx] : null;

  return (
    <section
      id="kategori"
      ref={ref}
      className={`reveal${inView ? " in-view" : ""}`}
      style={{ backgroundColor: "#F6F3EA", padding: "60px 0 100px" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 48,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <Eyebrow>Kategori Limbah</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "#1C2B22",
                fontSize: "clamp(1.7rem,3.5vw,2.4rem)",
                lineHeight: 1.15,
                margin: "12px 0 0",
              }}
            >
              Jelajahi <em style={{ fontStyle: "italic", fontWeight: 400 }}>semua jenis limbah</em>
            </h2>
          </div>
          {active && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {categories.map((c, i) => {
                const IconK = c.Icon;
                return (
                  <button
                    key={c.label}
                    onClick={() => setActiveIdx(i)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 100,
                      border: `1.5px solid ${amanIdx === i ? c.color : "#DCE3D3"}`,
                      backgroundColor: amanIdx === i ? c.color : "transparent",
                      color: amanIdx === i ? "#F6F3EA" : "#8C9184",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.2s",
                    }}
                  >
                    <IconK size={16} strokeWidth={1.8} /> {c.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {!active ? (
          <div
            style={{
              borderRadius: 16,
              backgroundColor: "#fff",
              border: "1px solid #DCE3D3",
              padding: "28px 24px",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "#8C9184",
            }}
          >
            Data kategori belum tersedia.
          </div>
        ) : (
          <div className="cat-grid">
            <div style={{ borderRadius: 20, overflow: "hidden", position: "relative", height: 400 }}>
              {active.foto_url ? (
                <img
                  src={active.foto_url}
                  alt={active.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.4s" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `linear-gradient(135deg, ${active.color} 0%, #DCE3D3 130%)`,
                  }}
                >
                  <active.Icon size={96} strokeWidth={1.2} color="rgba(246,243,234,0.9)" />
                </div>
              )}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(28,43,34,0.8) 0%, rgba(28,43,34,0.1) 60%)",
                }}
              />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      backgroundColor: active.color,
                      borderRadius: 8,
                      width: 36,
                      height: 36,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#F6F3EA",
                    }}
                  >
                    <active.Icon size={18} strokeWidth={1.8} />
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: "1.4rem",
                      color: "#F6F3EA",
                    }}
                  >
                    {active.label}
                  </span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "rgba(246,243,234,0.75)" }}>
                  <span style={{ color: "#6bba91", fontWeight: 700, fontSize: "1.1rem" }}>
                    {formatAngka(active.jumlah)}
                  </span>{" "}
                  listing tersedia
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
              <p style={{ color: "#8C9184", fontSize: "1rem", lineHeight: 1.8, margin: 0 }}>
                {active.desc}
              </p>
              {active.tags.length > 0 && (
                <div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      color: "#3C7A5C",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      margin: "0 0 12px",
                    }}
                  >
                    Sub-kategori populer
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {active.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: "6px 14px",
                          borderRadius: 100,
                          backgroundColor: "#DCE3D3",
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.72rem",
                          color: "#1C2B22",
                          fontWeight: 500,
                          cursor: "default",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#C8D4BF")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#DCE3D3")}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {active.tip && (
                <div
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 14,
                    padding: "18px 20px",
                    border: "1px solid #DCE3D3",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#DCE3D3",
                      borderRadius: 8,
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Zap size={15} strokeWidth={2} color="#3C7A5C" />
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.68rem",
                        fontWeight: 600,
                        color: "#3C7A5C",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        margin: "0 0 4px",
                      }}
                    >
                      Tips AI
                    </p>
                    <p style={{ color: "#8C9184", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
                      {active.tip}
                    </p>
                  </div>
                </div>
              )}
              <Link
                className="btn-primary"
                href="/cari"
                style={{ ...P.base, padding: "13px 26px", fontSize: "0.9rem", alignSelf: "flex-start" }}
                onMouseEnter={(e) => P.on(e.currentTarget)}
                onMouseLeave={(e) => P.off(e.currentTarget)}
              >
                Jelajahi Kategori {active.label} <ArrowRight size={16} />
              </Link>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Layers size={12} strokeWidth={2} color="#8C9184" />
                <SourceLabel tanggal={tanggal} />
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
        @media (max-width: 1023px) { .cat-grid { grid-template-columns: 1fr; gap: 32px; } }
      `}</style>
    </section>
  );
}