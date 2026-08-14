"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Filter,
  MapPin,
  Layers,
  Clock,
} from "lucide-react";
import { Eyebrow, TiltCard, useInView } from "./shared";

/* ─── Featured Listings ─── */
export default function FeaturedListings() {
  const { ref, inView } = useInView();
  const [filterActive, setFilterActive] = useState("Semua");
  const filters = ["Semua", "Plastik", "Kertas", "Logam", "Organik", "Tekstil"];
  const listings = [
    { img: "https://images.unsplash.com/photo-1591193686104-fddba4d0e4d8?w=600&h=400&fit=crop&auto=format", cat: "Plastik", title: "Botol PET Bersih 45 kg", loc: "Cilincing, Jak-Ut", dist: "1.2 km", weight: "45 kg", age: "2 jam lalu" },
    { img: "https://images.unsplash.com/photo-1507560461415-997cd00bfd45?w=600&h=400&fit=crop&auto=format", cat: "Kertas", title: "Kardus Pabrik ~200 kg", loc: "Cakung, Jak-Tim", dist: "3.4 km", weight: "200 kg", age: "5 jam lalu" },
    { img: "https://images.unsplash.com/photo-1548373220-9a83eb96cdd7?w=600&h=400&fit=crop&auto=format", cat: "Logam", title: "Pipa PVC Sisa Proyek", loc: "Bekasi Barat", dist: "6.1 km", weight: "80 kg", age: "1 hari lalu" },
    { img: "https://images.unsplash.com/photo-1587733761376-3f26fc81d17f?w=600&h=400&fit=crop&auto=format", cat: "Organik", title: "Sisa Daun Kering 30 kg", loc: "Depok Tengah", dist: "8.7 km", weight: "30 kg", age: "3 jam lalu" },
    { img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&auto=format", cat: "Tekstil", title: "Kain Perca Warna 15 kg", loc: "Tangerang Sel.", dist: "4.2 km", weight: "15 kg", age: "6 jam lalu" },
    { img: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=400&fit=crop&auto=format", cat: "Logam", title: "Besi Tua Campur 120 kg", loc: "Cikarang", dist: "11.3 km", weight: "120 kg", age: "8 jam lalu" },
  ];
  const filtered =
    filterActive === "Semua" ? listings : listings.filter((l) => l.cat === filterActive);

  return (
    <section
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
        </div>
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
          {filters.map((f) => (
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
        <div className="listings-grid">
          {filtered.map((item, i) => (
            <ListingCard key={i} {...item} />
          ))}
        </div>
        <div className="listings-scroll-wrap">
          <div className="listings-scroll">
            {filtered.map((item, i) => (
              <div key={i} className="listing-card">
                <ListingCard {...item} />
              </div>
            ))}
          </div>
        </div>
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

function ListingCard({ img, cat, title, loc, dist, weight, age }) {
  const [hovered, setHovered] = useState(false);
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
        <img
          src={img}
          alt={title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
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
            left: 10,
            backgroundColor: "#E8752C",
            color: "#fff",
            fontFamily: "var(--font-mono)",
            fontSize: "0.68rem",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: 100,
          }}
        >
          {cat}
        </span>
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
            {title}
          </p>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.92rem", color: "#1C2B22", margin: "0 0 8px" }}>
          {title}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ color: "#8C9184", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={11} strokeWidth={2} />
            {loc}
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
            {dist}
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
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "#8C9184", display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={10} strokeWidth={2} /> {age}
          </span>
        </div>
      </div>
    </TiltCard>
  );
}
