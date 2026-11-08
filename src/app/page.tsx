import { getCurrentUser } from "@/lib/require-user";
import { LandingNav } from "@/components/landing/LandingNav";
import { Faq, Features, FinalCta, Hero, HowItWorks, LandingFooter, Principles } from "@/components/landing/Sections";

export default async function Home() {
  // Signed-in visitors get "Open dashboard" instead of sign-in buttons.
  const signedIn = Boolean(await getCurrentUser());

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <LandingNav signedIn={signedIn} />
      <Hero signedIn={signedIn} />
      <HowItWorks />
      <Features />
      <Principles />
      <Faq />
      <FinalCta signedIn={signedIn} />
      <LandingFooter />
    </div>
  );
}
