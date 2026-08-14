"use client";

import { useState } from "react";
import { Mail, ChevronRight, CheckCircle } from "lucide-react";
import { P, useInView } from "./shared";

/* ─── Newsletter ─── */
export default function Newsletter() {
  const { ref, inView } = useInView();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section
      ref={ref}
      className={`reveal${inView ? " in-view" : ""}`}
      style={{ backgroundColor: "#fff", padding: "80px 0" }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "#DCE3D3",
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 24,
          }}
        >
          <Mail size={12} color="#3C7A5C" strokeWidth={2.5} />
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
            Newsletter Mingguan
          </span>
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            color: "#1C2B22",
            fontSize: "clamp(1.8rem,4vw,2.8rem)",
            lineHeight: 1.1,
            margin: "0 0 16px",
          }}
        >
          Tetap terhubung dengan
          <br />
          <em style={{ fontStyle: "italic", fontWeight: 400, color: "#3C7A5C" }}>peluang terdekat.</em>
        </h2>
        <p
          style={{
            color: "#8C9184",
            fontSize: "0.95rem",
            lineHeight: 1.8,
            marginBottom: 40,
            maxWidth: 480,
            margin: "0 auto 40px",
          }}
        >
          Dapatkan ringkasan listing terbaru di areamu, tips daur ulang, dan
          update fitur LoopLink setiap minggu.
        </p>
        {!sent ? (
          <div style={{ display: "flex", gap: 10, maxWidth: 480, margin: "0 auto", flexWrap: "wrap" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              aria-label="Alamat email"
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: 10,
                border: "1.5px solid #DCE3D3",
                backgroundColor: "#F6F3EA",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                color: "#1C2B22",
                outline: "none",
                minWidth: 200,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#3C7A5C")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#DCE3D3")}
            />
            <button
              className="btn-primary"
              style={{ ...P.base, padding: "14px 24px", fontSize: "0.9rem", flexShrink: 0 }}
              onClick={() => email && setSent(true)}
              onMouseEnter={(e) => P.on(e.currentTarget)}
              onMouseLeave={(e) => P.off(e.currentTarget)}
            >
              Langganan <ChevronRight size={16} />
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              color: "#3C7A5C",
              fontFamily: "var(--font-mono)",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            <CheckCircle size={20} strokeWidth={2.5} /> Berhasil! Cek emailmu untuk konfirmasi.
          </div>
        )}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "#8C9184", marginTop: 16 }}>
          Tidak ada spam. Berhenti berlangganan kapan saja.
        </p>
      </div>
    </section>
  );
}
