import { HeroSection } from './hero-section'
import { LogoStrip } from './logo-strip'
import { ProblemSolution } from './problem-solution'
import { FeaturesGrid } from './features-grid'
import { Testimonials } from './testimonials'
import { MetricsSection } from './metrics-section'
import { Platforms } from './platforms'
import { PricingSection } from './pricing-section'
import { FAQSection } from './faq-section'
import { CTABanner } from './cta-banner'
import { Navigation } from './navigation'
import { Footer } from './footer'

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <Navigation />
      <HeroSection />
      <LogoStrip />
      <ProblemSolution />
      <FeaturesGrid />
      <MetricsSection />
      <Testimonials />
      <Platforms />
      <PricingSection />
      <FAQSection />
      <CTABanner />
      <Footer />
    </div>
  )
}
