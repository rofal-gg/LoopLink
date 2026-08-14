"use client";

import { Button, ButtonLink } from "@/components/ui/Button";
import { IconSearch } from "@/components/icons";

/**
 * Empty state hasil kosong: saran nyata (perluas radius / ubah kategori)
 * plus catatan bahwa kecocokan mengikuti aturan kategori yang persis.
 */
export default function EmptyState({
  onPerluasRadius,
  bisaPerluas = false,
  onUbahKategori,
}) {
  return (
    <section
      aria-label="Tidak ada hasil"
      className="mx-auto mt-6 max-w-xl rounded-2xl border border-loop-mist bg-white p-6 text-center shadow-sm sm:p-10"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-loop-mist text-loop-primary">
        <IconSearch className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-display text-xl font-semibold tracking-tight text-loop-ink">
        Belum ada hasil di radius ini
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-loop-line">
        Tidak ada bahan yang cocok dengan kebutuhanmu dalam radius saat ini.
        Coba langkah berikut supaya hasilnya muncul.
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
        {bisaPerluas ? (
          <Button variant="primary" onClick={onPerluasRadius}>
            Perluas radius
          </Button>
        ) : (
          <p className="text-xs text-loop-line">
            Radius sudah maksimal (100 km)
          </p>
        )}
        <Button variant="ghost" onClick={onUbahKategori}>
          Ubah kategori kebutuhan
        </Button>
      </div>

      <p className="mt-5 border-t border-loop-rowline pt-4 text-xs leading-relaxed text-loop-line">
        Kecocokan mengikuti daftar kebutuhan terdaftar (mis. kardus cocok
        untuk daur ulang kertas). Kalau pasangan kategorinya belum ada,
        hasilnya akan kosong walaupun lokasinya dekat.
      </p>
    </section>
  );
}