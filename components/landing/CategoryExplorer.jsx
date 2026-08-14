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
} from "lucide-react";
import { P, Eyebrow, useInView } from "./shared";

/* ─── Category Explorer ─── */
export default function CategoryExplorer() {
  const { ref, inView } = useInView();
  const [activeIdx, setActiveIdx] = useState(0);
  const categories = [
    {
      icon: <Recycle size={20} strokeWidth={1.8} />,
      label: "Plastik",
      count: 3420,
      color: "#3C7A5C",
      img: "https://images.unsplash.com/photo-1591193686104-fddba4d0e4d8?w=800&h=500&fit=crop&auto=format",
      desc: "Botol PET, kantong HDPE, ember PP, pipa PVC - semua kategori plastik tersedia di platform kami.",
      tags: ["Botol PET", "Kantong HDPE", "Pipa PVC", "Ember PP", "Film Plastik"],
      tip: "Plastik bersih (tidak terkontaminasi makanan) memiliki nilai jual lebih tinggi.",
    },
    {
      icon: <FileText size={20} strokeWidth={1.8} />,
      label: "Kertas",
      count: 2810,
      color: "#E8752C",
      img: "https://images.unsplash.com/photo-1507560461415-997cd00bfd45?w=800&h=500&fit=crop&auto=format",
      desc: "Kardus, kertas HVS, koran bekas, hingga buku - semua bisa menjadi bahan baku baru.",
      tags: ["Kardus", "Kertas HVS", "Koran", "Majalah", "Box Packaging"],
      tip: "Kardus gelombang (corrugated) paling banyak dicari untuk packaging ulang.",
    },
    {
      icon: <Wrench size={20} strokeWidth={1.8} />,
      label: "Logam",
      count: 1960,
      color: "#8C9184",
      img: "https://images.unsplash.com/photo-1548373220-9a83eb96cdd7?w=800&h=500&fit=crop&auto=format",
      desc: "Besi tua, aluminium, tembaga, dan campuran logam lain yang bernilai tinggi di pasar daur ulang.",
      tags: ["Besi Tua", "Aluminium", "Tembaga", "Kuningan", "Seng"],
      tip: "Tembaga dan aluminium memiliki harga jual tertinggi per kg di kategori logam.",
    },
    {
      icon: <Sprout size={20} strokeWidth={1.8} />,
      label: "Organik",
      count: 2150,
      color: "#6bba91",
      img: "https://images.unsplash.com/photo-1587733761376-3f26fc81d17f?w=800&h=500&fit=crop&auto=format",
      desc: "Sisa dapur, daun kering, ampas kopi - dapat diolah menjadi kompos atau biogas.",
      tags: ["Sisa Dapur", "Daun Kering", "Ampas Kopi", "Serbuk Gergaji", "Kulit Buah"],
      tip: "Limbah organik yang sudah dipilah dapat langsung diambil oleh pembuatan kompos lokal.",
    },
    {
      icon: <Shirt size={20} strokeWidth={1.8} />,
      label: "Tekstil",
      count: 1340,
      color: "#9B6B9B",
      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=500&fit=crop&auto=format",
      desc: "Kain perca, pakaian bekas layak, serat tekstil - bahan baku UMKM kreatif yang berkembang pesat.",
      tags: ["Kain Perca", "Pakaian Bekas", "Benang Sisa", "Serat Kapas", "Denim"],
      tip: "Kain perca warna cerah banyak dicari pengrajin tas dan aksesori daur ulang.",
    },
  ];
  const active = categories[activeIdx];

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
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {categories.map((c, i) => (
              <button
                key={i}
                onClick={() => setActiveIdx(i)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 100,
                  border: `1.5px solid ${activeIdx === i ? active.color : "#DCE3D3"}`,
                  backgroundColor: activeIdx === i ? active.color : "transparent",
                  color: activeIdx === i ? "#F6F3EA" : "#8C9184",
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
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="cat-grid">
          <div style={{ borderRadius: 20, overflow: "hidden", position: "relative", height: 400 }}>
            <img
              src={active.img}
              alt={active.label}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.4s" }}
            />
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
                  {active.icon}
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
                  {active.count.toLocaleString("id-ID")}
                </span>{" "}
                listing tersedia
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" }}>
            <p style={{ color: "#8C9184", fontSize: "1rem", lineHeight: 1.8, margin: 0 }}>
              {active.desc}
            </p>
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
                {active.tags.map((tag, i) => (
                  <span
                    key={i}
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
            <Link
              className="btn-primary"
              href="/cari"
              style={{ ...P.base, padding: "13px 26px", fontSize: "0.9rem", alignSelf: "flex-start" }}
              onMouseEnter={(e) => P.on(e.currentTarget)}
              onMouseLeave={(e) => P.off(e.currentTarget)}
            >
              Jelajahi Kategori {active.label} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        .cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
        @media (max-width: 1023px) { .cat-grid { grid-template-columns: 1fr; gap: 32px; } }
      `}</style>
    </section>
  );
}