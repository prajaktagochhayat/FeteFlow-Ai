import React from 'react';
import {
  Sparkles,
  ArrowRight,
  PieChart,
  Clock,
  Briefcase,
  Users,
} from 'lucide-react';
import { HeroCelebration3D } from '../visual/HeroCelebration3D';
import { EventPlan } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';
import { BrandLogo } from '../common/BrandLogo';
import { SHOWCASE_EVENTS } from '../../data/showcaseEvents';

interface LandingPageProps {
  onOpenWizard: () => void;
  onSelectDemoEvent: (event: EventPlan) => void;
  demoEvents: EventPlan[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenWizard,
  onSelectDemoEvent,
  demoEvents,
}) => {
  return (
    <div className="space-y-24 sm:space-y-32 pb-24 overflow-hidden">
      {/* 1. CENTERED FULL-BLEED 3D HERO SECTION */}
      <section id="hero" className="relative min-h-[640px] sm:min-h-[720px] lg:min-h-[780px] w-full flex items-center justify-center overflow-hidden pt-12 pb-20">
        {/* Full-bleed Alive 3D Celebration Environment */}
        <HeroCelebration3D />

        {/* Ambient Vignette & Subtle Glow to focus attention on Center Text */}
        <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent via-brand-bg/40 to-brand-bg/90" />

        {/* Centered Content Container */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center pointer-events-none">
          <div className="flex flex-col items-center space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/40 bg-brand-surface/80 px-4 py-1.5 text-xs font-semibold text-brand-deep tracking-wider uppercase shadow-md shadow-brand-primary/10 backdrop-blur-md pointer-events-auto">
              <Sparkles className="h-3.5 w-3.5 text-brand-primary animate-pulse" />
              <span>YOUR PERSONAL AI CELEBRATION PLANNER</span>
            </div>

            {/* Main Headline (Centered, High Impact Editorial) */}
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-brand-text leading-[1.05] drop-shadow-sm pointer-events-auto">
              MAKE ROOM <br />
              <span className="bg-gradient-to-r from-brand-deep via-brand-primary to-brand-coral bg-clip-text text-transparent">
                FOR THE MAGIC.
              </span>
            </h1>

            {/* Supporting Paragraph (Centered) */}
            <p className="max-w-2xl text-base sm:text-xl text-brand-text-secondary leading-relaxed font-normal backdrop-blur-[2px] pointer-events-auto">
              From the first idea to the final confetti, let AI plan a celebration that feels unmistakably yours.
            </p>

            {/* Centered CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 pointer-events-auto">
              <button
                onClick={onOpenWizard}
                className="flex items-center justify-center gap-2.5 rounded-2xl bg-brand-primary px-8 py-4 text-sm font-bold text-white shadow-xl shadow-brand-primary/30 transition-all hover:bg-brand-primary-hover hover:scale-105 active:scale-95"
              >
                <Sparkles className="h-4 w-4" />
                <span>Plan My Celebration</span>
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('discover');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="flex items-center justify-center gap-2 rounded-2xl border border-brand-border bg-brand-surface/85 px-7 py-4 text-sm font-semibold text-brand-text shadow-sm backdrop-blur-md transition-all hover:border-brand-primary hover:bg-brand-surface hover:scale-105 active:scale-95"
              >
                <span>Explore the Magic</span>
                <ArrowRight className="h-4 w-4 text-brand-coral" />
              </button>
            </div>

            {/* Centered Trust / Category Strip */}
            <div className="pt-6 border-t border-brand-border/40 pointer-events-auto">
              <p className="text-xs sm:text-sm font-medium tracking-wide text-brand-text-secondary">
                Weddings · Birthdays · Community Events · Your Imagination
              </p>
            </div>
          </div>
        </div>

        {/* 3D Interaction Tip Pill */}
        <div className="pointer-events-none absolute bottom-4 right-6 rounded-full border border-brand-border/60 bg-brand-surface/75 px-3 py-1 text-[11px] font-semibold text-brand-text-secondary backdrop-blur-md shadow-sm">
          ✨ Move cursor to look around · Click to pop
        </div>
      </section>

      {/* 2. DISCOVER & SHOWCASE OF CELEBRATIONS */}
      <section id="discover" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-deep uppercase tracking-wider">
            Tailored Experiences
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand-text">
            Every celebration has its own soul.
          </h2>
          <p className="text-sm sm:text-base text-brand-text-secondary">
            Whether an intimate twilight wedding, a high-octane 30th birthday, or a 300-person neighborhood fair, FêteFlow AI balances design with exact budgeting and actionable timelines.
          </p>
        </div>

        {/* Demo Cards Grid */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {SHOWCASE_EVENTS.map(evt => {
            return (
              <div
                key={evt.id}
                onClick={() => onSelectDemoEvent(evt)}
                className="group relative flex flex-col justify-between rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm transition-all hover:border-brand-primary/50 hover:shadow-xl cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="rounded-xl bg-brand-soft px-3 py-1 text-xs font-bold text-brand-deep uppercase">
                      {evt.eventType}
                    </span>
                    <span className="text-xs font-semibold text-brand-primary">
                      {evt.guestCount} Guests
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                    {evt.name}
                  </h3>

                  <p className="mt-2 text-xs text-brand-text-secondary line-clamp-3 leading-relaxed">
                    {evt.eventConcept.description}
                  </p>

                  {/* Palette Preview */}
                  <div className="mt-4 flex items-center gap-1.5">
                    {evt.eventConcept.colorPalette.map((c, i) => (
                      <div
                        key={i}
                        className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  {/* Highlights with Indian Numbering Format */}
                  <div className="mt-5 space-y-2 border-t border-brand-border/60 pt-4 text-xs text-brand-text-secondary">
                    <div className="flex items-center justify-between">
                      <span>Target Date:</span>
                      <strong className="text-brand-text">{evt.date}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Total Budget:</span>
                      <strong className="text-brand-text text-brand-primary font-bold">
                        {formatCurrency(evt.budget.totalBudget, evt.budget.currency)}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Milestones:</span>
                      <strong className="text-brand-text">{evt.timeline.length} Scheduled</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-brand-border">
                  <span className="text-xs font-bold text-brand-primary group-hover:underline">
                    Explore Workspace Plan
                  </span>
                  <ArrowRight className="h-4 w-4 text-brand-primary transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-brand-border bg-gradient-to-b from-brand-elevated/40 via-brand-surface to-brand-elevated/30 p-8 sm:p-14 shadow-sm">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-deep uppercase tracking-wider">
              Workflow
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-text">
              From daydream to day-of in 3 steps.
            </h2>
            <p className="text-xs sm:text-sm text-brand-text-secondary">
              A thoughtful synthesis of human creative desires and machine precision.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-brand-surface border border-brand-border/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-primary font-serif font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-text">Share What You Celebrate</h3>
              <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
                Input your event type, date, guest count, financial boundary, and atmospheric vision in our 5-step wizard.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-brand-surface border border-brand-border/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-coral/20 text-brand-coral font-serif font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-text">Generative Architecture</h3>
              <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
                FêteFlow AI builds a tailored concept: allocating budget lines, sequencing chronological milestones, and curating vendor briefs.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-brand-surface border border-brand-border/60">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-deep/20 text-brand-deep font-serif font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-brand-text">Collaborative Execution</h3>
              <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
                Fine-tune allocations with the AI Budget Strategist, track RSVPs, run timeline recovery, and generate bespoke invitations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-deep uppercase tracking-wider">
            Engineered Capabilities
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-brand-text">
            Everything your celebration needs. Zero chaos.
          </h2>
          <p className="text-sm text-brand-text-secondary">
            Built from first principles for genuine generative AI utility, data persistence, and security.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
            <PieChart className="h-6 w-6 text-brand-primary mb-3" />
            <h3 className="font-serif text-base font-bold text-brand-text">Interactive Budget Studio</h3>
            <p className="mt-1 text-xs text-brand-text-secondary leading-relaxed">
              SVG Donut allocations, estimated vs actual spend tracking, overrun alerts, and conversational AI budget rebalancing.
            </p>
          </div>

          <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
            <Clock className="h-6 w-6 text-brand-coral mb-3" />
            <h3 className="font-serif text-base font-bold text-brand-text">Chronological Timeline</h3>
            <p className="mt-1 text-xs text-brand-text-secondary leading-relaxed">
              Target date milestones, priority tags, filtering, and automated AI recovery assistance for overdue obligations.
            </p>
          </div>

          <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
            <Briefcase className="h-6 w-6 text-brand-deep mb-3" />
            <h3 className="font-serif text-base font-bold text-brand-text">Vendor RFP Briefs</h3>
            <p className="mt-1 text-xs text-brand-text-secondary leading-relaxed">
              Generate customized professional briefs with scope of work, budget ceilings, and specific questions to ask prospective vendors.
            </p>
          </div>

          <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
            <Users className="h-6 w-6 text-emerald-500 mb-3" />
            <h3 className="font-serif text-base font-bold text-brand-text">Guest Studio & Invites</h3>
            <p className="mt-1 text-xs text-brand-text-secondary leading-relaxed">
              RSVP tallies, dietary restrictions, accessibility tracking, and 4 distinct AI invitation copy wordings with 1-click copy.
            </p>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM INVITATION BANNER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-deep via-brand-primary to-brand-coral p-10 sm:p-16 text-center text-white shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
              Ready to make room for the magic?
            </h2>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed">
              Join FêteFlow AI and transform your celebration vision into an actionable, stress-free plan today.
            </p>
            <div className="pt-4">
              <button
                onClick={onOpenWizard}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-bold text-brand-deep shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-brand-primary" />
                <span>Start Planning Now</span>
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 border-t border-brand-border/60 text-xs text-brand-text-secondary flex flex-col sm:flex-row items-center justify-between gap-4">
        <BrandLogo size="sm" showTagline={true} />
        <div className="flex items-center gap-4">
          <span className="font-medium text-brand-primary">Google Gemini API</span>
          <span>·</span>
          <span>Three.js 3D</span>
          <span>·</span>
          <span>Tailwind Design Tokens</span>
        </div>
      </footer>
    </div>
  );
};
