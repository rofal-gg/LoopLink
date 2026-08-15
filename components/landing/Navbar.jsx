"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight, RefreshCw } from "lucide-react";

/* Navbar 3 pill glass gelap — persis design reference. */
export default function Navbar({ loggedIn = false }) {
  const [open, setOpen] = useState(false);

  const links = [
    { label: "Beranda", href: "#beranda" },
    { label: "Cara Kerja", href: "#cara-kerja" },
    { label: "Kategori Limbah", href: "#kategori" },
    { label: "Tentang", href: "#tentang" },
    { label: "Bantuan", href: "#bantuan" },
  ];

  const NavPill = ({ label, href }) => {
    const [hovered, setHovered] = useState(false);
    return (
      <Link
        href={href}
        style={{
          padding: "6px 14px",
          borderRadius: 9,
          textDecoration: "none",
          fontSize: "0.85rem",
          fontWeight: 500,
          color: hovered ? "#F6F3EA" : "rgba(246,243,234,0.6)",
          background: hovered ? "rgba(255,255,255,0.1)" : "transparent",
          transition: "color 0.18s, background 0.18s",
          display: "block",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav style={{ fontFamily: "var(--font-body)", position: "sticky", top: 0, zIndex: 50 }}>
      {/* Three floating glass pills */}
      <div
        style={{
          maxWidth: 1380,
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* PILL 1 — Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            textDecoration: "none",
            flexShrink: 0,
            background: "rgba(28,43,34,0.42)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(107,186,145,0.2)",
            borderRadius: 14,
            padding: "10px 16px",
            boxShadow: "0 4px 20px rgba(28,43,34,0.18), inset 0 1px 0 rgba(255,255,255,0.07)",
            transition: "background 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(28,43,34,0.58)";
            e.currentTarget.style.boxShadow =
              "0 6px 28px rgba(28,43,34,0.28), inset 0 1px 0 rgba(255,255,255,0.09)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(28,43,34,0.42)";
            e.currentTarget.style.boxShadow =
              "0 4px 20px rgba(28,43,34,0.18), inset 0 1px 0 rgba(255,255,255,0.07)";
          }}
        >
          <span
            style={{
              backgroundColor: "#3C7A5C",
              borderRadius: 7,
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 1px rgba(107,186,145,0.35), 0 3px 10px rgba(60,122,92,0.45)",
              flexShrink: 0,
            }}
          >
            <RefreshCw size={14} color="#fff" strokeWidth={2.4} />
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "#F6F3EA",
              fontSize: "1.05rem",
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
            }}
          >
            LoopLink
          </span>
        </Link>

        {/* PILL 2 — Nav links (desktop only) */}
        <div
          className="lg-nav"
          style={{
            display: "none",
            alignItems: "center",
            gap: 2,
            background: "rgba(28,43,34,0.38)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 14,
            padding: "6px",
            boxShadow: "0 4px 20px rgba(28,43,34,0.14), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {links.map((l) => (
            <NavPill key={l.label} label={l.label} href={l.href} />
          ))}
        </div>

        {/* PILL 3 — Auth (desktop) + Hamburger (mobile) */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div
            className="lg-cta"
            style={{
              display: "none",
              alignItems: "center",
              gap: 6,
              background: "rgba(28,43,34,0.38)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 14,
              padding: "6px",
              boxShadow: "0 4px 20px rgba(28,43,34,0.14), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {loggedIn ? (
              <Link
                href="/home"
                style={{
                  background: "linear-gradient(135deg, #3C7A5C 0%, #2d5e46 100%)",
                  border: "1px solid rgba(107,186,145,0.35)",
                  color: "#F6F3EA",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  fontFamily: "var(--font-body)",
                  padding: "8px 18px",
                  borderRadius: 10,
                  textDecoration: "none",
                  boxShadow: "0 3px 12px rgba(60,122,92,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
                  transition: "transform 0.16s, box-shadow 0.16s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 22px rgba(60,122,92,0.5), inset 0 1px 0 rgba(255,255,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 3px 12px rgba(60,122,92,0.4), inset 0 1px 0 rgba(255,255,255,0.12)";
                }}
              >
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "rgba(246,243,234,0.72)",
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    padding: "7px 16px",
                    borderRadius: 10,
                    textDecoration: "none",
                    transition: "color 0.18s, background 0.18s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#F6F3EA";
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(246,243,234,0.72)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  style={{
                    background: "linear-gradient(135deg, #3C7A5C 0%, #2d5e46 100%)",
                    border: "1px solid rgba(107,186,145,0.35)",
                    color: "#F6F3EA",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    fontFamily: "var(--font-body)",
                    padding: "8px 18px",
                    borderRadius: 10,
                    textDecoration: "none",
                    boxShadow: "0 3px 12px rgba(60,122,92,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
                    transition: "transform 0.16s, box-shadow 0.16s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 22px rgba(60,122,92,0.5), inset 0 1px 0 rgba(255,255,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 3px 12px rgba(60,122,92,0.4), inset 0 1px 0 rgba(255,255,255,0.12)";
                  }}
                >
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            className="hamburger"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            style={{
              background: "rgba(28,43,34,0.42)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              cursor: "pointer",
              color: "#F6F3EA",
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.18s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(28,43,34,0.65)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(28,43,34,0.42)")}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className="mobile-menu"
        style={{
          background: "rgba(22,36,28,0.92)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          overflow: "hidden",
          maxHeight: open ? 500 : 0,
          transition: "max-height 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div
          style={{
            padding: "16px 24px 28px",
            borderBottom: "1px solid rgba(107,186,145,0.15)",
          }}
        >
          <ul
            style={{
              listStyle: "none",
              margin: "0 0 20px",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    color: "rgba(246,243,234,0.75)",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    textDecoration: "none",
                    borderRadius: 10,
                    transition: "color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#F6F3EA";
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(246,243,234,0.75)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {l.label}
                  <ChevronRight size={14} strokeWidth={2} style={{ opacity: 0.4 }} />
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: 10 }}>
            {loggedIn ? (
              <Link
                href="/home"
                onClick={() => setOpen(false)}
                style={{
                  flex: 1,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #3C7A5C 0%, #2d5e46 100%)",
                  border: "1px solid rgba(107,186,145,0.3)",
                  color: "#F6F3EA",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-body)",
                  padding: "12px 20px",
                  borderRadius: 12,
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(60,122,92,0.4)",
                }}
              >
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "rgba(246,243,234,0.85)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    fontFamily: "var(--font-body)",
                    padding: "12px 20px",
                    borderRadius: 12,
                    textDecoration: "none",
                  }}
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    background: "linear-gradient(135deg, #3C7A5C 0%, #2d5e46 100%)",
                    border: "1px solid rgba(107,186,145,0.3)",
                    color: "#F6F3EA",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    fontFamily: "var(--font-body)",
                    padding: "12px 20px",
                    borderRadius: 12,
                    textDecoration: "none",
                    boxShadow: "0 4px 16px rgba(60,122,92,0.4)",
                  }}
                >
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-nav { display: flex !important; }
          .lg-cta { display: flex !important; }
          .hamburger { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
