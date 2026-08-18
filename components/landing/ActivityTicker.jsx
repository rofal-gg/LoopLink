"use client";

import { Upload, CheckCircle } from "lucide-react";
import { formatWaktuRelatif, formatJumlah } from "./format";

/* ─── Activity Ticker ───
 * Feed aktivitas nyata dari data.aktivitas (max 8, terbaru dulu).
 * Label "AKTIVITAS" dipakai (bukan "LIVE FEED") supaya tidak overclaim.
 * Kalau tidak ada aktivitas → satu item statis yang jujur, tanpa feed
 * kosong berulang.
 */

export default function ActivityTicker({ aktivitas = [] }) {
  const dataAkt = Array.isArray(aktivitas) ? aktivitas : [];

  const items =
    dataAkt.length > 0
      ? dataAkt.map((a) => {
          const jumlah = formatJumlah(a);
          const isKlaim = a.tipe === "klaim";
          const text = isKlaim
            ? `Klaim selesai: ${a.judul || "listing"}${jumlah}`
            : `${a.nama || "Anggota"} upload ${a.judul || "listing"}${jumlah}`;
          return {
            icon: isKlaim ? (
              <CheckCircle size={11} strokeWidth={2.5} />
            ) : (
              <Upload size={11} strokeWidth={2.5} />
            ),
            text,
            time: formatWaktuRelatif(a.waktu),
          };
        })
      : null;

  const doubled = items ? [...items, ...items] : null;

  return (
    <div
      style={{
        backgroundColor: "#1C2B22",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <div
          style={{
            backgroundColor: "#3C7A5C",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              backgroundColor: "#6bba91",
              boxShadow: "0 0 0 3px rgba(107,186,145,0.3)",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#F6F3EA",
              letterSpacing: "0.08em",
              whiteSpace: "nowrap",
            }}
          >
            AKTIVITAS
          </span>
        </div>
        <div style={{ overflow: "hidden", flex: 1, display: "flex", alignItems: "center" }}>
          {doubled ? (
            <div style={{ display: "flex", animation: "ticker 40s linear infinite", gap: 0 }}>
              {doubled.map((a, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 28px",
                    borderRight: "1px solid rgba(255,255,255,0.04)",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span style={{ color: "#6bba91" }}>{a.icon}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#DCE3D3" }}>
                    {a.text}
                  </span>
                  {a.time && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#8C9184", marginLeft: 4 }}>
                      {a.time}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "12px 28px",
                whiteSpace: "nowrap",
              }}
            >
              <Upload size={11} strokeWidth={2.5} color="#6bba91" />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "#DCE3D3" }}>
                Belum ada aktivitas baru - jadilah yang pertama berbagi limbah.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}