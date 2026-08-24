import Link from "next/link";
import { Wave } from "@/components/landing/shared";

export const metadata = {
  title: "Tentang Kami",
  description:
    "Kenali lebih dekat LoopLink, platform bursa pertukaran limbah hiper-lokal yang menghubungkan pemilik limbah dengan pencari bahan daur ulang.",
};

export default function TentangKamiPage() {
  return (
    <main style={{ backgroundColor: "#F6F3EA", minHeight: "100dvh" }}>
      {/* ─── Hero ─── */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          padding: "100px 24px 60px",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {/* Blob dekoratif */}
        <div
          style={{
            position: "absolute",
            right: "-8%",
            top: "20%",
            width: 340,
            height: 340,
            backgroundColor: "#3C7A5C",
            opacity: 0.06,
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "-5%",
            bottom: "10%",
            width: 220,
            height: 220,
            backgroundColor: "#DCE3D3",
            opacity: 0.5,
            borderRadius: "50% 50% 30% 70% / 40% 60% 40% 60%",
            zIndex: 0,
          }}
        />

        {/* Back link */}
        <div style={{ position: "relative", zIndex: 2, marginBottom: 40 }}>
          <Link href="/" className="ll-back-pill">
            <span style={{ fontSize: "1rem", lineHeight: 1 }}>&larr;</span>
            Kembali ke beranda
          </Link>
        </div>

        {/* Header content */}
        <div style={{ position: "relative", zIndex: 2, maxWidth: 900 }}>
          {/* Eyebrow */}
          <div className="ll-eyebrow">
            <span className="ll-eyebrow-bar" />
            TENTANG KAMI
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
              fontWeight: 700,
              lineHeight: 1.12,
              color: "#1C2B22",
              marginTop: 0,
              marginBottom: 16,
            }}
          >
            Menghubungkan Limbah dengan Peluang
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1.05rem",
              color: "#8C9184",
              lineHeight: 1.7,
              margin: 0,
              maxWidth: 700,
            }}
          >
            Kami percaya setiap limbah memiliki nilai. LoopLink hadir untuk menjembatani
            pemilik limbah dengan pihak yang membutuhkan, menciptakan ekosistem
            pertukaran yang efisien dan berkelanjutan.
          </p>
        </div>
      </section>

      {/* ─── Visi & Misi ─── */}
      <div style={{ backgroundColor: "#F6F3EA" }}>
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px 60px",
            color: "#1C2B22",
          }}
        >
          <div className="ll-visi-misi-grid">
            {/* Visi */}
            <div className="ll-card">
              <div className="ll-icon-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
              </div>
              <h2 className="ll-card-heading">Visi Kami</h2>
              <p style={bodyStyle}>
                Menciptakan ekosistem pertukaran limbah yang efisien, berkelanjutan,
                dan dapat diakses oleh semua orang.
              </p>
            </div>

            {/* Misi */}
            <div className="ll-card">
              <div className="ll-icon-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h2 className="ll-card-heading">Misi Kami</h2>
              <ul className="ll-checklist">
                <li>
                  <span className="ll-check">&#10003;</span>
                  <span>Mempermudah distribusi limbah secara hiper-lokal</span>
                </li>
                <li>
                  <span className="ll-check">&#10003;</span>
                  <span>Memanfaatkan AI untuk klasifikasi limbah otomatis</span>
                </li>
                <li>
                  <span className="ll-check">&#10003;</span>
                  <span>Menghubungkan pemilik limbah dengan pihak yang membutuhkan</span>
                </li>
                <li>
                  <span className="ll-check">&#10003;</span>
                  <span>Mendukung ekonomi sirkular dan pengurangan limbah ke TPA</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      {/* Wave: cream → white */}
      <Wave from="#F6F3EA" to="#ffffff" path="h" />

      {/* ─── Cerita Kami ─── */}
      <div style={{ backgroundColor: "#ffffff" }}>
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "40px 24px 60px",
            color: "#1C2B22",
          }}
        >
          <div className="ll-card-cream">
            <h2 className="ll-card-heading">
              <span className="ll-num">01</span>
              Cerita Kami
            </h2>
            <p style={bodyStyle}>
              LoopLink lahir dari keprihatinan terhadap limbah yang terbuang sia-sia.
              Setiap hari, ribuan ton limbah organik, plastik, kertas, dan logam
              berakhir di Tempat Pembuangan Akhir (TPA) tanpa dimanfaatkan.
            </p>
            <p style={bodyStyle}>
              Banyak UMKM, seperti pabrik tahu dan tempe, membutuhkan bahan bakar
              alternatif seperti serpihan kayu atau ampas kelapa. Namun, mereka
              kesulitan menemukan sumber limbah yang tepat di sekitar mereka.
            </p>
            <p style={bodyStyle}>
              Platform ini hadir untuk menjembatani kesenjangan tersebut. Dengan
              bantuan teknologi AI, kami mengklasifikasi limbah secara otomatis dan
              menghubungkan pemilik limbah dengan pihak yang membutuhkan dalam radius
              terdekat.
            </p>
          </div>

          {/* Timeline ringkas */}
          <div className="ll-timeline">
            <div className="ll-timeline-item">
              <div className="ll-timeline-dot" />
              <div className="ll-timeline-content">
                <div className="ll-timeline-label">Masalah</div>
                <p className="ll-timeline-text">Limbah terbuang sia-sia, UMKM kesulitan mencari bahan alternatif</p>
              </div>
            </div>
            <div className="ll-timeline-item">
              <div className="ll-timeline-dot" />
              <div className="ll-timeline-content">
                <div className="ll-timeline-label">Solusi</div>
                <p className="ll-timeline-text">Platform hiper-lokal dengan AI klasifikasi limbah</p>
              </div>
            </div>
            <div className="ll-timeline-item">
              <div className="ll-timeline-dot" />
              <div className="ll-timeline-content">
                <div className="ll-timeline-label">Dampak</div>
                <p className="ll-timeline-text">Ekosistem pertukaran limbah yang efisien dan berkelanjutan</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Wave: white → mist */}
      <Wave from="#ffffff" to="#DCE3D3" path="c" />

      {/* ─── Teknologi ─── */}
      <div style={{ backgroundColor: "#DCE3D3" }}>
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "40px 24px 60px",
            color: "#1C2B22",
          }}
        >
          <h2 className="ll-section-heading">Teknologi yang Kami Gunakan</h2>
          <div className="ll-tech-grid">
            <div className="ll-card">
              <div className="ll-icon-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </div>
              <h3 className="ll-tech-title">Computer Vision</h3>
              <p className="ll-tech-model">google/vit-base-patch16-224</p>
              <p style={bodyStyle}>
                Model Vision Transformer via HuggingFace untuk mengklasifikasi
                12 jenis limbah secara otomatis dari foto.
              </p>
            </div>

            <div className="ll-card">
              <div className="ll-icon-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3 className="ll-tech-title">Generative AI</h3>
              <p className="ll-tech-model">Gemini 1.5 Flash</p>
              <p style={bodyStyle}>
                Ekstraksi detail dari teks deskripsi limbah untuk memperkaya
                informasi listing secara otomatis.
              </p>
            </div>

            <div className="ll-card">
              <div className="ll-icon-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </div>
              <h3 className="ll-tech-title">Matching Algorithm</h3>
              <p className="ll-tech-model">Rule-based scoring</p>
              <p style={bodyStyle}>
                Pencocokan hiper-lokal berdasarkan kategori, jarak, dan preferensi
                pengguna tanpa embedding vektor.
              </p>
            </div>

            <div className="ll-card">
              <div className="ll-icon-circle">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <ellipse cx="12" cy="5" rx="9" ry="3"/>
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                </svg>
              </div>
              <h3 className="ll-tech-title">Database</h3>
              <p className="ll-tech-model">Supabase</p>
              <p style={bodyStyle}>
                PostgreSQL untuk data utama, Autentikasi untuk manajemen pengguna,
                dan Storage untuk foto limbah.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Wave: mist → cream */}
      <Wave from="#DCE3D3" to="#F6F3EA" path="a" />

      {/* ─── Tim Kami ─── */}
      <div style={{ backgroundColor: "#F6F3EA", position: "relative", overflow: "hidden" }}>
        {/* Blob dekoratif */}
        <div
          style={{
            position: "absolute",
            left: "10%",
            top: "20%",
            width: 180,
            height: 180,
            backgroundColor: "#3C7A5C",
            opacity: 0.05,
            borderRadius: "50% 50% 30% 70% / 40% 60% 40% 60%",
            zIndex: 0,
          }}
        />

        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "40px 24px 60px",
            color: "#1C2B22",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="ll-card">
            <h2 className="ll-card-heading">
              <span className="ll-num">02</span>
              Tim Kami
            </h2>
            <p style={bodyStyle}>
              LoopLink dikembangkan oleh tim mahasiswa dari Universitas Trunojoyo
              Madura. Kami terdiri dari berbagai latar belakang keahlian, mulai dari
              teknik informatika, desain UI/UX, hingga manajemen bisnis.
            </p>
            <p style={{ ...bodyStyle, marginBottom: 24 }}>
              Proyek ini merupakan bagian dari Trunodjoyo Creative Competition 2026
              dengan tema &quot;Shaping Tomorrow: Digital Innovation, Artificial Intelligence,
              and Sustainable Communities&quot;.
            </p>

            {/* Team Members */}
            <div className="ll-team-grid">
              <div className="ll-team-member">
                <img src="/Team/M.%20Ainur%20Rofal%20Achsony.jpeg" alt="M. Ainur Rofal Achsony" className="ll-team-avatar" />
                <div className="ll-team-info">
                  <div className="ll-team-name">Muhammad Ainur Rofal Achsony</div>
                  <div className="ll-team-role">Ketua</div>
                </div>
              </div>
              <div className="ll-team-member">
                <img src="/Team/Idham%20Kholid%20A.png" alt="Idham Kholid" className="ll-team-avatar" />
                <div className="ll-team-info">
                  <div className="ll-team-name">Idham Kholid</div>
                  <div className="ll-team-role">Anggota</div>
                </div>
              </div>
              <div className="ll-team-member">
                <img src="/Team/Restu%20Dwi%20Haqiqi.jpeg" alt="Restu Dwi Haqiqi" className="ll-team-avatar" />
                <div className="ll-team-info">
                  <div className="ll-team-name">Restu Dwi Haqiqi</div>
                  <div className="ll-team-role">Anggota</div>
                </div>
              </div>
            </div>

            <div className="ll-team-badge">
              <div className="ll-team-badge-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div>
                <div className="ll-team-badge-title">Universitas Trunojoyo Madura</div>
                <div className="ll-team-badge-sub">Trunodjoyo Creative Competition 2026</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ─── CTA Section ─── */}
      <div style={{ backgroundColor: "#F6F3EA", paddingBottom: 80 }}>
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-fraunces)",
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              fontWeight: 700,
              color: "#1C2B22",
              marginTop: 0,
              marginBottom: 12,
            }}
          >
            Siap Membuat Perubahan?
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              color: "#8C9184",
              lineHeight: 1.7,
              margin: "0 auto 32px",
              maxWidth: 500,
            }}
          >
            Bergabunglah dengan komunitas LoopLink dan mulai manfaatkan limbah
            di sekitarmu.
          </p>

          <div className="ll-cta-group">
            <Link href="/register" className="ll-cta-btn-primary">
              Mulai Berkontribusi
              <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>&rarr;</span>
            </Link>
            <Link href="/#fitur" className="ll-cta-btn-outline">
              Lihat Fitur
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        .ll-back-pill {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: #3C7A5C;
          text-decoration: none;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background-color: rgba(60,122,92,0.08);
          border-radius: 999px;
          transition: background-color 0.2s, color 0.2s;
        }
        .ll-back-pill:hover {
          background-color: rgba(60,122,92,0.18);
          color: #1C2B22;
        }

        .ll-eyebrow {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #3C7A5C;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
        }
        .ll-eyebrow-bar {
          display: inline-block;
          width: 20px;
          height: 1.5px;
          background-color: #3C7A5C;
          border-radius: 2px;
        }

        .ll-card {
          background: #fff;
          border: 1px solid #DCE3D3;
          border-radius: 16px;
          padding: 28px 32px;
          margin-bottom: 20px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ll-card:hover {
          border-color: #3C7A5C;
          box-shadow: 0 4px 20px rgba(60,122,92,0.08);
        }

        .ll-card-cream {
          background: #F6F3EA;
          border: 1px solid #DCE3D3;
          border-radius: 16px;
          padding: 28px 32px;
          margin-bottom: 20px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ll-card-cream:hover {
          border-color: #3C7A5C;
          box-shadow: 0 4px 20px rgba(60,122,92,0.08);
        }

        .ll-card-heading {
          font-family: var(--font-fraunces);
          font-size: 1.25rem;
          font-weight: 600;
          color: #1C2B22;
          margin-top: 0;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ll-num {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 600;
          color: #3C7A5C;
          background-color: rgba(60,122,92,0.1);
          border-radius: 6px;
          padding: 3px 8px;
          letter-spacing: 0.05em;
        }

        .ll-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: rgba(60,122,92,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3C7A5C;
          margin-bottom: 16px;
        }

        .ll-checklist {
          list-style: none;
          padding: 0;
          margin: 8px 0 0;
        }
        .ll-checklist li {
          font-family: var(--font-body);
          font-size: 0.95rem;
          line-height: 1.75;
          color: #1C2B22;
          padding-left: 28px;
          position: relative;
          margin-bottom: 10px;
        }
        .ll-check {
          position: absolute;
          left: 0;
          top: 6px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: rgba(60,122,92,0.1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
          color: #3C7A5C;
          font-weight: 700;
          flex-shrink: 0;
        }

        .ll-visi-misi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .ll-section-heading {
          font-family: var(--font-fraunces);
          font-size: clamp(1.6rem, 3vw, 2rem);
          font-weight: 700;
          color: #1C2B22;
          margin-top: 0;
          margin-bottom: 28px;
          text-align: center;
        }

        .ll-tech-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .ll-tech-title {
          font-family: var(--font-fraunces);
          font-size: 1.1rem;
          font-weight: 600;
          color: #1C2B22;
          margin: 0 0 4px;
        }

        .ll-tech-model {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: #3C7A5C;
          margin: 0 0 12px;
          letter-spacing: 0.02em;
        }

        .ll-timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 24px;
          padding-left: 12px;
          border-left: 2px solid #DCE3D3;
        }
        .ll-timeline-item {
          position: relative;
          padding-left: 28px;
          padding-bottom: 24px;
        }
        .ll-timeline-item:last-child {
          padding-bottom: 0;
        }
        .ll-timeline-dot {
          position: absolute;
          left: -21px;
          top: 2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: #3C7A5C;
          border: 2px solid #fff;
        }
        .ll-timeline-label {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 600;
          color: #3C7A5C;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
        }
        .ll-timeline-text {
          font-family: var(--font-body);
          font-size: 0.95rem;
          color: #1C2B22;
          line-height: 1.6;
          margin: 0;
        }

        .ll-team-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }
        .ll-team-member {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background-color: #F6F3EA;
          border: 1px solid #DCE3D3;
          border-radius: 12px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ll-team-member:hover {
          border-color: #3C7A5C;
          box-shadow: 0 4px 16px rgba(60,122,92,0.08);
        }
        .ll-team-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
          object-position: top;
          flex-shrink: 0;
        }
        .ll-team-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .ll-team-name {
          font-family: var(--font-fraunces);
          font-size: 1rem;
          font-weight: 600;
          color: #1C2B22;
        }
        .ll-team-role {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: #3C7A5C;
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        .ll-team-badge {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background-color: #DCE3D3;
          border-radius: 12px;
          padding: 16px 20px;
        }
        .ll-team-badge-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background-color: #3C7A5C;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #F6F3EA;
          flex-shrink: 0;
        }
        .ll-team-badge-title {
          font-family: var(--font-fraunces);
          font-size: 0.95rem;
          font-weight: 600;
          color: #1C2B22;
        }
        .ll-team-badge-sub {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: #8C9184;
          letter-spacing: 0.02em;
        }

        .ll-cta-group {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ll-cta-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          color: #F6F3EA;
          background-color: #3C7A5C;
          padding: 14px 32px;
          border-radius: 999px;
          text-decoration: none;
          transition: background-color 0.18s, box-shadow 0.18s, transform 0.12s;
        }
        .ll-cta-btn-primary:hover {
          background-color: #2d5e46;
          box-shadow: 0 8px 24px rgba(60,122,92,0.4);
          transform: translateY(-2px);
        }
        .ll-cta-btn-primary:active {
          transform: scale(0.98);
        }

        .ll-cta-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          color: #3C7A5C;
          background-color: transparent;
          border: 2px solid #3C7A5C;
          padding: 12px 32px;
          border-radius: 999px;
          text-decoration: none;
          transition: background-color 0.18s, color 0.18s, transform 0.12s;
        }
        .ll-cta-btn-outline:hover {
          background-color: #3C7A5C;
          color: #F6F3EA;
          transform: translateY(-2px);
        }
        .ll-cta-btn-outline:active {
          transform: scale(0.98);
        }

        @media (max-width: 768px) {
          .ll-visi-misi-grid { grid-template-columns: 1fr; }
          .ll-tech-grid { grid-template-columns: 1fr; }
          .ll-card, .ll-card-cream { padding: 22px 18px; }
          .ll-timeline { padding-left: 8px; }
          .ll-timeline-item { padding-left: 24px; }
          .ll-team-badge { flex-direction: column; text-align: center; }
          .ll-team-member { padding: 14px 16px; }
          .ll-team-avatar { width: 42px; height: 42px; }
        }
      `}</style>
    </main>
  );
}

const bodyStyle = {
  fontFamily: "var(--font-body)",
  fontSize: "0.95rem",
  lineHeight: 1.75,
  color: "#1C2B22",
  marginBottom: 12,
};
