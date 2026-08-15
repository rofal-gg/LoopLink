import Link from "next/link";

/**
 * Logo LoopLink — mark diambil dari aset statis /logo.svg (public) +
 * wordmark Fraunces. Satu source dipakai juga sebagai favicon
 * (metadata icons di app/layout.js).
 * Dipakai di header publik, header app, halaman auth, dan footer.
 */
export function LogoMark({ size = 40, className = "" }) {
  return (
    <img
      src="/logo.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
    />
  );
}

export default function Logo({
  href = "/",
  textClassName = "",
  className = "",
  markClassName = "",
}) {
  const word = (
    <span
      className={`whitespace-nowrap font-display text-lg font-bold tracking-tight text-loop-ink ${textClassName}`}
      style={{ letterSpacing: "-0.01em" }}
    >
      LoopLink
    </span>
  );

  if (!href) {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        <LogoMark className={markClassName} />
        {word}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`fr inline-flex items-center gap-2 rounded-lg ${className}`}
      aria-label="LoopLink - beranda"
    >
      <LogoMark className={markClassName} />
      {word}
    </Link>
  );
}
