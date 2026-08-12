# LoopLink

Platform digital **B2B/B2C LoopLink** untuk pengelolaan limbah industri di Jawa Timur — menghubungkan produsen limbah, pengumpul, dan pengolah dalam satu ekosistem.

> Repo ini adalah **proyek akhir (Task Completion Course / TCC)** dan saat ini berisi konfigurasi agents untuk opencode, disertai dokumentasi cara menjalankan project untuk pertama kali.

---

## Struktur Folder

```
project/
├── README.md
└── .opencode/
    ├── agents/
    │   └── design-taste-frontend.md   # Agent frontend (anti-slop design)
    └── .gitignore
```

Catatan: `node_modules`, `package.json`, dan `package-lock.json` di dalam `.opencode/` sengaja tidak di-commit (git-ignore) mengikuti konfigurasi yang sudah ada. File-file ini dibuat/di-install ulang secara lokal saat setup.

---

## Prasyarat

Sebelum menjalankan project, pastikan sudah terpasang:

- **Node.js** (>= 18) — digunakan untuk dependency agent/plugin opencode.
- **opencode CLI** — alat bantu coding interaktif di terminal.
- **Git** — untuk cloning dan versioning.

---

## Menjalankan Project Pertama Kali

### 1. Clone repository

```bash
git clone https://github.com/rofal-gg/LoopLink.git
cd LoopLink
```

### 2. Install dependency agents (.opencode)

Dependency plugin opencode (mis. `@opencode-ai/plugin`) tidak ikut di-commit. Jika dibutuhkan, buat/install paket-nya di dalam folder `.opencode/`:

```bash
cd .opencode
npm install
cd ..
```

### 3. Menjalankan project (opencode)

Jalankan opencode dari root project:

```bash
opencode
```

Agent yang tersedia akan otomatis dikenali dari `.opencode/agents/`.
Untuk memanggil agent tertentu:

```bash
opencode agent design-taste-frontend
```

---

## Agent yang Disertakan

| Agent | Deskripsi |
|---|---|
| `design-taste-frontend` | Agent frontend untuk landing page, portfolio, dan redesign. Membaca brief, menyimpulkan arah desain, dan menghindari pola desain template default AI. |

---

## Lisensi

© 2026 LoopLink — Proyek TCC. Hak cipta milik tim pengembang.