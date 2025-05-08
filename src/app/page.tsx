import HeroSection from "@/components/layout/HeroSection";
import FeaturesPage from "@/components/layout/landingPage/FeaturesPage";
import Footer from "@/components/layout/landingPage/Footer";
import Solutions from "@/components/layout/landingPage/Solutions";
import TestimonialSection from "@/components/layout/landingPage/testimonial-section";
import Navigation from "@/components/layout/Navigation";


export default function Home() {
  return (
    <div>
      <Navigation />
      <HeroSection />
      <Solutions />
      <FeaturesPage />
      <TestimonialSection />

      <Footer />
    </div>
  );
}
