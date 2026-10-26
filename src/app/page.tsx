'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/layout/Hero';
import { PricingSection } from '@/features/services-catalog/components/PricingSection';
import { ShowcaseGallery } from '@/features/showcase/components/ShowcaseGallery';
import { TestimonialsSection } from '@/features/testimonials/components/TestimonialsSection';
import { Footer } from '@/components/layout/Footer';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { useQueue } from '@/features/tickets/hooks/useQueue';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ServicePlan } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { waitingCount } = useQueue();
  const { isAuthenticated } = useAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handlePlanChosen = (plan: ServicePlan, hasMagicApps: boolean) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    // Authenticated users go to their dedicated dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Navigation */}
      <Navbar
        isAuthenticated={isAuthenticated}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Hero Section */}
      <Hero
        isAuthenticated={isAuthenticated}
        onOpenTicketModal={() => router.push('/dashboard')}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        waitingCount={waitingCount}
      />

      {/* Pricing & Services Section */}
      <PricingSection
        isAuthenticated={isAuthenticated}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onPlanChosen={handlePlanChosen}
      />

      {/* Results Showcase Gallery */}
      <ShowcaseGallery />

      {/* Clientes Satisfechos / Real Setups Proof */}
      <TestimonialsSection />

      {/* Footer */}
      <Footer />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
