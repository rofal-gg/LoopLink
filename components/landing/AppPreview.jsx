"use client";

import { useState } from "react";
import { Upload, Search, CheckCircle } from "lucide-react";
import { Eyebrow } from "./shared";
import { SourceLabel, formatAngka, formatPersen } from "./format";

/* ─── App Preview ───
 * Ilustrasi ponsel tetap sebagai visual (bukan klaim data). Label angka
 * yang sebelumnya palsu ("94% akurat", "<3 detik", "23 listing di 5 km",
 * "Terkunci 24 jam") diganti dengan label jujur dari data.statistik atau
 * deskripsi fitur netral tanpa angka.
 */

export default function AppPreview({ statistik = null }) {
  const [activeScreen, setActiveScreen] = useState(0);

  const persen = statistik != null ? formatPersen(statistik.rata_rata_confidence) : null;
  const persenBulat =
    statistik?.rata_rata_confidence != null
      ? Math.round(Number(statistik.rata_rata_confidence) * 100)
      : null;
  const jumlahListing = statistik?.jumlah_listing ?? null;

  const screens = [
    { label: "Upload", icon: <Upload size={14} strokeWidth={2} /> },
    { label: "Temukan", icon: <Search size={14} strokeWidth={2} /> },
    { label: "Klaim", icon: <CheckCircle size={14} strokeWidth={2} /> },
  ];
  const screenContent = [
    {
      img: "https://images.unsplash.com/photo-1591193686104-fddba4d0e4d8?w=400&h=600&fit=crop&auto=format",
      title: "Foto langsung dikenali",
      subtitle: "AI memberi label + nilai keyakinan",
      tags: [
        "Plastik PET",
        persen ? `${persen} keyakinan` : "12 kelas limbah",
      ],
    },
    {
      img: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&h=600&fit=crop&auto=format",
      title: "Filter radius & kategori",
      subtitle: "Semua listing tersedia ditampilkan; jarak ditandai",
      tags: [
        jumlahListing != null ? `${formatAngka(jumlahListing)} listing tercatat` : "Semua listing tercatat",
        "Semua kategori",
      ],
    },
    {
      img: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=600&fit=crop&auto=format",
      title: "Klaim eksklusif",
      subtitle: "Chat langsung & konfirmasi serah terima",
      tags: ["Klaim eksklusif", "Chat langsung"],
    },
  ];
  const sc = screenContent[activeScreen];

  return (
    <section
      style={{
        backgroundColor: "#1C2B22",
        padding: "80px 0 100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* decorative */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -80,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div className="app-grid">
          <div>
            <Eyebrow light>Tampilan Aplikasi</Eyebrow>
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
              Desain yang terasa
              <br />
              <em style={{ fontWeight: 400, fontStyle: "italic", color: "#6bba91" }}>
                mudah sejak pertama.
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
              Antarmuka yang intuitif memastikan siapa pun - dari pengusaha
              besar hingga ibu rumah tangga - bisa langsung berkontribusi.
            </p>
            <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
              {screens.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveScreen(i)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: `1.5px solid ${
                      activeScreen === i ? "#3C7A5C" : "rgba(255,255,255,0.12)"
                    }`,
                    backgroundColor: activeScreen === i ? "#3C7A5C" : "transparent",
                    color: activeScreen === i ? "#F6F3EA" : "#8C9184",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "all 0.2s",
                  }}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 16,
                padding: "24px",
                border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: 32,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: "#F6F3EA",
                  margin: "0 0 6px",
                }}
              >
                {sc.title}
              </p>
              <p style={{ color: "#8C9184", fontSize: "0.85rem", margin: "0 0 16px" }}>
                {sc.subtitle}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {sc.tags.map((t, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 100,
                      backgroundColor: "rgba(60,122,92,0.2)",
                      border: "1px solid rgba(60,122,92,0.3)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.68rem",
                      color: "#6bba91",
                      fontWeight: 600,
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <SourceLabel tanggal={statistik?.tanggal_pembaruan ?? null} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            {/* Phone frame */}
            <div style={{ width: 280, position: "relative" }}>
              <div
                style={{
                  backgroundColor: "#111A14",
                  borderRadius: 44,
                  padding: 12,
                  boxShadow:
                    "0 32px 80px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.1)",
                }}
              >
                {/* notch */}
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 80,
                    height: 28,
                    backgroundColor: "#111A14",
                    borderRadius: 14,
                    zIndex: 10,
                  }}
                />
                <div style={{ borderRadius: 34, overflow: "hidden", position: "relative" }}>
                  <img
                    src={sc.img}
                    alt={sc.title}
                    style={{
                      width: "100%",
                      height: 460,
                      objectFit: "cover",
                      display: "block",
                      transition: "opacity 0.3s",
                    }}
                  />
                  {/* UI overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(28,43,34,0.9) 0%, transparent 50%)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: "rgba(246,243,234,0.12)",
                        backdropFilter: "blur(12px)",
                        borderRadius: 14,
                        padding: "12px 16px",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: "#6bba91",
                          fontWeight: 600,
                          marginBottom: 4,
                        }}
                      >
                        AI TERDETEKSI
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          color: "#F6F3EA",
                          fontSize: "0.9rem",
                        }}
                      >
                        {sc.tags[0]}
                      </div>
                      {persenBulat != null ? (
                        <div
                          style={{
                            marginTop: 8,
                            backgroundColor: "rgba(60,122,92,0.4)",
                            borderRadius: 4,
                            height: 4,
                          }}
                        >
                          <div
                            style={{
                              width: `${persenBulat}%`,
                              height: "100%",
                              backgroundColor: "#6bba91",
                              borderRadius: 4,
                            }}
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            marginTop: 8,
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.65rem",
                            color: "#6bba91",
                          }}
                        >
                          12 kelas limbah
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* floating badge */}
              <div
                style={{
                  position: "absolute",
                  top: 60,
                  right: -36,
                  backgroundColor: "#F6F3EA",
                  borderRadius: 12,
                  padding: "10px 14px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                  border: "1px solid #DCE3D3",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    color: "#3C7A5C",
                    fontWeight: 700,
                  }}
                >
                  {persen ? `${persen} rata-rata keyakinan AI` : "AI terlatih pada 12 kelas limbah"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .app-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 64px; align-items: center; }
        @media (max-width: 1023px) { .app-grid { grid-template-columns: 1fr; gap: 48px; } }
      `}</style>
    </section>
  );
}