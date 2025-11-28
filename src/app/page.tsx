import FaqSection from "@/components/layout/landingPage/faq-section";
import FeatureSection from "@/components/layout/landingPage/feature-section/FeatureSection";
import Footer from "@/components/layout/landingPage/Footer";
import Hero from "@/components/layout/landingPage/Hero";
import HeroFoot from "@/components/layout/landingPage/HeroFoot";
import ShowcaseCards from "@/components/layout/landingPage/showcase-cards/ShowcaseCards";
import TestimonialSection from "@/components/layout/landingPage/testimonial-section";

export default function Home() {
  return (
    <div>
      <Hero />
      <HeroFoot />
      <FeatureSection />
      <ShowcaseCards />
      <TestimonialSection />
      <FaqSection />
      <Footer />
    </div>
  );
}
