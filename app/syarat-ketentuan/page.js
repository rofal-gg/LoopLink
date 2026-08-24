import Link from "next/link";
import { Wave } from "@/components/landing/shared";

export const metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan LoopLink — platform bursa pertukaran limbah hiper-lokal.",
};

export default function SyaratKetentuanPage() {
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
            left: "-6%",
            top: "15%",
            width: 300,
            height: 300,
            backgroundColor: "#E8752C",
            opacity: 0.05,
            borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "-4%",
            bottom: "15%",
            width: 260,
            height: 260,
            backgroundColor: "#3C7A5C",
            opacity: 0.06,
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
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
            Syarat & Ketentuan
          </h1>

          {/* Subtitle & badges */}
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
            <span className="ll-badge-orange">
              Syarat Penggunaan LoopLink
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
          {/* 1. Penerimaan Syarat */}
          <section className="ll-card">
            <h2 className="ll-card-heading">
              <span className="ll-num">01</span>
              Penerimaan Syarat
            </h2>
            <p style={bodyStyle}>
              Dengan mengakses atau menggunakan LoopLink, Anda menyetujui untuk
              terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju
              dengan sebagian atau seluruh syarat ini, Anda tidak boleh
              menggunakan layanan kami.
            </p>
          </section>

          {/* 2. Akun Pengguna */}
          <section className="ll-card">
            <h2 className="ll-card-heading">
              <span className="ll-num">02</span>
              Akun Pengguna
            </h2>
            <ul className="ll-checklist">
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Satu akun untuk semua</strong> — LoopLink menggunakan satu jenis akun tanpa pemisahan role. Setiap pengguna dapat mengunggah listing limbah dan mengklaim limbah dari pengguna lain.</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Keamanan akun</strong> — Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda. Segera beri tahu kami jika Anda mendeteksi penggunaan akun yang tidak sah.</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Informasi akurat</strong> — Informasi yang Anda berikan saat pendaftaran harus akurat dan terkini. Penggunaan informasi palsu dapat mengakibatkan penangguhan atau penghapusan akun.</span>
              </li>
            </ul>
          </section>

          {/* 3. Limbah & Listing */}
          <section className="ll-card">
            <h2 className="ll-card-heading">
              <span className="ll-num">03</span>
              Limbah & Listing
            </h2>
            <ul className="ll-checklist">
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Tanggung jawab pengunggah</strong> — Pengguna yang mengunggah listing bertanggung jawab penuh atas keaslian informasi, termasuk jenis limbah, jumlah, dan kondisi.</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Kepatuhan hukum</strong> — Limbah yang dilist harus legal dan bukan limbah berbahaya tanpa izin yang sesuai. Dilarang mengunggah limbah narkoba, bahan peledak, atau zat ilegal lainnya.</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span><strong>Penentuan nilai</strong> — Harga atau nilai pertukaran ditentukan sepenuhnya oleh pengguna. LoopLink tidak menetapkan harga dan tidak menjamin nilai pasar limbah.</span>
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
          {/* 4. Transaksi — mini flow */}
          <section className="ll-card-cream">
            <h2 className="ll-card-heading">
              <span className="ll-num">04</span>
              Transaksi
            </h2>
            <p style={{ ...bodyStyle, marginBottom: 16 }}>
              LoopLink hanya memfasilitasi pertemuan antara pemilik limbah dan
              pencari bahan daur ulang. Berikut alur transaksi di platform:
            </p>
            <div className="ll-flow-grid">
              <div className="ll-flow-card ll-flow-green">
                <div className="ll-flow-step">01</div>
                <div className="ll-flow-label">Fasilitasi</div>
                <div className="ll-flow-desc">Listing dipublikasikan dan dapat ditemukan oleh pencari bahan.</div>
              </div>
              <div className="ll-flow-arrow">&rarr;</div>
              <div className="ll-flow-card ll-flow-orange">
                <div className="ll-flow-step" style={{ color: "#E8752C" }}>02</div>
                <div className="ll-flow-label">Klaim</div>
                <div className="ll-flow-desc">Satu pengguna mengklaim listing secara eksklusif.</div>
              </div>
              <div className="ll-flow-arrow">&rarr;</div>
              <div className="ll-flow-card ll-flow-green">
                <div className="ll-flow-step">03</div>
                <div className="ll-flow-label">Selesai</div>
                <div className="ll-flow-desc">Pertemuan fisik terjadi dan pertukaran diselesaikan.</div>
              </div>
            </div>
            <div className="ll-flow-alt">
              <div className="ll-flow-card ll-flow-gray" style={{ gridColumn: "2 / 4" }}>
                <div className="ll-flow-label">Atau Batal</div>
                <div className="ll-flow-desc">Kedua pihak dapat membatalkan klaim sebelum penyelesaian.</div>
              </div>
            </div>
            <p style={{ ...bodyStyle, marginTop: 14, fontSize: "0.88rem", color: "#8C9184" }}>
              Klaim bersifat eksklusif sampai diselesaikan atau dibatalkan. Pembatalan yang berulang tanpa alasan dapat ditinjau oleh tim LoopLink.
            </p>
          </section>

          {/* 5. Klasifikasi AI — accent ungu */}
          <section className="ll-card-purple">
            <h2 className="ll-card-heading">
              <span className="ll-num-purple">05</span>
              Klasifikasi AI
            </h2>
            <p style={bodyStyle}>
              LoopLink menggunakan kecerdasan buatan untuk mengklasifikasikan
              jenis limbah berdasarkan foto. Hasil klasifikasi bersifat bantuan
              dan bukan keputusan final.
            </p>
            <ul className="ll-checklist">
              <li>
                <span className="ll-check">&#10003;</span>
                <span>Anda dapat mengoreksi hasil klasifikasi sesuai dengan jenis limbah yang sebenarnya.</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span>Akurasi klasifikasi bergantung pada kualitas foto dan kondisi pencahayaan saat pengambilan gambar.</span>
              </li>
              <li>
                <span className="ll-check">&#10003;</span>
                <span>LoopLink tidak menjamin keakuratan 100% dari hasil klasifikasi AI.</span>
              </li>
            </ul>
          </section>

          {/* 6. Larangan — warning style */}
          <section className="ll-card-warning">
            <h2 className="ll-card-heading">
              <span className="ll-num-orange">06</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "1.1rem" }}>&#9888;</span>
                Larangan
              </span>
            </h2>
            <p style={{ ...bodyStyle, color: "#9a4a1e" }}>
              Anda dilarang untuk:
            </p>
            <ul className="ll-warninglist">
              <li>
                <span className="ll-x">&#10007;</span>
                <span>Mengunggah limbah ilegal, narkoba, bahan peledak, atau zat terlarang lainnya.</span>
              </li>
              <li>
                <span className="ll-x">&#10007;</span>
                <span>Menipu atau memanipulasi data listing untuk tujuan apapun.</span>
              </li>
              <li>
                <span className="ll-x">&#10007;</span>
                <span>Menggunakan platform untuk aktivitas yang melanggar hukum atau merugikan pengguna lain.</span>
              </li>
              <li>
                <span className="ll-x">&#10007;</span>
                <span>Membuat akun ganda atau menggunakan identitas palsu.</span>
              </li>
            </ul>
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
          {/* 7. Pertanggungjawaban — warning card */}
          <section className="ll-card-caution">
            <h2 className="ll-card-heading">
              <span className="ll-num-orange">07</span>
              Pertanggungjawaban
            </h2>
            <p style={bodyStyle}>
              LoopLink tidak bertanggung jawab atas kerugian, cedera, atau
              kerusakan yang timbul dari transaksi antar pengguna. Setiap
              pertemuan fisik untuk pertukaran limbah menjadi tanggung jawab
              masing-masing pengguna.
            </p>
            <div className="ll-tip-box">
              <p className="ll-tip-text">
                Kami menyarankan untuk selalu bertemu di tempat umum, membawa
                orang lain, dan memverifikasi kondisi limbah sebelum menyelesaikan
                pertukaran.
              </p>
            </div>
          </section>

          {/* 8. Perubahan Syarat */}
          <section className="ll-card">
            <h2 className="ll-card-heading">
              <span className="ll-num">08</span>
              Perubahan Syarat
            </h2>
            <p style={bodyStyle}>
              Kami berhak memperbarui syarat dan ketentuan ini sewaktu-waktu.
              Perubahan akan diberitahukan melalui platform. Penggunaan
              berkelanjutan setelah perubahan merupakan penerimaan terhadap
              syarat yang diperbarui.
            </p>
          </section>
        </article>
      </div>

      {/* Wave: mist → cream */}
      <Wave from="#DCE3D3" to="#F6F3EA" path="a" />

      {/* ─── Sections 9-10 + CTA: cream bg ─── */}
      <div style={{ backgroundColor: "#F6F3EA", position: "relative", overflow: "hidden" }}>
        {/* Blob dekoratif CTA */}
        <div
          style={{
            position: "absolute",
            left: "8%",
            bottom: "20%",
            width: 180,
            height: 180,
            backgroundColor: "#E8752C",
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
          {/* 9. Hukum yang Berlaku */}
          <section className="ll-card">
            <h2 className="ll-card-heading">
              <span className="ll-num">09</span>
              Hukum yang Berlaku
            </h2>
            <p style={bodyStyle}>
              Syarat dan ketentuan ini tunduk pada hukum Republik Indonesia.
              Setiap sengketa yang timbul dari penggunaan layanan ini akan
              diselesaikan di pengadilan yang berwenang di wilayah Republik
              Indonesia.
            </p>
          </section>

          {/* 10. Kontak */}
          <div className="ll-contact-section">
            <h2 className="ll-card-heading">
              <span className="ll-num">10</span>
              Kontak
            </h2>
            <p style={{ ...bodyStyle, marginBottom: 16 }}>
              Jika Anda memiliki pertanyaan tentang syarat dan ketentuan ini,
              hubungi kami:
            </p>
            <div className="ll-contact-inner">
              <p className="ll-mono-text">
                Email: hello@looplink.id
              </p>
              <p className="ll-mono-text" style={{ marginTop: 6 }}>
                Subjek: [Syarat & Ketentuan] - [Nama Anda]
              </p>
            </div>
          </div>

          {/* Source label */}
          <div className="ll-source-label">
            LoopLink &middot; Syarat & Ketentuan v1.0 &middot; 24 Agustus 2026
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
        .ll-badge-orange {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          font-weight: 600;
          color: #E8752C;
          background-color: rgba(232,117,44,0.08);
          border: 1px solid rgba(232,117,44,0.2);
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
        .ll-num-purple {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 600;
          color: #9b6b9b;
          background-color: rgba(155,107,155,0.12);
          border-radius: 6px;
          padding: 3px 8px;
          letter-spacing: 0.05em;
        }
        .ll-num-orange {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 600;
          color: #E8752C;
          background-color: rgba(232,117,44,0.12);
          border-radius: 6px;
          padding: 3px 8px;
          letter-spacing: 0.05em;
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

        /* Purple card — Klasifikasi AI */
        .ll-card-purple {
          background: linear-gradient(135deg, rgba(155,107,155,0.06) 0%, rgba(60,122,92,0.04) 100%);
          border: 1px solid rgba(155,107,155,0.18);
          border-radius: 16px;
          padding: 28px 32px;
          margin-bottom: 20px;
        }

        /* Warning card — Larangan */
        .ll-card-warning {
          background: rgba(232,117,44,0.04);
          border: 1px solid rgba(232,117,44,0.2);
          border-radius: 16px;
          padding: 28px 32px;
          margin-bottom: 20px;
        }
        .ll-warninglist {
          list-style: none;
          padding: 0;
          margin: 8px 0 0;
        }
        .ll-warninglist li {
          font-family: var(--font-body);
          font-size: 0.95rem;
          line-height: 1.75;
          color: #1C2B22;
          padding-left: 28px;
          position: relative;
          margin-bottom: 10px;
        }
        .ll-x {
          position: absolute;
          left: 0;
          top: 6px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background-color: rgba(232,117,44,0.1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.6rem;
          color: #E8752C;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* Caution card — Pertanggungjawaban */
        .ll-card-caution {
          background: rgba(232,117,44,0.03);
          border: 1px solid rgba(232,117,44,0.15);
          border-radius: 16px;
          padding: 28px 32px;
          margin-bottom: 20px;
        }
        .ll-tip-box {
          background-color: rgba(232,117,44,0.08);
          border-radius: 10px;
          padding: 14px 18px;
          margin-top: 4px;
          border: 1px solid rgba(232,117,44,0.12);
        }
        .ll-tip-text {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: #9a4a1e;
          margin: 0;
          line-height: 1.6;
        }

        /* Flow grid */
        .ll-flow-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          gap: 10px;
          align-items: stretch;
        }
        .ll-flow-alt {
          display: grid;
          grid-template-columns: 1fr auto 1fr auto 1fr;
          gap: 10px;
          margin-top: 12px;
        }
        .ll-flow-card {
          background: #fff;
          border: 1px solid #DCE3D3;
          border-radius: 12px;
          padding: 16px;
          text-align: center;
          transition: border-color 0.2s, transform 0.2s;
        }
        .ll-flow-card:hover {
          border-color: #3C7A5C;
          transform: translateY(-2px);
        }
        .ll-flow-green { border-left: 3px solid #3C7A5C; }
        .ll-flow-orange { border-left: 3px solid #E8752C; }
        .ll-flow-gray { border-left: 3px solid #8C9184; }
        .ll-flow-step {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          font-weight: 600;
          color: #3C7A5C;
          letter-spacing: 0.1em;
          margin-bottom: 4px;
        }
        .ll-flow-label {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: 600;
          color: #1C2B22;
          margin-bottom: 4px;
        }
        .ll-flow-desc {
          font-family: var(--font-body);
          font-size: 0.78rem;
          color: #8C9184;
          line-height: 1.5;
        }
        .ll-flow-arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8C9184;
          font-size: 1.2rem;
          padding: 0 4px;
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
          .ll-card, .ll-card-cream, .ll-card-purple, .ll-card-warning, .ll-card-caution, .ll-contact-section {
            padding: 22px 18px;
          }
          .ll-flow-grid, .ll-flow-alt {
            grid-template-columns: 1fr;
          }
          .ll-flow-grid > .ll-flow-arrow {
            display: none;
          }
          .ll-flow-alt > div {
            grid-column: 1 !important;
          }
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
