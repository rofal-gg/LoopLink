"use client";

import {
  Upload,
  CheckCircle,
  Flame,
  Bell,
} from "lucide-react";

/* ─── Activity Ticker ─── */
export default function ActivityTicker() {
  const activities = [
    { icon: <Upload size={11} strokeWidth={2.5} />, text: "Agus W. upload 80 kg besi tua - Bekasi", time: "2 mnt lalu" },
    { icon: <CheckCircle size={11} strokeWidth={2.5} />, text: "Klaim berhasil - 45 kg PET - Cilincing", time: "5 mnt lalu" },
    { icon: <Flame size={11} strokeWidth={2.5} />, text: "12 pencari aktif mencari kardus saat ini", time: "Live" },
    { icon: <Upload size={11} strokeWidth={2.5} />, text: "Rina S. upload sisa kain perca 30 kg - Tangerang", time: "8 mnt lalu" },
    { icon: <CheckCircle size={11} strokeWidth={2.5} />, text: "Pertukaran selesai - 200 kg kardus - Cakung", time: "12 mnt lalu" },
    { icon: <Bell size={11} strokeWidth={2.5} />, text: "Listing baru: Botol kaca 60 kg - Bogor", time: "15 mnt lalu" },
    { icon: <Flame size={11} strokeWidth={2.5} />, text: "7 klaim aktif dalam 5 km radius Jakarta", time: "Live" },
    { icon: <Upload size={11} strokeWidth={2.5} />, text: "Hendra P. upload limbah elektronik - Depok", time: "19 mnt lalu" },
  ];
  const doubled = [...activities, ...activities];

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
            LIVE FEED
          </span>
        </div>
        <div style={{ overflow: "hidden", flex: 1, display: "flex", alignItems: "center" }}>
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
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "#8C9184", marginLeft: 4 }}>
                  {a.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
