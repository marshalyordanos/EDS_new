import "../../styles/homepage.css";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import PublicLayout from "../../layouts/PublicLayout";
import HeroSection from "../../Components/landing/HeroSection";
import WhatWeProvideSection from "../../Components/landing/WhatWeProvideSection";
import HowItWorksSection from "../../Components/landing/HowItWorksSection";
import SectorsCoveredSection from "../../Components/landing/SectorsCoveredSection";
import WhoWeAreSection from "../../Components/landing/WhoWeAreSection";
import CTASection from "../../Components/landing/CTASection";
import ContactSection from "../../Components/landing/ContactSection";
import GeographicReach from "../../Components/landing/GeographicReach";
import BlogPreviewSection from "../../Components/landing/BlogPreviewSection";
import TrustSecurity from "../../Components/landing/TrustSecurity";
import Testimonials from "../../Components/landing/Testimonials";

const HomepageBeforeLogin = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <PublicLayout>
      <HeroSection />
      <WhatWeProvideSection />
      <HowItWorksSection />
      <SectorsCoveredSection />
      {/* <WhoWeAreSection /> */}
      <GeographicReach />
      <TrustSecurity />
      <BlogPreviewSection />
      <Testimonials />
      <ContactSection />
      <CTASection />
    </PublicLayout>
  );
};

export default HomepageBeforeLogin;
