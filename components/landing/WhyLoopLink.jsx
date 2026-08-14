"use client";

import Link from "next/link";
import { CheckCircle, X, ArrowUpRight } from "lucide-react";
import { P, Eyebrow, Mark, useInView } from "./shared";

/* ─── Comparison / Why LoopLink ─── */
export default function WhyLoopLink() {
  const { ref, inView } = useInView();
  const rows = [
    { feature: "Klasifikasi limbah", looplink: true, traditional: false, pengepul: false },
    { feature: "Radius & peta interaktif", looplink: true, traditional: false, pengepul: false },
    { feature: "Klaim eksklusif terstruktur", looplink: true, traditional: false, pengepul: false },
    { feature: "Chat terenkripsi langsung", looplink: true, traditional: false, pengepul: true },
    { feature: "Gratis tanpa biaya listing", looplink: true, traditional: true, pengepul: false },
    { feature: "Data dampak lingkungan", looplink: true, traditional: false, pengepul: false },
    { feature: "Komunitas & komunitas aktif", looplink: true, traditional: false, pengepul: false },
  ];
  return (
    <section
      id="tentang"
      ref={ref}
      className={`reveal${inView ? " in-view" : ""}`}
      style={{ backgroundColor: "#F6F3EA", padding: "60px 0 100px" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <Eyebrow>Kenapa LoopLink?</Eyebrow>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "#1C2B22",
              fontSize: "clamp(1.7rem,3.5vw,2.4rem)",
              lineHeight: 1.15,
              margin: "12px 0 0",
            }}
          >
            Lebih dari sekadar <em style={{ fontStyle: "italic", fontWeight: 400 }}>jual-beli limbah biasa.</em>
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: "16px 20px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.7rem",
                    color: "#8C9184",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #DCE3D3",
                  }}
                >
                  Fitur
                </th>
                <th style={{ padding: "16px 20px", textAlign: "center", borderBottom: "1px solid #DCE3D3" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                    <Mark size={24} />
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#1C2B22", fontSize: "0.95rem" }}>
                      LoopLink
                    </span>
                  </div>
                </th>
                <th
                  style={{
                    padding: "16px 20px",
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.78rem",
                    color: "#8C9184",
                    fontWeight: 600,
                    borderBottom: "1px solid #DCE3D3",
                  }}
                >
                  Marketplace Biasa
                </th>
                <th
                  style={{
                    padding: "16px 20px",
                    textAlign: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.78rem",
                    color: "#8C9184",
                    fontWeight: 600,
                    borderBottom: "1px solid #DCE3D3",
                  }}
                >
                  Pengepul Tradisional
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#F6F3EA" }}>
                  <td
                    style={{
                      padding: "15px 20px",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                      color: "#1C2B22",
                      borderBottom: "1px solid #F0EDE2",
                    }}
                  >
                    {row.feature}
                  </td>
                  <td style={{ padding: "15px 20px", textAlign: "center", borderBottom: "1px solid #F0EDE2" }}>
                    <CheckCircle size={18} color="#3C7A5C" strokeWidth={2.5} />
                  </td>
                  <td style={{ padding: "15px 20px", textAlign: "center", borderBottom: "1px solid #F0EDE2" }}>
                    {row.traditional ? (
                      <CheckCircle size={18} color="#3C7A5C" strokeWidth={2.5} />
                    ) : (
                      <X size={18} color="#DCE3D3" strokeWidth={2.5} />
                    )}
                  </td>
                  <td style={{ padding: "15px 20px", textAlign: "center", borderBottom: "1px solid #F0EDE2" }}>
                    {row.pengepul ? (
                      <CheckCircle size={18} color="#3C7A5C" strokeWidth={2.5} />
                    ) : (
                      <X size={18} color="#DCE3D3" strokeWidth={2.5} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            marginTop: 40,
            backgroundColor: "#1C2B22",
            borderRadius: 20,
            padding: "32px 36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "#F6F3EA", fontSize: "1.2rem", margin: "0 0 6px" }}>
              Mulai hari ini, gratis selamanya.
            </p>
            <p style={{ color: "#8C9184", fontSize: "0.9rem", margin: 0 }}>
              Tanpa kartu kredit. Tanpa kontrak. Langsung aktif.
            </p>
          </div>
          <Link
            className="btn-primary"
            href="/register"
            style={{ ...P.base, padding: "14px 28px", fontSize: "0.95rem", flexShrink: 0 }}
            onMouseEnter={(e) => P.on(e.currentTarget)}
            onMouseLeave={(e) => P.off(e.currentTarget)}
          >
            Daftar Gratis <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
