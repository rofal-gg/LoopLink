"use client";

import Navbar from "./Navbar";
import Hero from "./Hero";
import ActivityTicker from "./ActivityTicker";
import Features from "./Features";
import TrustBand from "./TrustBand";
import ImpactStats from "./ImpactStats";
import CategoryExplorer from "./CategoryExplorer";
import AppPreview from "./AppPreview";
import FeaturedListings from "./FeaturedListings";
import EnvironmentalProgress from "./EnvironmentalProgress";
import CommunityGallery from "./CommunityGallery";
import Testimonials from "./Testimonials";
import WhyLoopLink from "./WhyLoopLink";
import ProcessSteps from "./ProcessSteps";
import FAQ from "./FAQ";
import Newsletter from "./Newsletter";
import CTABanner from "./CTABanner";
import Footer from "./Footer";
import { Wave } from "./shared";

/* ─── Landing — port 1:1 dari design_loop_link/src/App.tsx ───
 *
 * Semua angka/klaim yang tampil di bagian berbasis data harus berasal dari
 * `data` (hasil lib/api/landing). Setiap komponen yang memakai data bersifat
 * graceful: kalau `data`/sub-field null atau kosong, komponen menampilkan
 * notice lembut atau menyembunyikan bagian kosong — tidak pernah
 * mengada-adakan angka.
 */
export default function Landing({ loggedIn = false, data = null }) {
  const statistik = data?.statistik ?? null;

  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      <Navbar loggedIn={loggedIn} />
      <Hero loggedIn={loggedIn} data={data} />
      <ActivityTicker aktivitas={data?.aktivitas ?? []} />
      <Features />
      <Wave from="#F6F3EA" to="#1C2B22" path="b" />
      <TrustBand statistik={statistik} />
      <Wave from="#1C2B22" to="#DCE3D3" path="c" />
      <ImpactStats statistik={statistik} />
      <Wave from="#DCE3D3" to="#F6F3EA" path="a" />
      <CategoryExplorer kategori={data?.kategori ?? []} />
      <Wave from="#F6F3EA" to="#1C2B22" path="f" />
      <AppPreview statistik={statistik} />
      <Wave from="#1C2B22" to="#F6F3EA" path="g" />
      <FeaturedListings
        featured={data?.featured ?? []}
        kategori={data?.kategori ?? []}
      />
      <Wave from="#F6F3EA" to="#DCE3D3" path="h" />
      <EnvironmentalProgress statistik={statistik} />
      <Wave from="#DCE3D3" to="#F6F3EA" path="a" />
      <CommunityGallery gallery={data?.gallery ?? []} />
      <Wave from="#F6F3EA" to="#ffffff" path="h" />
      <Testimonials testimoni={data?.testimoni ?? []} />
      <Wave from="#ffffff" to="#F6F3EA" path="c" />
      <WhyLoopLink />
      <Wave from="#F6F3EA" to="#1C2B22" path="b" />
      <ProcessSteps loggedIn={loggedIn} />
      <Wave from="#1C2B22" to="#F6F3EA" path="g" />
      <FAQ statistik={statistik} />
      <Wave from="#F6F3EA" to="#ffffff" path="e" />
      <Newsletter />
      <Wave from="#ffffff" to="#3C7A5C" path="d" />
      <CTABanner loggedIn={loggedIn} data={data} />
      <Wave from="#3C7A5C" to="#111A14" path="e" />
      <Footer />
    </div>
  );
}