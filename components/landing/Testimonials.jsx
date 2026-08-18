"use client";

import { useState, useRef } from "react";
import { Quote, MessageCircle } from "lucide-react";
import { Eyebrow } from "./shared";
import { inisial } from "./format";

/* ─── Testimonials ───
 * Konten dari data.testimoni (is_tampil = true, urut urutan). Kartu
 * menampilkan kutipan, nama, peran, metrik (kalau ada), dan badge sumber.
 * Baris "4.9/5 dari 1.200+ ulasan" diganti dengan jumlah konten nyata.
 * Kalau tidak ada testimoni → section tetap ada dengan notice lembut
 * (menjaga ritme wave antar section).
 */

export default function Testimonials({ testimoni = [] }) {
  const dataT = Array.isArray(testimoni) ? testimoni : [];

  const items = dataT.map((t) => ({
    quote: t.kutipan || "",
    name: t.nama || "Anggota",
    role: t.peran || "",
    initials: inisial(t.nama),
    metric: t.metrik || "",
    metricLabel: t.label_metrik || "",
    sumber: t.sumber || "",
  }));

  return (
    <section
      style={{ backgroundColor: "#fff", padding: "80px 0 100px" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
            marginBottom: 56,
          }}
        >
          <div>
            <Eyebrow>Cerita Nyata</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                color: "#1C2B22",
                fontSize: "clamp(1.8rem,4vw,3rem)",
                lineHeight: 1.05,
                margin: "12px 0 0",
              }}
            >
              Mereka sudah
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400, color: "#3C7A5C" }}>
                merasakan perbedaannya.
              </em>
            </h2>
          </div>
          {items.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MessageCircle size={14} strokeWidth={2} color="#3C7A5C" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#8C9184" }}>
                {items.length} konten testimoni komunitas
              </span>
            </div>
          )}
        </div>
        {items.length === 0 ? (
          <div
            style={{
              borderRadius: 16,
              backgroundColor: "#F6F3EA",
              border: "1px solid #DCE3D3",
              padding: "28px 24px",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "#8C9184",
            }}
          >
            Testimoni belum tersedia.
          </div>
        ) : (
          <div className="testi-grid">
            {items.map((t, i) => (
              <TestiCard key={i} {...t} />
            ))}
          </div>
        )}
      </div>
      <style>{`
        .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        @media (max-width: 767px) { .testi-grid { grid-template-columns: 1fr; } }
        @media (min-width: 768px) and (max-width: 1023px) { .testi-grid { grid-template-columns: 1fr; gap: 20px; } }
      `}</style>
    </section>
  );
}

function TestiCard({ quote, name, role, initials, metric, metricLabel, sumber }) {
  const ref = useRef(null);
  const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });
  const [hovered, setHovered] = useState(false);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(6px)`;
    el.style.transition = "transform 0.08s ease";
    setMousePos({
      x: `${((e.clientX - left) / width) * 100}%`,
      y: `${((e.clientY - top) / height) * 100}%`,
    });
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform =
      "perspective(700px) rotateY(0) rotateX(0) translateZ(0)";
    el.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1)";
    setHovered(false);
  };

  const showMetric = Boolean(metric && metricLabel);

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: "#F6F3EA",
        borderRadius: 20,
        padding: "32px 28px",
        border: `1px solid ${hovered ? "#3C7A5C" : "#DCE3D3"}`,
        boxShadow: hovered ? "0 24px 56px rgba(28,43,34,0.12)" : "0 2px 8px rgba(28,43,34,0.04)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        height: "100%",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle 200px at ${mousePos.x} ${mousePos.y}, rgba(60,122,92,0.07) 0%, transparent 70%)`,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            color: hovered ? "#3C7A5C" : "#DCE3D3",
            marginBottom: 20,
            transition: "color 0.25s, transform 0.25s",
            transform: hovered ? "rotate(-8deg) scale(1.1)" : "rotate(0) scale(1)",
          }}
        >
          <Quote size={32} strokeWidth={1.5} />
        </div>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "1.08rem",
            color: "#1C2B22",
            lineHeight: 1.65,
            margin: "0 0 28px",
            position: "relative",
          }}
        >
          &ldquo;{quote}&rdquo;
        </p>
        {showMetric && (
          <div
            style={{
              backgroundColor: hovered ? "#3C7A5C" : "#DCE3D3",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 24,
              transition: "background-color 0.25s",
              display: "inline-flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontWeight: 600,
                fontSize: "1.3rem",
                color: hovered ? "#F6F3EA" : "#1C2B22",
                lineHeight: 1,
                transition: "color 0.25s",
              }}
            >
              {metric}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                color: hovered ? "rgba(246,243,234,0.75)" : "#8C9184",
                marginTop: 3,
                transition: "color 0.25s",
              }}
            >
              {metricLabel}
            </span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 12, position: "relative" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              backgroundColor: "#3C7A5C",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.8rem", color: "#F6F3EA" }}>
              {initials}
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1C2B22", margin: 0 }}>{name}</p>
            <p style={{ color: "#8C9184", fontSize: "0.8rem", margin: 0, fontFamily: "var(--font-mono)" }}>
              {role || "Anggota komunitas"}
            </p>
            {sumber && (
              <span
                style={{
                  display: "inline-flex",
                  marginTop: 4,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.62rem",
                  color: "#3C7A5C",
                  backgroundColor: "#DCE3D3",
                  padding: "2px 8px",
                  borderRadius: 100,
                }}
              >
                Sumber: {sumber}
              </span>
            )}
          </div>
        </div>
      </div>
  );
}