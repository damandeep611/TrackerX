import HeroSection from "@/components/layout/HeroSection";
import FeatureGrid from "@/components/layout/landingPage/FeatureGrid";
import FeaturesSection from "@/components/layout/landingPage/FeaturesSection";
import Footer from "@/components/layout/landingPage/Footer";
import MarqueeSection from "@/components/layout/landingPage/MarqueeSection";
import TestimonialSection from "@/components/layout/landingPage/testimonial-section";
import Navigation from "@/components/layout/Navigation";

export default function Home() {
  return (
    <div>
      <Navigation />
      <HeroSection />
      <MarqueeSection />
      <FeatureGrid />
      <FeaturesSection />
      <TestimonialSection />
      <Footer />
    </div>
  );
}
