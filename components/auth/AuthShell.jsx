

/**
 * Kerangka halaman auth (login, register, lupa password, reset password).
 * Sesuai design language loop: halaman cream, kartu putih dengan border
 * mist #DCE3D3, logo di atas, judul Fraunces.
 */
/* Mark dimensi landscape 2.75:1 — pakai height tetap, width auto supaya natural */
const AUTH_MARK_STYLE = `
  .auth-mark { height: 48px; width: auto; object-fit: contain; }
`;

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <>
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-loop-base px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex flex-col items-center">
            <img src="/logo.svg" className="auth-mark" alt="LoopLink" />
            <p className="mt-3 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-loop-primary">
              Bursa limbah hiper-lokal
            </p>
          </div>

          <div className="rounded-[20px] border border-loop-mist bg-white p-6 shadow-[0_12px_40px_rgba(28,43,34,0.08)] sm:p-8">
            <h1
              className="font-display text-2xl font-bold tracking-tight text-loop-ink"
              style={{ letterSpacing: "-0.01em" }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-1.5 text-sm text-loop-line">{subtitle}</p>
            ) : null}
            <div className="mt-6">{children}</div>
          </div>

          {footer ? (
            <div className="mt-5 text-center text-sm text-loop-line">
              {footer}
            </div>
          ) : null}
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: AUTH_MARK_STYLE }} />
    </>
  );
}