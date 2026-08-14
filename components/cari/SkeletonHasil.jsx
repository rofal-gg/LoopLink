"use client";

// Skeleton loading hasil pencarian: kartu-kartu shimmer bernada loop-mist /
// loop-base agar layout akhir (grid hasil) sudah terlihat sejak awal.
export default function SkeletonHasil({ jumlah = 6 }) {
  return (
    <div className="mt-6" aria-label="Memuat hasil pencarian" role="status">
      <div className="h-4 w-64 animate-pulse rounded-full bg-loop-mist" />
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: jumlah }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-loop-mist bg-white shadow-sm"
          >
            <div className="aspect-[4/3] w-full animate-pulse bg-loop-mist" />
            <div className="p-5">
              <div className="flex gap-2">
                <div className="h-5 w-20 animate-pulse rounded-full bg-loop-mist" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-loop-base" />
              </div>
              <div className="mt-3 h-5 w-3/4 animate-pulse rounded-full bg-loop-mist" />
              <div className="mt-2 h-4 w-1/3 animate-pulse rounded-full bg-loop-base" />
              <div className="mt-4 h-4 w-24 animate-pulse rounded-full bg-loop-mist" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}