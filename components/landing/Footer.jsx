"use client";

import { useState } from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { Mark } from "./shared";

/* ─── Footer ─── */
function SocialBtn({ label }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href="#"
      aria-label={label}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        border: `1px solid ${hovered ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.1)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: hovered ? "#F6F3EA" : "#8C9184",
        backgroundColor: hovered ? "rgba(255,255,255,0.06)" : "transparent",
        transition: "all 0.18s",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        minWidth: 36,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
    </a>
  );
}

export default function Footer() {
  const links = {
    Jelajahi: [
      { label: "Semua Listing", href: "/cari" },
      { label: "Kategori Limbah", href: "#kategori" },
      { label: "Cara Kerja", href: "#cara-kerja" },
      { label: "Peta Pertukaran", href: "#beranda" },
    ],
    Bantuan: [
      { label: "Cara Pakai", href: "#cara-kerja" },
      { label: "FAQ", href: "#bantuan" },
      { label: "Panduan AI", href: "#tentang" },
      { label: "Laporkan Masalah", href: "#bantuan" },
    ],
    Kontak: [
      { label: "hello@looplink.id", href: "mailto:hello@looplink.id" },
      { label: "Tentang Kami", href: "#tentang" },
      { label: "Masuk", href: "/login" },
      { label: "Daftar", href: "/register" },
    ],
  };
  return (
    <footer style={{ backgroundColor: "#111A14", padding: "64px 0 32px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div className="footer-grid">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <Mark />
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#F6F3EA", fontSize: "1.15rem" }}>
                LoopLink
              </span>
            </div>
            <p style={{ color: "#8C9184", fontSize: "0.85rem", lineHeight: 1.75, marginBottom: 24 }}>
              Menghubungkan limbah dengan peluang, di radius terdekatmu.
            </p>
            <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
              <SocialBtn label="Twitter / X" />
              <SocialBtn label="Instagram" />
              <SocialBtn label="LinkedIn" />
            </div>
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                padding: "14px 16px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#6bba91", fontWeight: 600, marginBottom: 4 }}>
                STATUS SISTEM
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#22c55e",
                    boxShadow: "0 0 0 2px rgba(34,197,94,0.2)",
                  }}
                />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#DCE3D3" }}>
                  Semua sistem berjalan normal
                </span>
              </div>
            </div>
          </div>
          {Object.entries(links).map(([col, items]) => (
            <div key={col}>
              <h4
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#F6F3EA",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 18,
                  marginTop: 0,
                }}
              >
                {col}
              </h4>
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      style={{
                        color: "#8C9184",
                        fontSize: "0.88rem",
                        textDecoration: "none",
                        transition: "color 0.15s, padding-left 0.15s",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#F6F3EA";
                        e.currentTarget.style.paddingLeft = "6px";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#8C9184";
                        e.currentTarget.style.paddingLeft = "0";
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: 24,
            marginTop: 64,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span style={{ color: "#8C9184", fontSize: "0.82rem" }}>
            © 2025 LoopLink. Hak cipta dilindungi.
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Kebijakan Privasi", "Syarat & Ketentuan", "Cookie"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  color: "#8C9184",
                  fontSize: "0.78rem",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F6F3EA")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#8C9184")}
              >
                {l}
              </a>
            ))}
          </div>
          <span style={{ color: "#8C9184", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6 }}>
            Dibuat dengan semangat daur ulang <Leaf size={13} color="#3C7A5C" strokeWidth={2} />
          </span>
        </div>
      </div>
      <style>{`
        .footer-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 48px; }
        @media (max-width: 767px) { .footer-grid { grid-template-columns: 1fr; gap: 32px; } }
        @media (min-width: 768px) and (max-width: 1023px) { .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; } }
      `}</style>
    </footer>
  );
}