import { ButtonLink } from "@/components/ui/Button";

/**
 * Halaman placeholder "sedang dibangun" untuk fitur fase selanjutnya
 * (4.3 Upload, 4.4 Cari). Server Component — tidak ada logika auth di sini;
 * halaman induk (app/upload, app/cari) yang menangani guard + header.
 */
export default function ComingSoon({
  icon: Icon,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6">
      <div className="rounded-[20px] border border-loop-mist bg-white p-8 text-center shadow-[0_12px_40px_rgba(28,43,34,0.08)] sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-mist text-loop-primary">
          <Icon className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-loop-ink">
          {title}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-loop-line">
          {description}
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <ButtonLink href={primaryHref} variant="primary">
            {primaryLabel}
          </ButtonLink>
          {secondaryHref ? (
            <ButtonLink href={secondaryHref} variant="secondary">
              {secondaryLabel}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </main>
  );
}