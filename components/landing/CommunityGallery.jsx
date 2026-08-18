"use client";

import { useState } from "react";
import { ArrowRight, Heart, ImagePlus } from "lucide-react";
import { Eyebrow, useInView } from "./shared";
import { SourceLabel, labelKategori } from "./format";

/* ─── Community Gallery ───
 * Foto asli data.gallery (listing tersedia yang punya foto, max 6).
 * Caption = judul + kategori nyata. Kalau kosong → CTA lembut, bukan
 * foto stok fiktif.
 */

export default function CommunityGallery({ gallery = [] }) {
  const { ref, inView } = useInView();
  const dataGal = (Array.isArray(gallery) ? gallery : []).filter(
    (g) => g && g.foto_url
  );

  const photos = dataGal.map((g, i) => ({
    img: g.foto_url,
    caption: `${g.judul || "Listing"} · ${labelKategori(g.kategori_citra)}`,
    tall: i % 3 === 0,
  }));

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
              Aksi nyata dari komunitas
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>di sekitarmu.</em>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <p style={{ color: "#8C9184", fontSize: "0.9rem", margin: 0, maxWidth: 260, textAlign: "right" }}>
              Foto listing yang dibagikan komunitas, langsung dari platform.
            </p>
            <a
              href="/upload"
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

        {photos.length === 0 ? (
          <div
            style={{
              borderRadius: 16,
              backgroundColor: "#fff",
              border: "1px solid #DCE3D3",
              padding: "36px 28px",
              textAlign: "center",
            }}
          >
            <ImagePlus size={28} strokeWidth={1.6} color="#8C9184" style={{ margin: "0 auto 12px" }} />
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "1.1rem",
                color: "#1C2B22",
                margin: "0 0 6px",
              }}
            >
              Belum ada foto listing
            </p>
            <p style={{ color: "#8C9184", fontSize: "0.9rem", margin: "0 0 0" }}>
              Unggah limbahmu dan jadilah foto pertama di galeri komunitas.
            </p>
          </div>
        ) : (
          <>
            <div className="gallery-masonry">
              {photos.map((p, i) => (
                <GalleryPhoto key={i} {...p} delay={i * 60} inView={inView} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 28 }}>
              <SourceLabel />
            </div>
          </>
        )}
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