"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Filter,
  Tag,
  Layers,
  Clock,
  Package,
} from "lucide-react";
import { Eyebrow, TiltCard, useInView } from "./shared";
import {
  SourceLabel,
  labelKategori,
  formatAngka,
  formatWaktuRelatif,
} from "./format";

/* ─── Featured Listings ───
 * Listing dari data.featured (status 'tersedia', terbaru dulu, max 6).
 * Semua field (foto, kategori, judul, jumlah+satuan, waktu) nyata dari DB.
 * Pilihan filter berasal dari data.kategori. Tidak ada lokasi/dist fiktif —
 * area meta menampilkan kategori + waktu relatif.
 */

export default function FeaturedListings({ featured = [], kategori = [] }) {
  const { ref, inView } = useInView();
  const dataList = Array.isArray(featured) ? featured : [];
  const dataKategori = Array.isArray(kategori) ? kategori : [];

  const filterOptions = [
    "Semua",
    ...dataKategori
      .map((k) => labelKategori(k.kategori_citra))
      .filter((label, idx, arr) => label && arr.indexOf(label) === idx),
  ];
  const [filterActive, setFilterActive] = useState("Semua");

  const filtered =
    filterActive === "Semua"
      ? dataList
      : dataList.filter((l) => labelKategori(l.kategori_citra) === filterActive);

  return (
    <section
      id="jelajah"
      ref={ref}
      className={`reveal${inView ? " in-view" : ""}`}
      style={{ backgroundColor: "#F6F3EA", padding: "60px 0 100px" }}
    >
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <Eyebrow>Listing Terbaru</Eyebrow>
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
              Sedang Dicari <em style={{ fontStyle: "italic", fontWeight: 400 }}>di Sekitarmu</em>
            </h2>
          </div>
          {dataList.length > 0 && (
            <Link
              href="/cari"
              style={{
                color: "#3C7A5C",
                fontWeight: 600,
                fontSize: "0.88rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "opacity 0.15s, transform 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.7";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              Lihat Semua <ArrowRight size={15} />
            </Link>
          )}
        </div>

        {dataList.length === 0 ? (
          <div
            style={{
              borderRadius: 16,
              backgroundColor: "#fff",
              border: "1px solid #DCE3D3",
              padding: "36px 28px",
              textAlign: "center",
            }}
          >
            <Package size={28} strokeWidth={1.6} color="#8C9184" style={{ margin: "0 auto 12px" }} />
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "1.1rem",
                color: "#1C2B22",
                margin: "0 0 6px",
              }}
            >
              Belum ada listing aktif
            </p>
            <p style={{ color: "#8C9184", fontSize: "0.9rem", margin: "0 0 20px" }}>
              Jadilah yang pertama mengunggah limbahmu.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                className="btn-primary"
                href="/upload"
                style={{ ...P.base, padding: "12px 24px", fontSize: "0.9rem" }}
                onMouseEnter={(e) => P.on(e.currentTarget)}
                onMouseLeave={(e) => P.off(e.currentTarget)}
              >
                Upload Limbah <ArrowRight size={16} />
              </Link>
              <Link
                href="/cari"
                style={{
                  backgroundColor: "transparent",
                  color: "#3C7A5C",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  borderRadius: 10,
                  border: "2px solid #3C7A5C",
                  cursor: "pointer",
                  padding: "12px 24px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  textDecoration: "none",
                  transition: "background-color 0.18s, transform 0.18s",
                  fontFamily: "var(--font-body)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#DCE3D3";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Cari Bahan
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Filter pills */}
            <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
              <span
                style={{
                  color: "#8C9184",
                  fontSize: "0.8rem",
                  fontFamily: "var(--font-mono)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Filter size={12} /> Filter:
              </span>
              {filterOptions.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterActive(f)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 100,
                    border: `1.5px solid ${filterActive === f ? "#3C7A5C" : "#DCE3D3"}`,
                    backgroundColor: filterActive === f ? "#3C7A5C" : "transparent",
                    color: filterActive === f ? "#F6F3EA" : "#8C9184",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.18s",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div
                style={{
                  borderRadius: 16,
                  backgroundColor: "#fff",
                  border: "1px solid #DCE3D3",
                  padding: "28px 24px",
                  textAlign: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.85rem",
                  color: "#8C9184",
                }}
              >
                Tidak ada listing untuk kategori ini saat ini.
              </div>
            ) : (
              <div className="listings-grid">
                {filtered.map((item) => (
                  <ListingCard key={item.listing_id} item={item} />
                ))}
              </div>
            )}
            <div className="listings-scroll-wrap">
              <div className="listings-scroll">
                {filtered.map((item) => (
                  <div key={item.listing_id} className="listing-card">
                    <ListingCard item={item} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 28, justifyContent: "flex-end" }}>
              <SourceLabel prefix="Sumber: listing tersedia LoopLink" />
            </div>
          </>
        )}
      </div>
      <style>{`
        .listings-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
        .listings-scroll-wrap { display: none; }
        @media (max-width: 767px) { .listings-grid { display: none; } .listings-scroll-wrap { display: block; } }
        @media (min-width: 768px) and (max-width: 1023px) { .listings-grid { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 1280px) { .listings-grid { grid-template-columns: repeat(3,1fr); } }
      `}</style>
    </section>
  );
}

function ListingCard({ item }) {
  const [hovered, setHovered] = useState(false);
  const cat = labelKategori(item.kategori_citra);
  const weight = `${formatAngka(item.jumlah)} ${item.satuan ?? ""}`.trim();
  const age = formatWaktuRelatif(item.created_at);

  return (
    <TiltCard
      intensity={6}
      style={{
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${hovered ? "#3C7A5C" : "#DCE3D3"}`,
        backgroundColor: "#fff",
        boxShadow: hovered
          ? "0 20px 48px rgba(28,43,34,0.14)"
          : "0 1px 4px rgba(28,43,34,0.04)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: "relative", height: 180, backgroundColor: "#DCE3D3", overflow: "hidden" }}>
        {item.foto_url ? (
          <img
            src={item.foto_url}
            alt={item.judul || cat}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: hovered ? "scale(1.06)" : "scale(1)",
              transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #3C7A5C 0%, #DCE3D3 140%)",
            }}
          >
            <Package size={40} strokeWidth={1.4} color="rgba(246,243,234,0.85)" />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(28,43,34,0.5) 0%, transparent 60%)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "rgba(60,122,92,0.9)",
            color: "#F6F3EA",
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            fontWeight: 500,
            padding: "3px 10px",
            borderRadius: 100,
          }}
        >
          Tersedia
        </span>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "10px 14px",
            transform: hovered ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
            opacity: hovered ? 1 : 0,
          }}
        >
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", color: "#F6F3EA", margin: 0 }}>
            {item.judul}
          </p>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.92rem", color: "#1C2B22", margin: "0 0 10px" }}>
          {item.judul}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ color: "#8C9184", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
            <Tag size={11} strokeWidth={2} /> {cat}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              color: "#3C7A5C",
              fontWeight: 600,
              backgroundColor: "#DCE3D3",
              padding: "2px 8px",
              borderRadius: 100,
            }}
          >
            {age || "baru saja"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 10,
            borderTop: "1px solid #F0EDE2",
          }}
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#8C9184", display: "flex", alignItems: "center", gap: 4 }}>
            <Layers size={10} strokeWidth={2} /> {weight}
          </span>
        </div>
      </div>
    </TiltCard>
  );
}