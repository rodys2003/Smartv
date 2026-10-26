'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/layout/Hero';
import { PricingSection } from '@/features/services-catalog/components/PricingSection';
import { ShowcaseGallery } from '@/features/showcase/components/ShowcaseGallery';
import { StepByStepGuide } from '@/features/guide/components/StepByStepGuide';
import { QueueTracker } from '@/features/tickets/components/QueueTracker';
import { Footer } from '@/components/layout/Footer';
import { TicketModal } from '@/features/tickets/components/TicketModal';
import { AuthModal } from '@/features/auth/components/AuthModal';
import { useQueue } from '@/features/tickets/hooks/useQueue';
import { ServicePlan, Ticket } from '@/types';

export default function HomePage() {
  const { waitingCount } = useQueue();

  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [preselectedPlan, setPreselectedPlan] = useState<ServicePlan | null>(null);
  const [preselectedMagicApps, setPreselectedMagicApps] = useState(false);
  const [userCurrentTicket, setUserCurrentTicket] = useState<Ticket | null>(null);

  const handleOpenTicketModal = () => {
    setIsTicketModalOpen(true);
  };

  const handlePlanChosen = (plan: ServicePlan, hasMagicApps: boolean) => {
    setPreselectedPlan(plan);
    setPreselectedMagicApps(hasMagicApps);
    setIsTicketModalOpen(true);
  };

  const handleTicketCreated = (ticket: Ticket) => {
    setUserCurrentTicket(ticket);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Navigation */}
      <Navbar
        onOpenTicketModal={handleOpenTicketModal}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Hero Section */}
      <Hero
        onOpenTicketModal={handleOpenTicketModal}
        waitingCount={waitingCount}
      />

      {/* Pricing & Services Section */}
      <PricingSection onPlanChosen={handlePlanChosen} />

      {/* Results Showcase Gallery */}
      <ShowcaseGallery />

      {/* Step by Step Guide & WhatsApp Checklist */}
      <StepByStepGuide
        currentTicket={userCurrentTicket}
        onOpenTicketModal={handleOpenTicketModal}
      />

      {/* Live Queue Tracker */}
      <QueueTracker onOpenTicketModal={handleOpenTicketModal} />

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
