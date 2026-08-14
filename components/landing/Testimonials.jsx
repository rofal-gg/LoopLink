"use client";

import { useState, useRef } from "react";
import { Quote, Star } from "lucide-react";
import { Eyebrow, useInView } from "./shared";

/* ─── Testimonials ─── */
export default function Testimonials() {
  const { ref, inView } = useInView();
  const items = [
    { quote: "Dulu kardus bekas pabrik kami langsung dibuang. Sekarang ada yang ambil tiap dua minggu - malah dapat penghasilan tambahan.", name: "Budi Santoso", role: "Pemilik Pabrik Tekstil, Tangerang", initials: "BS", metric: "~400 kg", metricLabel: "limbah/bulan terselamatkan" },
    { quote: "Saya cari botol PET bersih buat bahan baku tas daur ulang. LoopLink langsung tunjukkan 7 listing dalam radius 5 km dari rumah saya.", name: "Sari Dewi", role: "Pengrajin UMKM, Depok", initials: "SD", metric: "7 listing", metricLabel: "ditemukan dalam 5 km" },
    { quote: "AI-nya akurat banget. Foto yang saya upload, langsung tahu itu limbah logam campuran - padahal saya sendiri tidak tahu kategorinya.", name: "Rizky Pratama", role: "Kontraktor Renovasi, Bekasi", initials: "RP", metric: "< 3 menit", metricLabel: "dari foto ke listing tayang" },
  ];
  return (
    <section
      ref={ref}
      className={`reveal${inView ? " in-view" : ""}`}
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
          <div style={{ display: "flex", gap: 4 }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={18} fill="#E8752C" color="#E8752C" />
            ))}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "#8C9184", marginLeft: 8, alignSelf: "center" }}>
              4.9 / 5 dari 1.200+ ulasan
            </span>
          </div>
        </div>
        <div className="testi-grid">
          {items.map((t, i) => (
            <TestiCard key={i} {...t} delay={i * 80} inView={inView} />
          ))}
        </div>
      </div>
      <style>{`
        .testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        @media (max-width: 767px) { .testi-grid { grid-template-columns: 1fr; } }
        @media (min-width: 768px) and (max-width: 1023px) { .testi-grid { grid-template-columns: 1fr; gap: 20px; } }
      `}</style>
    </section>
  );
}

function TestiCard({ quote, name, role, initials, metric, metricLabel, delay, inView }) {
  const ref = useRef(null);
  const [mousePos, setMousePos] = useState({ x: "50%", y: "50%" });
  const [hovered, setHovered] = useState(false);

  const onMove = (e) => {
    const el = ref.current;
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
    ref.current.style.transform =
      "perspective(700px) rotateY(0) rotateX(0) translateZ(0)";
    ref.current.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1)";
    setHovered(false);
  };

  return (
    <div className={`reveal${inView ? " in-view" : ""}`} style={{ transitionDelay: `${delay}ms` }}>
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
          <div>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1C2B22", margin: 0 }}>{name}</p>
            <p style={{ color: "#8C9184", fontSize: "0.8rem", margin: 0, fontFamily: "var(--font-mono)" }}>{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
