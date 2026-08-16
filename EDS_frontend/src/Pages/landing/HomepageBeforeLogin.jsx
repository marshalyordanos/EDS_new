import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "../../styles/landing.css";
import PublicLayout from "../../layouts/PublicLayout";
import useLandingIndex from "../../hooks/useLandingIndex";

import HeroSection from "../../Components/landing/HeroSection";
import WhatWeProvideSection from "../../Components/landing/WhatWeProvideSection";
import HowItWorksSection from "../../Components/landing/HowItWorksSection";
import SectorsCoveredSection from "../../Components/landing/SectorsCoveredSection";
import GeographicReach from "../../Components/landing/GeographicReach";
import TrustSecurity from "../../Components/landing/TrustSecurity";
import BlogPreviewSection from "../../Components/landing/BlogPreviewSection";
import Testimonials from "../../Components/landing/Testimonials";
import ContactSection from "../../Components/landing/ContactSection";
import CTASection from "../../Components/landing/CTASection";

/**
 * Public landing page ("The Index").
 *
 * Public index data is fetched once here and passed down, so the hero and the
 * reach breakdown share a single request instead of each fetching their own.
 * The `ld-root` wrapper scopes the landing design tokens — see landing.css.
 */
const HomepageBeforeLogin = () => {
  const index = useLandingIndex();
  const { hash } = useLocation();

  // React Router only swaps the DOM on a same-tab navigation - the browser's
  // built-in "scroll to #hash on load" never fires. Arriving here from
  // another page (e.g. the navbar's section links from /blog) needs the
  // same jump done by hand, once the target section exists to scroll to.
  useEffect(() => {
    if (!hash) return;
    const target = document.querySelector(hash);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <PublicLayout className="ld-root">
      <div>
        <HeroSection index={index} />
        <WhatWeProvideSection />
        <HowItWorksSection />
        <SectorsCoveredSection />
        <GeographicReach records={index.data.samples} />
        <TrustSecurity />
        <BlogPreviewSection />
        <Testimonials />
        <ContactSection />
        <CTASection />
      </div>
    </PublicLayout>
  );
};

export default HomepageBeforeLogin;
