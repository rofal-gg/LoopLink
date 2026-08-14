import { ButtonLink } from "@/components/ui/Button";

/**
 * State kosong bersama untuk halaman manajemen pribadi: ikon + judul +
 * penjelasan + CTA. Dipakai Listing Saya (CTA ke /upload) dan Klaim Saya
 * (CTA ke /cari).
 */
export default function Kosong({ icon: Icon, title, body, href, hrefLabel }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-loop-mist bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-mist text-loop-primary">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-display text-lg font-semibold tracking-tight text-loop-ink">
        {title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-loop-line">{body}</p>
      {href ? (
        <div className="mt-6">
          <ButtonLink href={href} variant="primary">
            {hrefLabel}
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}