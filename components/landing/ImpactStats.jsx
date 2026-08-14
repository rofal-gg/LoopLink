"use client";

import { useState } from "react";
import {
  Package,
  Scale,
  MapPinned,
  CheckSquare,
  Users,
  Globe,
} from "lucide-react";
import { Eyebrow, useInView, useCountUp } from "./shared";

/* ─── Impact Stats ─── */
const statData = [
  { SIcon: Package, raw: 12400, dec: 0, suf: "+", label: "Listing Aktif", unit: "item" },
  { SIcon: Scale, raw: 84200, dec: 0, suf: "", label: "Kg Limbah Terselamatkan", unit: "kg" },
  { SIcon: MapPinned, raw: 4.8, dec: 1, suf: "", label: "Rata-rata Jarak Pertukaran", unit: "km" },
  { SIcon: CheckSquare, raw: 9300, dec: 0, suf: "+", label: "Klaim Berhasil", unit: "transaksi" },
  { SIcon: Users, raw: 21700, dec: 0, suf: "+", label: "Pengguna Aktif", unit: "member" },
  { SIcon: Globe, raw: 127, dec: 0, suf: "", label: "Kota Terjangkau", unit: "kota" },
];

export default function ImpactStats() {
  const { ref, inView } = useInView(0.2);
  return (
    <section
      ref={ref}
      className={`reveal${inView ? " in-view" : ""}`}
      style={{ backgroundColor: "#DCE3D3", padding: "48px 0 80px" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow>Dampak Nyata</Eyebrow>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "#1C2B22",
              fontSize: "clamp(1.5rem,3vw,2rem)",
              margin: "10px 0 0",
            }}
          >
            Angka yang terus tumbuh, bersama komunitas.
          </p>
        </div>
        <div className="stats-grid">
          {statData.map((s, i) => (
            <StatCard key={i} {...s} trigger={inView} />
          ))}
        </div>
      </div>
      <style>{`
        .stats-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 14px; }
        @media (max-width: 1279px) { .stats-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 767px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>
    </section>
  );
}

function StatCard({ SIcon, raw, dec, suf, label, unit, trigger }) {
  const count = useCountUp(raw, dec, trigger);
  const formatted =
    raw >= 1000
      ? count.toLocaleString("id-ID", { maximumFractionDigits: dec })
      : count.toFixed(dec);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        backgroundColor: "#F6F3EA",
        borderRadius: 16,
        padding: "32px 24px",
        border: `1px solid ${hovered ? "#3C7A5C" : "#C8D4BF"}`,
        transition:
          "transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s, border-color 0.2s",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        boxShadow: hovered ? "0 20px 48px rgba(28,43,34,0.12)" : "none",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          position: "absolute",
          top: -24,
          right: -24,
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: hovered ? "rgba(60,122,92,0.08)" : "transparent",
          transition: "background-color 0.3s, transform 0.3s",
          transform: hovered ? "scale(2)" : "scale(1)",
        }}
      />
      <div
        style={{
          color: "#3C7A5C",
          marginBottom: 16,
          transition: "transform 0.3s",
          transform: hovered ? "rotate(-12deg) scale(1.2)" : "rotate(0) scale(1)",
        }}
      >
        <SIcon size={26} strokeWidth={1.7} />
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 600,
          fontSize: "clamp(1.6rem,2.5vw,2.2rem)",
          color: "#1C2B22",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {formatted}
        {suf}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.68rem",
          fontWeight: 500,
          color: "#3C7A5C",
          marginBottom: 6,
        }}
      >
        {unit}
      </div>
      <div style={{ color: "#8C9184", fontSize: "0.85rem", lineHeight: 1.4 }}>
        {label}
      </div>
    </div>
  );
}