"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Logo from "@/components/brand/Logo";
import {
  IconHome,
  IconLogOut,
  IconSearch,
  IconUpload,
} from "@/components/icons";
import {
  ChevronRight,
  Package,
  Settings,
  ShieldCheck,
  User,
} from "lucide-react";

const NAV = [
  { href: "/home", label: "Beranda", icon: IconHome },
  { href: "/cari", label: "Cari Bahan", icon: IconSearch },
  { href: "/upload", label: "Upload Limbah", icon: IconUpload },
];

/** Menu manajemen pribadi (Fase 4.6) - tampil di dropdown avatar. */
const MENU_AKUN = [
  { href: "/listing-saya", label: "Listing Saya", icon: Package },
  { href: "/klaim-saya", label: "Klaim Saya", icon: ShieldCheck },
  { href: "/profil", label: "Profil", icon: User },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

const GLASS_PILL =
  "flex items-center gap-2 rounded-[14px] border border-white/10 bg-loop-ink/40 px-4 py-2.5 backdrop-blur-[20px] backdrop-saturate-150 shadow-[0_4px_20px_rgba(28,43,34,0.14)]";

/**
 * Header aplikasi (halaman yang butuh login).
 * Client Component karena membutuhkan tombol keluar (signOut).
 * Gaya: pill kaca gelap melayang (sama dengan navbar landing).
 * Desktop: logo + nav satu baris + avatar. Mobile: logo + avatar
 * (nav & keluar di dalam menu avatar).
 */
export default function AppHeader({ nama = null, email = "", currentPath = "" }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // Tetap arahkan ke beranda walau signOut gagal; proxy akan menolak sesi.
    }
    router.push("/");
    router.refresh();
    setBusy(false);
  }

  const initial = (nama || email || "?").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto flex w-full max-w-[1380px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        {/* Pill 1 — Logo */}
        <div className={GLASS_PILL}>
          <Logo
            href="/home"
            textClassName="text-loop-base"
            markClassName="h-10 w-10"
          />
        </div>

        {/* Pill 2 — Nav desktop */}
        <nav
          aria-label="Navigasi utama"
          className="hidden items-center gap-1 rounded-[14px] border border-white/10 bg-loop-ink/40 p-1.5 backdrop-blur-[20px] backdrop-saturate-150 shadow-[0_4px_20px_rgba(28,43,34,0.14)] md:flex"
        >
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = currentPath === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`fr inline-flex items-center gap-1.5 whitespace-nowrap rounded-[10px] px-3.5 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-loop-base"
                    : "text-loop-base/60 hover:bg-white/10 hover:text-loop-base"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Pill 3 — Avatar */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu pengguna"
            aria-expanded={menuOpen}
            className="fr flex items-center gap-2 rounded-full border border-white/10 bg-loop-ink/40 py-1.5 pl-1.5 pr-4 text-loop-base backdrop-blur-[20px] backdrop-saturate-150 shadow-[0_4px_20px_rgba(28,43,34,0.14)] transition hover:bg-loop-ink/60"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-loop-primary text-sm font-semibold text-loop-base">
              {initial}
            </span>
            <span className="hidden max-w-[140px] truncate text-sm font-semibold sm:block">
              {nama || "Anggota"}
            </span>
          </button>

          {menuOpen ? (
            <>
              <button
                type="button"
                aria-label="Tutup menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-64 rounded-2xl border border-white/10 bg-loop-ink/95 p-1.5 shadow-[0_20px_60px_rgba(28,43,34,0.4)] backdrop-blur-[24px] backdrop-saturate-150">
                <div className="border-b border-white/10 px-3 py-2.5">
                  <p className="truncate font-display text-sm font-bold text-loop-base">
                    {nama || "Anggota LoopLink"}
                  </p>
                  <p className="truncate font-mono text-xs text-loop-line">
                    {email}
                  </p>
                </div>

                <nav
                  aria-label="Navigasi menu"
                  className="flex flex-col gap-0.5 py-1.5 md:hidden"
                >
                  {NAV.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={`fr flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                        currentPath === href
                          ? "bg-white/10 text-loop-base"
                          : "text-loop-base/75 hover:bg-white/5 hover:text-loop-base"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </span>
                      <ChevronRight size={14} className="opacity-40" />
                    </Link>
                  ))}
                </nav>

                <div className="mt-1 border-t border-white/10 pt-1.5">
                  <p className="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-loop-line">
                    Akun
                  </p>
                  <nav
                    aria-label="Manajemen akun"
                    className="flex flex-col gap-0.5 pb-1"
                  >
                    {MENU_AKUN.map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className={`fr flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium ${
                          currentPath === href
                            ? "bg-white/10 text-loop-base"
                            : "text-loop-base/75 hover:bg-white/5 hover:text-loop-base"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {label}
                        </span>
                        <ChevronRight size={14} className="opacity-40" />
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="mt-1 border-t border-white/10 pt-1.5">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={busy}
                    className="fr flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-loop-mint hover:bg-white/5 disabled:opacity-60"
                  >
                    <IconLogOut className="h-4 w-4" />
                    Keluar
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}