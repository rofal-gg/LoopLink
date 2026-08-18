"use client";

import { useEffect, useRef, useState } from "react";
import {
  Package,
  Layers,
  Scale,
  CheckSquare,
  Users,
  Sparkles,
} from "lucide-react";
import { Eyebrow, useCountUp } from "./shared";
import { SourceLabel } from "./format";

/* ─── Impact Stats ───
 * Kartu statistik ASULI dari data.statistik (hasil RPC `statistik_landing`).
 * Kalau `statistik` null → tampilkan notice lembut, bukan angka fiktif.
 * Section ini berlatar mist (#DCE3D3, beda dari halaman) jadi TIDAK memakai
 * efek masuk section (fade/slide). Trigger viewport di bawah hanya untuk
 * animasi count-up, bukan efek masuk section.
 */

/* Trigger satu kali saat section masuk viewport — HANYA untuk animasi isi
 * (count-up), section sendiri tidak boleh fade/slide. */
function useViewTrigger(threshold = 0.3) {
  const ref = useRef(null);
  const [fired, setFired] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || fired) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setFired(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [fired, threshold]);
  return { ref, fired };
}

function buatKartu(s) {
  if (!s) return [];
  return [
    {
      SIcon: Package,
      nilai: s.listing_tersedia ?? 0,
      dec: 0,
      kosong: s.listing_tersedia == null,
      label: "Listing Tersedia",
      unit: "listing aktif",
    },
    {
      SIcon: Layers,
      nilai: s.jumlah_listing ?? 0,
      dec: 0,
      kosong: s.jumlah_listing == null,
      label: "Total Listing Tercatat",
      unit: "listing",
    },
    {
      SIcon: Scale,
      nilai: s.kg_limbah_tercatat ?? 0,
      dec: 0,
      kosong: s.kg_limbah_tercatat == null,
      label: "Kg Limbah Tercatat",
      unit: "kg",
    },
    {
      SIcon: CheckSquare,
      nilai: s.klaim_selesai ?? 0,
      dec: 0,
      kosong: s.klaim_selesai == null,
      label: "Klaim Selesai",
      unit: "transaksi",
    },
    {
      SIcon: Users,
      nilai: s.jumlah_anggota ?? 0,
      dec: 0,
      kosong: s.jumlah_anggota == null,
      label: "Anggota Aktif",
      unit: "anggota",
    },
    {
      SIcon: Sparkles,
      nilai: s.rata_rata_confidence != null ? s.rata_rata_confidence * 100 : 0,
      dec: 1,
      kosong: s.rata_rata_confidence == null,
      label: "Rata-rata Keyakinan AI",
      unit: "%",
    },
  ];
}

export default function ImpactStats({ statistik = null }) {
  const { ref, fired } = useViewTrigger(0.3);
  const kartu = buatKartu(statistik);

  return (
    <section
      id="dampak"
      ref={ref}
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
          <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
            <SourceLabel tanggal={statistik?.tanggal_pembaruan ?? null} />
          </div>
        </div>
        {statistik ? (
          <div className="stats-grid">
            {kartu.map((s, i) => (
              <StatCard key={i} {...s} trigger={fired} />
            ))}
          </div>
        ) : (
          <div
            style={{
              borderRadius: 16,
              backgroundColor: "#F6F3EA",
              border: "1px solid #C8D4BF",
              padding: "28px 24px",
              textAlign: "center",
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "#8C9184",
            }}
          >
            Statistik belum tersedia.
          </div>
        )}
      </div>
      <style>{`
        .stats-grid { display: grid; grid-template-columns: repeat(6,1fr); gap: 14px; }
        @media (max-width: 1279px) { .stats-grid { grid-template-columns: repeat(3,1fr); } }
        @media (max-width: 767px) { .stats-grid { grid-template-columns: repeat(2,1fr); } }
      `}</style>
    </section>
  );
}

function StatCard({ SIcon, nilai, dec, kosong, label, unit, trigger }) {
  const count = useCountUp(kosong ? 0 : nilai, dec, trigger);
  const formatted = kosong
    ? "—"
    : nilai >= 1000
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