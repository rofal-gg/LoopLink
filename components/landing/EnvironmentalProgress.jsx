"use client";

import { useEffect, useRef, useState } from "react";
import { Eyebrow } from "./shared";
import { SourceLabel, formatAngka, persenProgres } from "./format";

/* ─── Environmental Progress ───
 * Progres nyata dari data.statistik dibandingkan TARGET PROGRAM INTERNAL
 * (target dipatok sebagai komitmen produk, bukan klaim pasar).
 * Kalau `statistik` null → notice lembut "Statistik belum tersedia."
 * (progres 0% tidak boleh ditampilkan sebagai data palsu).
 */

const TARGET_INTERNAL = [
  { key: "kg_limbah_tercatat", label: "Kg limbah tercatat", target: 10000, unit: "kg", color: "#3C7A5C" },
  { key: "listing_tersedia", label: "Listing tersedia", target: 100, unit: "listing", color: "#E8752C" },
  { key: "klaim_selesai", label: "Klaim selesai", target: 50, unit: "transaksi", color: "#6bba91" },
  { key: "jumlah_anggota", label: "Anggota aktif", target: 1000, unit: "anggota", color: "#9B6B9B" },
];

/* Trigger satu kali saat section masuk viewport — HANYA untuk animasi isi
 * (pengisian progress bar), section sendiri tidak boleh fade/slide. */
function useViewTrigger(threshold = 0.25) {
  const ref = useRef(null);
  const [fired, setFired] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || fired) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setFired(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fired, threshold]);
  return { ref, fired };
}

export default function EnvironmentalProgress({ statistik = null }) {
  const { ref, fired } = useViewTrigger(0.25);

  const goals =
    statistik != null
      ? TARGET_INTERNAL.map((t) => {
          const nilai = Number(statistik[t.key] ?? 0);
          return {
            label: t.label,
            values: `${formatAngka(nilai)} / ${formatAngka(t.target)} ${t.unit}`,
            percent: persenProgres(nilai, t.target),
            color: t.color,
          };
        })
      : null;

  return (
    <section
      ref={ref}
      style={{ backgroundColor: "#DCE3D3", padding: "80px 0" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div className="env-grid">
          <div>
            <Eyebrow>Misi Lingkungan</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                color: "#1C2B22",
                fontSize: "clamp(1.7rem,3.5vw,2.4rem)",
                lineHeight: 1.15,
                margin: "12px 0 16px",
              }}
            >
              Setiap pertukaran
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>mendekatkan target.</em>
            </h2>
            <p style={{ color: "#8C9184", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: 0 }}>
              Kami memantau progres dampak secara transparan terhadap target
              program internal. Komunitas yang membuat target itu tercapai.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#3C7A5C",
                margin: 0,
              }}
            >
              Target program internal
            </div>
            {goals ? (
              goals.map((g, i) => (
                <ProgressBar key={g.label} {...g} trigger={fired} delay={i * 120} />
              ))
            ) : (
              <div
                style={{
                  borderRadius: 14,
                  backgroundColor: "#F6F3EA",
                  border: "1px solid #C8D4BF",
                  padding: "24px 20px",
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "#8C9184",
                }}
              >
                Statistik belum tersedia.
              </div>
            )}
            {goals && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <SourceLabel tanggal={statistik?.tanggal_pembaruan ?? null} />
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .env-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 64px; align-items: center; }
        @media (max-width: 1023px) { .env-grid { grid-template-columns: 1fr; gap: 40px; } }
      `}</style>
    </section>
  );
}

function ProgressBar({ label, values, percent, color, trigger, delay }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const t = setTimeout(() => setWidth(percent), delay);
    return () => clearTimeout(t);
  }, [trigger, percent, delay]);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "#1C2B22", fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color, fontWeight: 700 }}>
          {percent}%
        </span>
      </div>
      <div style={{ height: 8, backgroundColor: "rgba(28,43,34,0.1)", borderRadius: 100, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${width}%`,
            backgroundColor: color,
            borderRadius: 100,
            transition: "width 1.2s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          color: "#8C9184",
          marginTop: 6,
        }}
      >
        {values}
      </div>
    </div>
  );
}