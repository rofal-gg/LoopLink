import Link from "next/link";
import { RefreshCw } from "lucide-react";

/**
 * Logo LoopLink — mark tile emerald + ikon RefreshCw (lucide) +
 * wordmark Fraunces. Sesuai design reference (design_loop_link).
 * Dipakai di header publik, header app, halaman auth, dan footer.
 */
export function LogoMark({ size = 32, className = "" }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-lg bg-loop-primary ${className}`}
      style={{ width: size, height: size, borderRadius: 8 }}
    >
      <RefreshCw size={size * 0.52} color="#fff" strokeWidth={2.2} />
    </span>
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
