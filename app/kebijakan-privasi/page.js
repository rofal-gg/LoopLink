import Link from "next/link";
import { Wave } from "@/components/landing/shared";

export const metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi LoopLink — bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda di platform bursa pertukaran limbah hiper-lokal.",
};

export default function KebijakanPrivasiPage() {
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
            LEGAL
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
            Kebijakan Privasi
          </h1>

          {/* Subtitle & badge */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                color: "#8C9184",
                lineHeight: 1.7,
                margin: 0,
              }}
            >
              Terakhir diperbarui: 24 Agustus 2026
            </p>
            <span className="ll-badge-green">
              Berlaku sejak 24 Agustus 2026
            </span>
          </div>
        </div>
      </section>

      {/* ─── Sections 1-3: white cards on cream bg ─── */}
      <div style={{ backgroundColor: "#F6F3EA" }}>
        <article
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 24px 60px",
            color: "#1C2B22",
          }}
        >
          {/* 1. Pendahuluan */}
          <section className="ll-card">
            <h2 className="ll-card-heading">
              <span className="ll-num">01</span>
              Pendahuluan
            </h2>
            <p style={bodyStyle}>
              LoopLink adalah platform bursa pertukaran limbah hiper-lokal yang
              menghubungkan pemilik limbah dengan pencari bahan daur ulang di
              radius terdekat. Kami menghargai privasi Anda dan berkomitmen untuk
              melindungi data pribadi yang Anda bagikan saat menggunakan layanan
              kami.
            </p>
            <p style={bodyStyle}>
              Kebijakan ini menjelaskan informasi apa yang kami kumpulkan, bagaimana
              kami menggunakannya, dan hak-hak Anda terkait data tersebut. Dengan
              menggunakan LoopLink, Anda menyetujui praktik yang dijelaskan dalam
              kebijakan ini.
            </p>
          </section>

          {/* 2. Informasi yang Dikumpulkan */}
          <section className="ll-card">
            <h2 className="ll-card-heading">
              <span className="ll-num">02</span>
              Informasi yang Dikumpulkan
            </h2>
            <p style={bodyStyle}>Kami mengumpulkan jenis informasi berikut:</p>

            <h3 className="ll-sub">Data Akun</h3>
            <p style={bodyStyle}>
              Saat Anda mendaftar, kami mengumpulkan nama lengkap, alamat email,
              nomor telepon, dan alamat domisili. Informasi ini diperlukan untuk
              membuat akun dan menghubungkan Anda dengan pengguna lain di
              sekitar Anda.
            </p>

            <h3 className="ll-sub">Data Lokasi</h3>
            <p style={bodyStyle}>
              LoopLink menggunakan koordinat GPS perangkat Anda untuk menampilkan
              listing limbah di radius terdekat. Anda dapat menolak izin lokasi
              kapan saja; sebagai gantinya, Anda dapat memasukkan alamat secara
              manual.
            </p>

            <h3 className="ll-sub">Data Listing</h3>
            <p style={bodyStyle}>
              Saat Anda mengunggah listing limbah, kami menyimpan foto limbah,
              deskripsi teks, kategori limbah (berdasarkan klasifikasi AI),
              jumlah, satuan, dan status listing. Foto disimpan di Supabase
              Storage dan dapat diakses oleh pengguna lain yang melihat listing
              Anda.
            </p>

            <h3 className="ll-sub">Data Transaksi</h3>
            <p style={bodyStyle}>
              Kami mencatat riwayat klaim, status klaim (diterima/ditolak),
              serta status penyelesaian pertukaran. Data ini digunakan untuk
              memfasilitasi proses pertukaran dan menampilkan riwayat aktivitas
              Anda.
            </p>
          </section>

          {/* 3. Penggunaan Informasi */}
          <section className="ll-card">
            <h2 className="ll-card-heading">
              <span className="ll-num">03</span>
              Penggunaan Informasi
            </h2>
            <p style={bodyStyle}>Kami menggunakan informasi yang dikumpulkan untuk:</p>
            <ul className="ll-checklist">
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Memfasilitasi pertukaran limbah</strong> — menghubungkan pemilik limbah dengan pencari bahan daur ulang berdasarkan kategori dan lokasi.</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Klasifikasi AI</strong> — menganalisis foto limbah untuk mengidentifikasi jenis limbah secara otomatis (misalnya: plastik, kertas, logam, organik).</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Menghitung jarak dan skor kecocokan</strong> — menampilkan listing terdekat dan merekomendasikan kecocokan berdasarkan preferensi pengguna.</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Meningkatkan layanan</strong> — menganalisis pola penggunaan untuk mengoptimalkan pengalaman di platform.</span>
              </li>
            </ul>
          </section>
        </article>
      </div>

      {/* Wave: cream → white */}
      <Wave from="#F6F3EA" to="#ffffff" path="h" />

      {/* ─── Sections 4-6: cream cards on white bg ─── */}
      <div style={{ backgroundColor: "#ffffff" }}>
        <article
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "40px 24px 60px",
            color: "#1C2B22",
          }}
        >
          {/* 4. Penyimpanan & Keamanan */}
          <section className="ll-card-cream">
            <h2 className="ll-card-heading">
              <span className="ll-num">04</span>
              Penyimpanan & Keamanan
            </h2>
            <p style={bodyStyle}>
              Semua data LoopLink disimpan di infrastruktur Supabase, yang
              mencakup:
            </p>
            <ul className="ll-checklist">
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>PostgreSQL</strong> — database utama untuk data akun, listing, dan transaksi.</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Supabase Auth</strong> — autentikasi dan manajemen sesi pengguna.</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Supabase Storage</strong> — penyimpanan foto limbah dan aset visual lainnya.</span>
              </li>
            </ul>
            <p style={bodyStyle}>
              Kami menerapkan langkah-langkah keamanan standar industri untuk
              melindungi data Anda, termasuk enkripsi data saat transit (TLS)
              dan kontrol akses berbasis peran. Namun, tidak ada metode
              transmisi atau penyimpanan digital yang 100% aman.
            </p>
          </section>

          {/* 5. Berbagi Informasi */}
          <section className="ll-card-cream">
            <h2 className="ll-card-heading">
              <span className="ll-num">05</span>
              Berbagi Informasi
            </h2>
            <p style={bodyStyle}>Kami berbagi informasi Anda hanya dalam situasi berikut:</p>
            <ul className="ll-checklist">
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Saat klaim disetujui</strong> — informasi kontak Anda (nama, telepon, alamat) akan dibagikan dengan pemilik listing yang klaimnya Anda ajukan, dan sebaliknya, untuk memfasilitasi pertemuan fisik.</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Tanpa penjualan data</strong> — kami tidak menjual, menyewakan, atau memperdagangkan data pribadi Anda kepada pihak ketiga mana pun.</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Kewajiban hukum</strong> — jika diwajibkan oleh hukum atau proses hukum yang sah, kami dapat membagikan informasi kepada otoritas yang berwenang.</span>
              </li>
            </ul>
          </section>

          {/* 6. Hak Pengguna */}
          <section className="ll-card-cream">
            <h2 className="ll-card-heading">
              <span className="ll-num">06</span>
              Hak Pengguna
            </h2>
            <p style={{ ...bodyStyle, marginBottom: 20 }}>
              Anda memiliki hak untuk:
            </p>
            <div className="ll-rights-grid">
              <div className="ll-right-card">
                <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>&#128269;</div>
                <div className="ll-right-label">Akses</div>
                <div className="ll-right-desc">Melihat informasi yang tersimpan tentang akun Anda.</div>
              </div>
              <div className="ll-right-card">
                <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>&#9998;</div>
                <div className="ll-right-label">Ubah</div>
                <div className="ll-right-desc">Memperbarui nama, email, telepon, atau alamat kapan saja.</div>
              </div>
              <div className="ll-right-card">
                <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>&#128465;</div>
                <div className="ll-right-label">Hapus</div>
                <div className="ll-right-desc">Menghapus akun dan data terkait secara permanen.</div>
              </div>
              <div className="ll-right-card">
                <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>&#128683;</div>
                <div className="ll-right-label">Tolak Lokasi</div>
                <div className="ll-right-desc">Menolak akses GPS dan memasukkan alamat manual.</div>
              </div>
            </div>
          </section>
        </article>
      </div>

      {/* Wave: white → mist */}
      <Wave from="#ffffff" to="#DCE3D3" path="c" />

      {/* ─── Sections 7-8: white cards on mist bg ─── */}
      <div style={{ backgroundColor: "#DCE3D3" }}>
        <article
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "40px 24px 60px",
            color: "#1C2B22",
          }}
        >
          {/* 7. Cookie & Teknologi Serupa */}
          <section className="ll-card">
            <h2 className="ll-card-heading">
              <span className="ll-num">07</span>
              Cookie & Teknologi Serupa
            </h2>
            <p style={bodyStyle}>
              LoopLink menggunakan cookie dan teknologi serupa untuk
              mengelola sesi pengguna, mengingat preferensi Anda, dan
              meningkatkan pengalaman menjelajah. Cookie yang kami gunakan
              bersifat fungsional dan tidak digunakan untuk pelacakan iklan
              pihak ketiga.
            </p>
            <p style={bodyStyle}>
              Anda dapat mengatur preferensi cookie melalui browser Anda.
              Menonaktifkan cookie tertentu mungkin memengaruhi fungsi
              beberapa fitur platform.
            </p>
          </section>

          {/* 8. Perubahan Kebijakan */}
          <section className="ll-card">
            <h2 className="ll-card-heading">
              <span className="ll-num">08</span>
              Perubahan Kebijakan
            </h2>
            <p style={bodyStyle}>
              Kami dapat memperbarui kebijakan ini dari waktu ke waktu. Perubahan
              akan diberitahukan melalui platform dan/atau email. Versi terbaru
              selalu tersedia di halaman ini dengan tanggal pembaruan yang
              tercantum di bagian atas.
            </p>
          </section>
        </article>
      </div>

      {/* Wave: mist → cream */}
      <Wave from="#DCE3D3" to="#F6F3EA" path="a" />

      {/* ─── CTA: cream bg with blob ─── */}
      <div style={{ backgroundColor: "#F6F3EA", position: "relative", overflow: "hidden" }}>
        {/* Blob dekoratif CTA */}
        <div
          style={{
            position: "absolute",
            right: "10%",
            top: "30%",
            width: 200,
            height: 200,
            backgroundColor: "#3C7A5C",
            opacity: 0.05,
            borderRadius: "50% 50% 30% 70% / 40% 60% 40% 60%",
            zIndex: 0,
          }}
        />
        <article
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "40px 24px 80px",
            color: "#1C2B22",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* 9. Kontak */}
          <div className="ll-contact-section">
            <h2 className="ll-card-heading">
              <span className="ll-num">09</span>
              Kontak
            </h2>
            <p style={{ ...bodyStyle, marginBottom: 16 }}>
              Jika Anda memiliki pertanyaan tentang kebijakan privasi ini atau
              ingin menggunakan hak-hak Anda, hubungi kami:
            </p>
            <div className="ll-contact-inner">
              <p className="ll-mono-text">
                Email: hello@looplink.id
              </p>
              <p className="ll-mono-text" style={{ marginTop: 6 }}>
                Subjek: [Kebijakan Privasi] - [Nama Anda]
              </p>
            </div>
          </div>

          {/* Source label */}
          <div className="ll-source-label">
            LoopLink &middot; Kebijakan Privasi v1.0 &middot; 24 Agustus 2026
          </div>

          {/* CTA */}
          <div className="ll-cta-wrap">
            <Link href="/" className="ll-cta-btn">
              Kembali ke Beranda
              <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>&rarr;</span>
            </Link>
          </div>
        </article>
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

        .ll-badge-green {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 600;
          color: #3C7A5C;
          background-color: rgba(60,122,92,0.1);
          border: 1px solid rgba(60,122,92,0.2);
          border-radius: 999px;
          padding: 4px 12px;
          letter-spacing: 0.04em;
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

        .ll-sub {
          font-family: var(--font-fraunces);
          font-size: 1.02rem;
          font-weight: 600;
          color: #1C2B22;
          margin-top: 18px;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ll-sub::before {
          content: "";
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #3C7A5C;
          flex-shrink: 0;
        }

        .ll-checklist {
          list-style: none;
          padding: 0;
          margin: 8px 0 16px;
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

        .ll-rights-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .ll-right-card {
          background: #F6F3EA;
          border: 1px solid #DCE3D3;
          border-radius: 12px;
          padding: 18px 16px;
          text-align: center;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .ll-right-card:hover {
          border-color: #3C7A5C;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(60,122,92,0.1);
        }
        .ll-right-label {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 600;
          color: #3C7A5C;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }
        .ll-right-desc {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: #8C9184;
          line-height: 1.5;
        }

        .ll-contact-section {
          background-color: #DCE3D3;
          border-radius: 16px;
          padding: 28px 32px;
          margin-bottom: 20px;
        }
        .ll-contact-inner {
          background: #fff;
          border-radius: 12px;
          padding: 18px 22px;
          border: 1px solid rgba(60,122,92,0.15);
        }
        .ll-mono-text {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: #1C2B22;
          margin: 0;
        }

        .ll-source-label {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          color: #8C9184;
          margin-bottom: 40px;
          letter-spacing: 0.04em;
        }

        .ll-cta-wrap {
          text-align: center;
          padding-top: 32px;
          border-top: 1px solid #DCE3D3;
        }
        .ll-cta-btn {
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
        .ll-cta-btn:hover {
          background-color: #2d5e46;
          box-shadow: 0 8px 24px rgba(60,122,92,0.4);
          transform: translateY(-2px);
        }
        .ll-cta-btn:active {
          transform: scale(0.98);
        }

        @media (max-width: 640px) {
          .ll-card, .ll-card-cream { padding: 22px 18px; }
          .ll-contact-section { padding: 22px 18px; }
          .ll-rights-grid { grid-template-columns: 1fr 1fr; }
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
