import React from 'react';
import { SEO } from '../components/landing/SEO';
import { MobileNav } from '../components/landing/MobileNav';
import { HeroSection } from '../components/landing/HeroSection';
import { StatsSection } from '../components/landing/StatsSection';
import { TiendanubeSection } from '../components/landing/TiendanubeSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { IntegrationSection } from '../components/landing/IntegrationSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { FAQSection } from '../components/landing/FAQSection';
import { PricingSection } from '../components/landing/PricingSection';
import { ComparisonSection } from '../components/landing/ComparisonSection';
import { CTASection } from '../components/landing/CTASection';
import { Footer } from '../components/landing/Footer';

export const Landing: React.FC = () => {
  return (
    <>
      <SEO />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <MobileNav />
        <HeroSection />
        <StatsSection />
        <TiendanubeSection />
        <TestimonialsSection />
        <IntegrationSection />
        <FeaturesSection />
        <FAQSection />
        <PricingSection />
        <ComparisonSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
};