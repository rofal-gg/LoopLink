"use client";

import { useState } from "react";
import { ArrowRight, Sprout, Recycle, Wrench, FileText, Shirt } from "lucide-react";
import { P, Eyebrow } from "./shared";
import { SourceLabel, formatAngka, formatPersen } from "./format";

/* ─── Trust Band ───
 * Klaim AI disesuaikan dengan data nyata:
 *   - "94% akurasi" → rata-rata keyakinan AI dari data.statistik (atau "—").
 *   - "<3s klasifikasi" (tidak bisa diverifikasi) → jumlah listing tersedia.
 *   - "50+ jenis limbah" → 12 kelas limbah model (jumlah kelas model AI).
 */

export default function TrustBand({ statistik = null }) {
  const persen = statistik ? formatPersen(statistik.rata_rata_confidence) : "—";
  const listing = statistik ? formatAngka(statistik.listing_tersedia) : "—";

  const stats = [
    { val: persen, label: "Rata-rata keyakinan AI (dari data listings)" },
    { val: listing, label: "Listing tersedia" },
    { val: "12", label: "Kelas limbah model" },
  ];

  const categories = [
    { CatIcon: Sprout, label: "Organik" },
    { CatIcon: Recycle, label: "Plastik" },
    { CatIcon: Wrench, label: "Logam" },
    { CatIcon: FileText, label: "Kertas" },
    { CatIcon: Shirt, label: "Tekstil" },
  ];

  return (
    <section
      style={{ backgroundColor: "#1C2B22", padding: "60px 0 100px" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div className="trust-grid">
          <div>
            <Eyebrow light>Teknologi Klasifikasi</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                color: "#F6F3EA",
                fontSize: "clamp(1.8rem,3.5vw,2.6rem)",
                lineHeight: 1.1,
                margin: "14px 0 20px",
              }}
            >
              Didukung Klasifikasi AI
              <br />
              <em style={{ fontWeight: 400, fontStyle: "italic", color: "#6bba91" }}>
                untuk Beragam Limbah
              </em>
            </h2>
            <p
              style={{
                color: "#8C9184",
                fontSize: "0.95rem",
                lineHeight: 1.8,
                marginBottom: 36,
              }}
            >
              Model AI kami terlatih mengenali beragam jenis limbah dari foto
              saja. Cukup ambil gambar - sistem langsung memberi label,
              kategori, dan nilai keyakinan.
            </p>
            <div style={{ display: "flex", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
              {stats.map((s, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: "1.6rem",
                      color: "#6bba91",
                      lineHeight: 1,
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.7rem",
                      color: "#8C9184",
                      marginTop: 4,
                      maxWidth: 180,
                      lineHeight: 1.5,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 36 }}>
              <SourceLabel
                tanggal={statistik?.tanggal_pembaruan ?? null}
                color="#8C9184"
              />
            </div>
            <a
              className="btn-primary"
              href="/upload"
              style={{ ...P.base, padding: "13px 26px", fontSize: "0.9rem" }}
              onMouseEnter={(e) => P.on(e.currentTarget)}
              onMouseLeave={(e) => P.off(e.currentTarget)}
            >
              Coba Klasifikasi Sekarang <ArrowRight size={16} />
            </a>
          </div>
          <div className="trust-badges">
            {categories.map(({ CatIcon, label }, i) => (
              <TrustBadge key={i} CatIcon={CatIcon} label={label} />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .trust-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .trust-badges { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; }
        @media (max-width: 767px) { .trust-grid { grid-template-columns: 1fr; gap: 40px; } .trust-badges { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; } }
        @media (min-width: 768px) and (max-width: 1023px) { .trust-grid { grid-template-columns: 1fr; gap: 40px; } .trust-badges { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; } }
      `}</style>
    </section>
  );
}

function TrustBadge({ CatIcon, label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        width: 110,
        height: 110,
        borderRadius: "50%",
        border: `2px solid ${hovered ? "#E8752C" : "rgba(255,255,255,0.14)"}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "border-color 0.22s, transform 0.22s, box-shadow 0.22s",
        transform: hovered ? "scale(1.12) translateY(-4px)" : "scale(1)",
        boxShadow: hovered ? "0 0 0 6px rgba(232,117,44,0.12)" : "none",
        cursor: "default",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <CatIcon
        size={hovered ? 30 : 24}
        strokeWidth={1.8}
        color={hovered ? "#E8752C" : "#DCE3D3"}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          fontWeight: 600,
          color: hovered ? "#E8752C" : "#F6F3EA",
          letterSpacing: "0.04em",
          transition: "color 0.2s",
        }}
      >
        {label}
      </span>
    </div>
  );
}