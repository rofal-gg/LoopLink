"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Camera,
  Zap,
  Globe,
  HandHelping,
  PackageCheck,
  ArrowRight,
} from "lucide-react";
import { P, Eyebrow, useInView } from "./shared";

/* ─── Process Steps ─── */
export default function ProcessSteps({ loggedIn = false }) {
  const { ref, inView } = useInView();
  const [hoveredStep, setHoveredStep] = useState(null);
  const steps = [
    { SIcon: Camera, label: "Upload Foto", desc: "Ambil atau pilih foto limbahmu langsung dari perangkat." },
    { SIcon: Zap, label: "AI Klasifikasi", desc: "Sistem mengenali jenis, kondisi, dan rekomendasi distribusi." },
    { SIcon: Globe, label: "Tayang & Ditemukan", desc: "Listingmu tampil ke pencari di radius yang kamu pilih." },
    { SIcon: HandHelping, label: "Klaim", desc: "Pencari bahan mengajukan klaim eksklusif pada listingmu." },
    { SIcon: PackageCheck, label: "Serah Terima", desc: "Konfirmasi selesai - limbah resmi berpindah tangan." },
  ];
  const isActive = useCallback(
    (i) => hoveredStep !== null && i <= hoveredStep,
    [hoveredStep]
  );

  return (
    <section
      id="cara-kerja"
      ref={ref}
      className={`reveal${inView ? " in-view" : ""}`}
      style={{ backgroundColor: "#1C2B22", padding: "60px 0 100px" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div className="process-grid">
          <div>
            <Eyebrow light>Cara Kerja</Eyebrow>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                color: "#F6F3EA",
                fontSize: "clamp(1.8rem,3.5vw,2.6rem)",
                lineHeight: 1.1,
                margin: "14px 0 8px",
              }}
            >
              Lima langkah,
            </h2>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "#6bba91",
                fontSize: "clamp(1.8rem,3.5vw,2.6rem)",
                lineHeight: 1.1,
                margin: "0 0 20px",
              }}
            >
              dari foto ke pertukaran.
            </h2>
            <p style={{ color: "#8C9184", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: 36 }}>
              Prosesnya dirancang sesimpel mungkin. Tidak ada formulir panjang.
              Tidak ada verifikasi berhari-hari.
            </p>
            <Link
              className="btn-primary"
              href={loggedIn ? "/upload" : "/register"}
              style={{ ...P.base, padding: "13px 26px", fontSize: "0.9rem" }}
              onMouseEnter={(e) => P.on(e.currentTarget)}
              onMouseLeave={(e) => P.off(e.currentTarget)}
            >
              Mulai Upload <ArrowRight size={16} />
            </Link>
          </div>
          <div className="process-steps-col">
            <div className="steps-h">
              <div style={{ position: "relative", display: "flex" }}>
                {steps.slice(0, -1).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      top: 28,
                      left: `calc(${(i / (steps.length - 1)) * 100}% + 28px)`,
                      width: `calc(${100 / (steps.length - 1)}% - 56px)`,
                      borderTop: `2px dashed ${
                        isActive(i) && isActive(i + 1) ? "#3C7A5C" : "rgba(255,255,255,0.1)"
                      }`,
                      transition: "border-color 0.25s",
                      zIndex: 0,
                    }}
                  />
                ))}
                {steps.map(({ SIcon, label, desc }, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      position: "relative",
                      zIndex: 1,
                    }}
                    onMouseEnter={() => setHoveredStep(i)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        backgroundColor: isActive(i) ? "#3C7A5C" : "#2A3D30",
                        border: `2px solid ${isActive(i) ? "#3C7A5C" : "rgba(255,255,255,0.08)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#F6F3EA",
                        marginBottom: 16,
                        flexShrink: 0,
                        boxShadow: isActive(i)
                          ? "0 0 0 8px rgba(60,122,92,0.2), 0 0 0 16px #1C2B22"
                          : "0 0 0 8px #1C2B22",
                        transition:
                          "background-color 0.22s, border-color 0.22s, box-shadow 0.22s, transform 0.22s",
                        transform: isActive(i) ? "scale(1.12)" : "scale(1)",
                      }}
                    >
                      <SIcon size={22} strokeWidth={1.8} />
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        color: isActive(i) ? "#3C7A5C" : "#8C9184",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        marginBottom: 6,
                        transition: "color 0.2s",
                      }}
                    >
                      0{i + 1}
                    </span>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        color: isActive(i) ? "#F6F3EA" : "#DCE3D3",
                        margin: "0 0 6px",
                        transition: "color 0.2s",
                      }}
                    >
                      {label}
                    </p>
                    <p style={{ color: "#8C9184", fontSize: "0.75rem", lineHeight: 1.5, margin: 0 }}>
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="steps-v">
              {steps.map(({ SIcon, label, desc }, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 16, alignItems: "flex-start", position: "relative" }}
                >
                  {i < steps.length - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        left: 23,
                        top: 52,
                        width: 2,
                        height: "calc(100% + 8px)",
                        background: "rgba(255,255,255,0.1)",
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      backgroundColor: "#3C7A5C",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#F6F3EA",
                      flexShrink: 0,
                    }}
                  >
                    <SIcon size={20} strokeWidth={1.8} />
                  </div>
                  <div style={{ paddingTop: 10 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#3C7A5C", fontWeight: 600 }}>
                      0{i + 1}
                    </span>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.9rem", color: "#F6F3EA", margin: "4px 0" }}>
                      {label}
                    </p>
                    <p style={{ color: "#8C9184", fontSize: "0.82rem", lineHeight: 1.5, margin: 0 }}>
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .process-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 64px; align-items: start; }
        .steps-h { display: block; }
        .steps-v { display: none; flex-direction: column; gap: 24px; }
        @media (max-width: 1023px) { .process-grid { grid-template-columns: 1fr; gap: 40px; } .steps-h { display: none; } .steps-v { display: flex; } }
      `}</style>
    </section>
  );
}
