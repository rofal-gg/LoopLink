"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Cpu,
  MapPin,
  ShieldCheck,
  Leaf,
  MessageCircle,
} from "lucide-react";
import { Eyebrow, useInView } from "./shared";

/* ─── Features ─── */
export default function Features() {
  const features = [
    { FIcon: Upload, title: "Satu Akun, Dua Aksi", desc: "Upload atau cari bahan - semua dalam satu akun yang sama." },
    { FIcon: Cpu, title: "Klasifikasi Otomatis AI", desc: "Foto limbah langsung dikenali. Tidak perlu isi kategori manual." },
    { FIcon: MapPin, title: "Radius yang Kamu Atur", desc: "Temukan peluang di sekitar lokasimu, filter jarak sesukamu." },
    { FIcon: ShieldCheck, title: "Klaim Aman Satu Pihak", desc: "Klaim eksklusif - satu item, satu klaim aktif, tanpa tabrakan." },
    { FIcon: Leaf, title: "Kurangi ke TPA", desc: "Setiap transaksi adalah sampah yang tidak berakhir di TPA." },
    { FIcon: MessageCircle, title: "Kontak Langsung", desc: "Chat terenkripsi langsung ke pemilik listing, tanpa biaya." },
  ];
  return (
    <section id="fitur" style={{ backgroundColor: "#F6F3EA", padding: "100px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 24,
            marginBottom: 60,
            alignItems: "flex-end",
          }}
        >
          <div>
            <Eyebrow>Fitur Platform</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "#1C2B22",
                fontSize: "clamp(1.8rem,4vw,2.8rem)",
                lineHeight: 1.1,
                margin: "12px 0 0",
              }}
            >
              Semua yang kamu butuhkan,
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>
                dalam satu tempat.
              </em>
            </h2>
          </div>
          <p
            style={{
              color: "#8C9184",
              fontSize: "0.95rem",
              lineHeight: 1.8,
              maxWidth: 280,
              fontFamily: "var(--font-body)",
            }}
          >
            Dirancang sesederhana mungkin - siapa saja bisa langsung
            berkontribusi pada ekonomi sirkular.
          </p>
        </div>
        <div className="features-grid">
          {features.map(({ FIcon, title, desc }, i) => (
            <FeatureCard key={i} FIcon={FIcon} title={title} desc={desc} delay={i * 55} />
          ))}
        </div>
      </div>
      <style>{`
        .features-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 14px; }
        @media (max-width: 1279px) { .features-grid { grid-template-columns: repeat(3,1fr); } }
        @media (min-width: 768px) and (max-width: 1023px) { .features-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 767px) { .features-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

function FeatureCard({ FIcon, title, desc, delay }) {
  const { ref, inView } = useInView(0.1);
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const onMove = (e) => {
    const el = cardRef.current;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    el.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(8px)`;
    el.style.transition = "transform 0.08s ease";
  };
  const onLeave = () => {
    cardRef.current.style.transform =
      "perspective(600px) rotateY(0) rotateX(0) translateZ(0)";
    cardRef.current.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1)";
    setHovered(false);
  };

  return (
    <div
      ref={ref}
      className={`reveal${inView ? " in-view" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        ref={cardRef}
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: "28px 20px",
          border: `1px solid ${hovered ? "#3C7A5C" : "#DCE3D3"}`,
          boxShadow: hovered
            ? "0 20px 48px rgba(60,122,92,0.18)"
            : "0 1px 4px rgba(28,43,34,0.04)",
          transition: "border-color 0.2s, box-shadow 0.2s",
          cursor: "default",
          position: "relative",
          overflow: "hidden",
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
            background:
              "radial-gradient(circle at 30% 30%, rgba(60,122,92,0.07) 0%, transparent 70%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: hovered ? "#3C7A5C" : "#DCE3D3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
            color: hovered ? "#F6F3EA" : "#3C7A5C",
            transition: "background-color 0.25s, color 0.25s, transform 0.25s",
            transform: hovered ? "rotate(-8deg) scale(1.1)" : "rotate(0) scale(1)",
            position: "relative",
          }}
        >
          <FIcon size={22} strokeWidth={1.8} />
        </div>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "#1C2B22",
            margin: "0 0 8px",
            position: "relative",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            color: "#8C9184",
            fontSize: "0.82rem",
            lineHeight: 1.65,
            margin: 0,
            position: "relative",
          }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}
