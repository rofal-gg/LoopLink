"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, TrendingUp, Users } from "lucide-react";
import { SourceLabel, formatAngka } from "./format";

/* ─── CTA Banner ───
 * Angka anggota berasal dari data.statistik.jumlah_anggota (nyata). Kalau
 * statistik null → teks netral tanpa klaim jumlah pengguna.
 */
export default function CTABanner({ loggedIn = false, data = null }) {
  const statistik = data?.statistik ?? null;
  const jumlahAnggota =
    statistik?.jumlah_anggota != null ? formatAngka(statistik.jumlah_anggota) : null;
  const labelAnggota = jumlahAnggota
    ? `Bergabung - ${jumlahAnggota} anggota aktif`
    : "Bergabung bersama komunitas LoopLink";
  const labelAvatar = jumlahAnggota
    ? `${jumlahAnggota} sudah bergabung`
    : "Bergabung bersama komunitas LoopLink";
  return (
    <section
      style={{ backgroundColor: "#3C7A5C", padding: "80px 0", position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -100, left: -60, width: 280, height: 280, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -60, left: -20, width: 160, height: 160, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "30%", left: "40%", width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
        <div className="cta-layout">
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: "rgba(255,255,255,0.12)",
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 24,
              }}
            >
              <Users size={12} color="rgba(246,243,234,0.85)" strokeWidth={2.5} />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "rgba(246,243,234,0.85)",
                  textTransform: "uppercase",
                }}
              >
                {labelAnggota}
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                color: "#F6F3EA",
                fontSize: "clamp(2.4rem,5vw,4rem)",
                lineHeight: 1.0,
                margin: "0 0 12px",
              }}
            >
              Mulai dari satu foto.
            </h2>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 400,
                fontStyle: "italic",
                color: "rgba(246,243,234,0.7)",
                fontSize: "clamp(2.4rem,5vw,4rem)",
                lineHeight: 1.0,
                margin: "0 0 28px",
              }}
            >
              Ubah limbahmu hari ini.
            </h2>
            <p style={{ color: "rgba(246,243,234,0.72)", fontSize: "1rem", lineHeight: 1.75, maxWidth: 480, marginBottom: 0 }}>
              Tidak perlu registrasi panjang. Tidak perlu verifikasi dokumen.
              Cukup foto, AI sisanya.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, justifyContent: "center" }}>
            <CTAButton icon={<Upload size={18} />} label="Upload Limbah Sekarang" primary href={loggedIn ? "/upload" : "/register"} />
            <CTAButton icon={<TrendingUp size={18} />} label="Lihat Listing Tersedia" primary={false} href="/cari" />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
              <div style={{ display: "flex" }}>
                {["BS", "SD", "RP", "AT"].map((ini, i) => (
                  <div
                    key={i}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      backgroundColor: `hsl(${140 + i * 20}, 35%, ${35 + i * 5}%)`,
                      border: "2px solid #3C7A5C",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginLeft: i > 0 ? -8 : 0,
                      zIndex: 4 - i,
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", fontWeight: 700, color: "#F6F3EA" }}>
                      {ini}
                    </span>
                  </div>
                ))}
              </div>
              <span style={{ color: "rgba(246,243,234,0.65)", fontSize: "0.82rem", fontFamily: "var(--font-mono)" }}>
                {labelAvatar}
              </span>
            </div>
            {statistik != null && (
              <div style={{ marginTop: 4 }}>
                <SourceLabel
                  tanggal={statistik.tanggal_pembaruan ?? null}
                  color="rgba(246,243,234,0.5)"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .cta-layout { display: grid; grid-template-columns: 1.2fr 1fr; gap: 64px; align-items: center; }
        @media (max-width: 1023px) { .cta-layout { grid-template-columns: 1fr; gap: 40px; } }
      `}</style>
    </section>
  );
}

function CTAButton({ icon, label, primary, href }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      style={{
        padding: "16px 28px",
        borderRadius: 12,
        fontWeight: 700,
        fontSize: "0.95rem",
        fontFamily: "var(--font-body)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        backgroundColor: primary ? (hovered ? "#1C2B22" : "#F6F3EA") : hovered ? "rgba(255,255,255,0.15)" : "transparent",
        color: primary ? "#1C2B22" : "#F6F3EA",
        border: primary ? "none" : "2px solid rgba(255,255,255,0.3)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? (primary ? "0 12px 32px rgba(28,43,34,0.3)" : "0 8px 24px rgba(0,0,0,0.15)") : "none",
        transition: "background-color 0.2s, transform 0.2s, box-shadow 0.2s, color 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon} {label}
    </Link>
  );
}
