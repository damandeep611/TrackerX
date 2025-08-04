import HeroSection from "@/components/layout/HeroSection";
import BentoGrid from "@/components/layout/landingPage/BentoGrid";
import FeaturesSection from "@/components/layout/landingPage/FeaturesSection";
import Footer from "@/components/layout/landingPage/Footer";
import TestimonialSection from "@/components/layout/landingPage/testimonial-section";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <BentoGrid />
      <TestimonialSection />
      <Footer />
    </div>
  );
}
