import HeroSection from "@/components/layout/HeroSection";
import BentoGrid from "@/components/layout/landingPage/BentoGrid";
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
      <FeaturesSection />
      <BentoGrid />
      <TestimonialSection />
      <Footer />
    </div>
  );
}
