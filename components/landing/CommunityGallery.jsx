"use client";

import { useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import { Eyebrow, useInView } from "./shared";

/* ─── Community Gallery ─── */
export default function CommunityGallery() {
  const { ref, inView } = useInView();
  const photos = [
    { img: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=400&fit=crop&auto=format", caption: "Pertukaran plastik - Bekasi", tall: true },
    { img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=280&fit=crop&auto=format", caption: "Komunitas daur ulang - Depok", tall: false },
    { img: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&h=280&fit=crop&auto=format", caption: "Workshop limbah tekstil - Tangerang", tall: false },
    { img: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&h=560&fit=crop&auto=format", caption: "Pengrajin kain perca - Jakarta", tall: true },
    { img: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=280&fit=crop&auto=format", caption: "Daur ulang organik - Bogor", tall: false },
    { img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=280&fit=crop&auto=format", caption: "UMKM tekstil daur ulang - Bandung", tall: false },
  ];
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
            marginBottom: 48,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <Eyebrow>Komunitas LoopLink</Eyebrow>
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
              Ribuan aksi nyata
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>setiap harinya.</em>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <p style={{ color: "#8C9184", fontSize: "0.9rem", margin: 0, maxWidth: 260, textAlign: "right" }}>
              Bergabung dengan 21.700+ orang yang sudah mengubah limbah jadi nilai.
            </p>
            <a
              href="#beranda"
              style={{
                color: "#3C7A5C",
                fontWeight: 600,
                fontSize: "0.88rem",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Bagikan Ceritamu <ArrowRight size={15} />
            </a>
          </div>
        </div>
        <div className="gallery-masonry">
          {photos.map((p, i) => (
            <GalleryPhoto key={i} {...p} delay={i * 60} inView={inView} />
          ))}
        </div>
      </div>
      <style>{`
        .gallery-masonry { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 10px; gap: 14px; }
        @media (max-width: 767px) { .gallery-masonry { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .gallery-masonry { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}

function GalleryPhoto({ img, caption, tall, delay, inView }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className={`reveal${inView ? " in-view" : ""}`}
      style={{
        transitionDelay: `${delay}ms`,
        gridRow: `span ${tall ? 26 : 18}`,
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={img}
        alt={caption}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: hovered ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
          display: "block",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(28,43,34,0.75) 0%, transparent 60%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "14px 16px",
          transform: hovered ? "translateY(0)" : "translateY(8px)",
          opacity: hovered ? 1 : 0,
          transition: "transform 0.3s, opacity 0.3s",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            color: "#F6F3EA",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Heart size={11} strokeWidth={2} color="#E8752C" fill="#E8752C" /> {caption}
        </p>
      </div>
    </div>
  );
}
