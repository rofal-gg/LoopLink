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

/* ─── Landing — port 1:1 dari design_loop_link/src/App.tsx ─── */
export default function Landing({ loggedIn = false }) {
  return (
    <div style={{ fontFamily: "var(--font-body)" }}>
      <Navbar loggedIn={loggedIn} />
      <Hero loggedIn={loggedIn} />
      <ActivityTicker />
      <Features />
      <Wave from="#F6F3EA" to="#1C2B22" path="b" />
      <TrustBand />
      <Wave from="#1C2B22" to="#DCE3D3" path="c" />
      <ImpactStats />
      <Wave from="#DCE3D3" to="#F6F3EA" path="a" />
      <CategoryExplorer />
      <Wave from="#F6F3EA" to="#1C2B22" path="f" />
      <AppPreview />
      <Wave from="#1C2B22" to="#F6F3EA" path="g" />
      <FeaturedListings />
      <Wave from="#F6F3EA" to="#DCE3D3" path="h" />
      <EnvironmentalProgress />
      <Wave from="#DCE3D3" to="#F6F3EA" path="a" />
      <CommunityGallery />
      <Wave from="#F6F3EA" to="#ffffff" path="h" />
      <Testimonials />
      <Wave from="#ffffff" to="#F6F3EA" path="c" />
      <WhyLoopLink />
      <Wave from="#F6F3EA" to="#1C2B22" path="b" />
      <ProcessSteps loggedIn={loggedIn} />
      <Wave from="#1C2B22" to="#F6F3EA" path="g" />
      <FAQ />
      <Wave from="#F6F3EA" to="#ffffff" path="e" />
      <Newsletter />
      <Wave from="#ffffff" to="#3C7A5C" path="d" />
      <CTABanner loggedIn={loggedIn} />
      <Wave from="#3C7A5C" to="#111A14" path="e" />
      <Footer />
    </div>
  );
}