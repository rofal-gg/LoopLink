// LoopLink - Konstanta bersama flow cari bahan (Fase 4.4).
// Nilai kategori kebutuhan DIKIRIM PERSIS ke API (exact match dengan kolom
// `kategori_kebutuhan` tabel `kategori_kecocokan`). Jangan mengubah ejaan.

/** 6 pilihan kategori kebutuhan yang tersedia di tabel kategori_kecocokan. */
export const KEBUTUHAN_OPTIONS = [
  {
    nilai: "Bahan baku daur ulang kertas",
    label: "Daur ulang kertas",
    desc: "Karton, kardus, kertas bekas",
  },
  {
    nilai: "Bahan bakar biomassa",
    label: "Bahan bakar biomassa",
    desc: "Sisa organik jadi energi",
  },
  {
    nilai: "Kompos",
    label: "Kompos",
    desc: "Pupuk dari sisa organik",
  },
  {
    nilai: "Bahan baku tekstil daur ulang",
    label: "Tekstil daur ulang",
    desc: "Pakaian dan kain bekas",
  },
  {
    nilai: "Bahan baku pengecoran",
    label: "Bahan baku pengecoran",
    desc: "Logam untuk cor",
  },
  {
    nilai: "Bahan bakar RDF",
    label: "Bahan bakar RDF",
    desc: "Sampah olahan pengganti batu bara",
  },
];

/** Nilai khusus dropdown untuk pilihan "Lainnya (ketik manual)". */
export const OPSI_LAINNYA = "__lainnya__";

/** Label yang jelas untuk nilai yang dikirim ke API (fallback dropdown). */
export const KEBUTUHAN_LABEL = KEBUTUHAN_OPTIONS.reduce(
  (map, opt) => {
    map[opt.nilai] = opt.label;
    return map;
  },
  {}
);
