"use client";

import { useState, useEffect } from "react";
import { Eyebrow, useInView } from "./shared";

/* ─── Environmental Progress ─── */
export default function EnvironmentalProgress() {
  const { ref, inView } = useInView(0.15);
  const goals = [
    { label: "Target 100 Ton Plastik 2025", current: 67, color: "#3C7A5C" },
    { label: "Kota Terjangkau dari 150 Target", current: 85, color: "#E8752C" },
    { label: "Pengguna Aktif dari 50.000 Target", current: 43, color: "#6bba91" },
    { label: "Emisi CO2 Dicegah (dari target 200 ton)", current: 58, color: "#9B6B9B" },
  ];
  return (
    <section
      ref={ref}
      className={`reveal${inView ? " in-view" : ""}`}
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
              Kami memantau progres dampak lingkungan secara transparan. Target
              kami ambisius - dan komunitas yang membuatnya tercapai.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {goals.map((g, i) => (
              <ProgressBar key={i} {...g} trigger={inView} delay={i * 120} />
            ))}
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

function ProgressBar({ label, current, color, trigger, delay }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const t = setTimeout(() => setWidth(current), delay);
    return () => clearTimeout(t);
  }, [trigger, current, delay]);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "#1C2B22", fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color, fontWeight: 700 }}>
          {current}%
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
    </div>
  );
}
