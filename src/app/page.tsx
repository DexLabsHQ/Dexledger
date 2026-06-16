import { LandingNav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SupportedBusinesses } from "@/components/landing/supported-businesses";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { CTA, Footer } from "@/components/landing/cta-footer";

// LandingNav is now an async Server Component — reads auth state on server.
// No client-side flash. No extra fetch needed here.
export default function LandingPage() {
  return (
    <main>
      <LandingNav />
      <Hero />
      <Features />
      <HowItWorks />
      <SupportedBusinesses />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
