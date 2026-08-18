"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Upload,
  Play,
  MapPin,
  Award,
  ShieldCheck,
  Leaf,
} from "lucide-react";
import { P, TiltCard } from "./shared";

/* ─── Hero ─── */
export default function Hero({ loggedIn = false }) {
  const cards = [
    {
      img: "https://images.unsplash.com/photo-1591193686104-fddba4d0e4d8?w=500&h=280&fit=crop&auto=format",
      cat: "Plastik",
      title: "45 kg Botol PET Bersih",
      loc: "Cilincing, Jakarta Utara",
      dist: "1.2 km",
    },
    {
      img: "https://images.unsplash.com/photo-1507560461415-997cd00bfd45?w=500&h=280&fit=crop&auto=format",
      cat: "Kertas",
      title: "Kardus Bekas Pabrik ~200 kg",
      loc: "Cakung, Jakarta Timur",
      dist: "3.4 km",
    },
  ];
  const trustBadges = [
    { icon: <Award size={13} strokeWidth={2} />, label: "Terverifikasi Kemenperin" },
    { icon: <ShieldCheck size={13} strokeWidth={2} />, label: "Data Terenkripsi" },
    { icon: <Leaf size={13} strokeWidth={2} />, label: "Carbon Neutral 2025" },
  ];

  return (
    <section
      id="beranda"
      className="hero-viewport"
      style={{
        backgroundColor: "#F6F3EA",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        className="hero-blob-1"
        style={{
          position: "absolute",
          right: "-5%",
          top: "50%",
          transform: "translateY(-50%)",
          width: "55%",
          height: "110%",
          backgroundColor: "#3C7A5C",
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          zIndex: 0,
        }}
      />
      <div
        className="hero-blob-2"
        style={{
          position: "absolute",
          right: "2%",
          top: "55%",
          transform: "translateY(-50%)",
          width: "42%",
          height: "85%",
          backgroundColor: "#DCE3D3",
          borderRadius: "50% 50% 30% 70% / 40% 60% 40% 60%",
          zIndex: 1,
        }}
      />
      <div
        className="hero-blob-mobile"
        style={{
          position: "absolute",
          bottom: -40,
          left: "-10%",
          right: "-10%",
          height: 160,
          backgroundColor: "#3C7A5C",
          borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
          zIndex: 0,
          display: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          width: "100%",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          role="group"
          aria-label="Logo institusi mitra"
          className="hero-partner-logos"
        >
          <img src="/UTM.webp" alt="UTM" />
          <img src="/TRIPLE-C.webp" alt="Triple C" />
          <img src="/TCC.webp" alt="TCC" className="hero-partner-tall" />
          <img src="/JACK%20TRIPLE-C.webp" alt="Jack" className="hero-partner-tall" />
        </div>

        <div className="hero-grid">
          <div className="hero-text">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#DCE3D3",
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 32,
              }}
            >
              <Leaf size={12} color="#3C7A5C" strokeWidth={2.5} />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "#3C7A5C",
                  textTransform: "uppercase",
                }}
              >
                EKONOMI SIRKULAR - BERDAMPAK NYATA
              </span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                color: "#1C2B22",
                lineHeight: 1.02,
                margin: "0 0 8px",
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
              }}
            >
              Limbahmu,
            </h1>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "#E8752C",
                lineHeight: 1.02,
                margin: "0 0 28px",
                fontSize: "clamp(2.8rem, 6vw, 5rem)",
              }}
            >
              Peluang Orang Lain.
            </h1>
            <p
              style={{
                color: "#8C9184",
                fontSize: "1.08rem",
                lineHeight: 1.78,
                maxWidth: 420,
                marginBottom: 44,
              }}
            >
              Platform yang menghubungkan pemilik limbah dengan pencari bahan
              alternatif di sekitar mereka. Satu akun, dua aksi - upload atau
              cari, kapan saja.
            </p>
            <div className="hero-ctas">
              <Link
                className="btn-primary"
                href={loggedIn ? "/upload" : "/register"}
                style={{ ...P.base, padding: "15px 30px", fontSize: "0.95rem" }}
                onMouseEnter={(e) => P.on(e.currentTarget)}
                onMouseLeave={(e) => P.off(e.currentTarget)}
              >
                <Upload size={18} /> Upload Limbah Sekarang
              </Link>
              <Link
                href="#cara-kerja"
                style={{
                  backgroundColor: "transparent",
                  color: "#3C7A5C",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  borderRadius: 10,
                  border: "2px solid #3C7A5C",
                  cursor: "pointer",
                  padding: "14px 28px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                  transition: "background-color 0.18s, transform 0.18s",
                  fontFamily: "var(--font-body)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#DCE3D3";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Play size={16} /> Lihat Cara Kerjanya
              </Link>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 40 }}>
              {trustBadges.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#8C9184",
                    fontSize: "0.78rem",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <span style={{ color: "#3C7A5C" }}>{b.icon}</span>
                  {b.label}
                </div>
              ))}
            </div>
          </div>

          <div className="hero-cards">
            {cards.map((item, i) => (
              <TiltCard
                key={i}
                intensity={8}
                style={{
                  backgroundColor: "#F6F3EA",
                  borderRadius: 16,
                  overflow: "hidden",
                  boxShadow: "0 12px 40px rgba(28,43,34,0.15)",
                  marginLeft: i === 1 ? 32 : 0,
                  marginBottom: i === 0 ? 16 : 0,
                }}
                className={`float-card-${i}`}
              >
                <div
                  style={{
                    position: "relative",
                    height: 140,
                    backgroundColor: "#DCE3D3",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: 10,
                      left: 10,
                      backgroundColor: "#E8752C",
                      color: "#fff",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 100,
                    }}
                  >
                    {item.cat}
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor: "rgba(60,122,92,0.9)",
                      color: "#F6F3EA",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      fontWeight: 500,
                      padding: "3px 10px",
                      borderRadius: 100,
                    }}
                  >
                    Tersedia
                  </span>
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: "0.92rem",
                      color: "#1C2B22",
                      margin: "0 0 4px",
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      color: "#8C9184",
                      fontSize: "0.8rem",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <MapPin size={11} strokeWidth={2} />
                    {item.loc} -{" "}
                    <span style={{ color: "#3C7A5C", fontWeight: 600 }}>
                      {item.dist}
                    </span>
                  </p>
                </div>
              </TiltCard>
            ))}
            {/* Live activity badge */}
            <div
              style={{
                marginTop: 16,
                backgroundColor: "#1C2B22",
                borderRadius: 14,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: "0 8px 32px rgba(28,43,34,0.3)",
              }}
            >
              <div style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                    animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  color: "#F6F3EA",
                  fontWeight: 500,
                }}
              >
                <span style={{ color: "#6bba91", fontWeight: 700 }}>
                  23 listing
                </span>{" "}
                baru dalam 1 jam terakhir
              </span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; padding: 48px 0 100px; }
        .hero-partner-logos { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 54px; margin-top: 72px; }
        .hero-partner-logos img { height: 75px; width: auto; object-fit: contain; opacity: 1; filter: none; transition: filter 0.2s ease, opacity 0.2s ease; }
        .hero-partner-logos img.hero-partner-tall { height: 96px; }
        .hero-partner-logos img:hover { filter: brightness(1.06); }
        .hero-ctas { display: flex; flex-wrap: wrap; gap: 12px; }
        .hero-cards { display: flex; flex-direction: column; position: relative; z-index: 3; }
        .hero-blob-1, .hero-blob-2 { display: block; }
        .hero-blob-mobile { display: none; }
        @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
        @media (max-width: 767px) {
          .hero-grid { grid-template-columns: 1fr; gap: 32px; padding: 36px 0 60px; }
          .hero-partner-logos { gap: 33px; margin-top: 54px; }
          .hero-partner-logos img { height: 51px; }
          .hero-partner-logos img.hero-partner-tall { height: 60px; }
          .hero-blob-1, .hero-blob-2 { display: none; }
          .hero-blob-mobile { display: block; }
          .hero-ctas { flex-direction: column; }
          .hero-ctas a { width: 100%; justify-content: center; }
          .float-card-0, .float-card-1 { margin-left: 0 !important; }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .hero-grid { grid-template-columns: 1fr 1fr; gap: 32px; padding: 44px 0 80px; }
        }
      `}</style>
    </section>
  );
}
