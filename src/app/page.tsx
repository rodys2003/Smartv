'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/layout/Hero';
import { PricingSection } from '@/features/services-catalog/components/PricingSection';
import { ShowcaseGallery } from '@/features/showcase/components/ShowcaseGallery';
import { TestimonialsSection } from '@/features/testimonials/components/TestimonialsSection';
import { StepByStepGuide } from '@/features/guide/components/StepByStepGuide';
import { QueueTracker } from '@/features/tickets/components/QueueTracker';
import { Footer } from '@/components/layout/Footer';
import { TicketModal } from '@/features/tickets/components/TicketModal';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { useQueue } from '@/features/tickets/hooks/useQueue';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ServicePlan, Ticket } from '@/types';

export default function HomePage() {
  const { waitingCount } = useQueue();
  const { isAuthenticated } = useAuth();

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [preselectedPlan, setPreselectedPlan] = useState<ServicePlan | null>(null);
  const [preselectedMagicApps, setPreselectedMagicApps] = useState(false);
  const [userCurrentTicket, setUserCurrentTicket] = useState<Ticket | null>(null);

  const handleOpenTicketModal = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsTicketModalOpen(true);
  };

  const handlePlanChosen = (plan: ServicePlan, hasMagicApps: boolean) => {
    setPreselectedPlan(plan);
    setPreselectedMagicApps(hasMagicApps);
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsTicketModalOpen(true);
  };

  const handleTicketCreated = (ticket: Ticket) => {
    setUserCurrentTicket(ticket);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Navigation */}
      <Navbar
        isAuthenticated={isAuthenticated}
        onOpenTicketModal={handleOpenTicketModal}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Hero Section */}
      <Hero
        isAuthenticated={isAuthenticated}
        onOpenTicketModal={handleOpenTicketModal}
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

      {/* Clientes Satisfechos / Real Setups */}
      <TestimonialsSection />

      {/* Step by Step Guide, Video Tutorials & WhatsApp (Visible only if logged in) */}
      <StepByStepGuide
        currentTicket={userCurrentTicket}
        isAuthenticated={isAuthenticated}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenTicketModal={handleOpenTicketModal}
      />

      {/* Live Queue Tracker (Visible only if logged in) */}
      <QueueTracker
        isAuthenticated={isAuthenticated}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenTicketModal={handleOpenTicketModal}
      />

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        initialPlan={preselectedPlan}
        initialMagicApps={preselectedMagicApps}
        onTicketCreated={handleTicketCreated}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
