import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  Heart,
  Cake,
  Calendar,
  Users,
  Compass,
  Briefcase,
  Wand2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Banknote,
  Palette,
  RefreshCw,
} from 'lucide-react';
import { EventType, EventWizardInput, EventPlan } from '../../types';
import { ApiService } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

interface EventWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: EventPlan) => void;
}

const EVENT_TYPES: Array<{
  type: EventType;
  title: string;
  tagline: string;
  icon: any;
  color: string;
}> = [
  { type: 'wedding', title: 'Wedding', tagline: 'Unforgettable romance & vows', icon: Heart, color: 'text-rose-500' },
  { type: 'birthday', title: 'Birthday', tagline: 'Milestones, cake & revelry', icon: Cake, color: 'text-amber-500' },
  { type: 'anniversary', title: 'Anniversary', tagline: 'Honoring shared journeys', icon: Sparkles, color: 'text-violet-500' },
  { type: 'community', title: 'Community Gathering', tagline: 'Neighborhoods & shared tables', icon: Users, color: 'text-emerald-500' },
  { type: 'cultural', title: 'Cultural Celebration', tagline: 'Heritage, festivals & traditions', icon: Compass, color: 'text-indigo-500' },
  { type: 'corporate', title: 'Corporate & Gala', tagline: 'Conferences, launches & retreats', icon: Briefcase, color: 'text-blue-500' },
  { type: 'custom', title: 'Custom Celebration', tagline: 'Your imagination, unbound', icon: Wand2, color: 'text-coral-500' },
];

const INSPIRATION_CHIPS = [
  'Dreamy garden twilight with fairy lights',
  'Minimalist contemporary rooftop with jazz',
  'Colorful retro birthday with confetti & cocktails',
  'Cozy neighborhood harvest fair with acoustic music',
  'Classic regal ballroom with candlelight & floral arch',
  'Modern bohemian gathering with warm velvet & brass',
];

export const EventWizardModal: React.FC<EventWizardModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
}) => {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerUsed, setProviderUsed] = useState<'gemini' | 'fallback' | null>(null);

  // Form State
  const [formData, setFormData] = useState<EventWizardInput>({
    eventType: 'wedding',
    eventName: '',
    date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    location: '',
    guestCount: 80,
    setting: 'outdoor',
    duration: '1 Day',
    budgetAmount: 500000,
    currency: 'INR',
    budgetFlexibility: 'Moderate',
    stylePreference: 'Modern Romantic Chic',
    colorPreference: 'Lilac, Soft Coral, and Ivory',
    foodPreference: 'Seasonal multi-course tasting',
    accessibilityNeeds: '',
    priorities: ['Venue & Architecture', 'Catering & Beverages', 'Atmosphere & Decor'],
    atmosphereDescription: '',
  });

  // Generated Plan State (Step 5)
  const [generatedPlan, setGeneratedPlan] = useState<EventPlan | null>(null);

  if (!isOpen) return null;

  const handleNextStep = async () => {
    setError(null);

    if (step === 1 && !formData.eventType) {
      setError('Please choose an event category to continue.');
      return;
    }

    if (step === 2) {
      if (!formData.eventName.trim()) {
        setError('Please name your celebration.');
        return;
      }
      if (!formData.date) {
        setError('Please select a target celebration date.');
        return;
      }
      if (formData.guestCount <= 0) {
        setError('Guest count must be at least 1.');
        return;
      }
    }

    if (step === 3) {
      if (formData.budgetAmount <= 0) {
        setError('Please provide a positive budget amount.');
        return;
      }
    }

    if (step === 4) {
      // Step 4 -> 5: Trigger GenAI plan generation
      setLoading(true);
      setStep(5);
      try {
        const result = await ApiService.generatePlan(formData);
        setGeneratedPlan(result.plan);
        setProviderUsed(result.provider);
      } catch (err: any) {
        setError(err.message || 'Failed to generate plan. Please retry.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleSaveAndConfirm = async () => {
    if (!generatedPlan) return;
    setLoading(true);
    try {
      const saved = await ApiService.createEvent(generatedPlan);
      // Trigger joyful celebratory confetti
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7655E8', '#FF7C91', '#C5B4FF', '#FFFCF7', '#5535B8'],
      });
      onEventCreated(saved);
      onClose();
    } catch (err: any) {
      setError('Failed to save celebration to database: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl border border-brand-border bg-brand-surface shadow-2xl transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft text-brand-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-brand-text">FêteFlow Celebration Architect</h2>
              <p className="text-xs text-brand-text-secondary">Step {step} of 5 · Generative Event Design</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-brand-text-secondary hover:bg-brand-elevated hover:text-brand-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="h-1.5 w-full bg-brand-elevated">
          <div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-coral transition-all duration-300 ease-out"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Body / Steps */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* STEP 1: EVENT TYPE */}
          {step === 1 && (
            <div>
              <div className="mb-4 text-center">
                <span className="rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand-deep uppercase tracking-wider">
                  Phase 1
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold text-brand-text">What are we celebrating?</h3>
                <p className="text-sm text-brand-text-secondary">Select the canvas that best fits your upcoming moment.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {EVENT_TYPES.map(item => {
                  const Icon = item.icon;
                  const isSelected = formData.eventType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          eventType: item.type,
                          eventName:
                            formData.eventName ||
                            (item.type === 'wedding'
                              ? 'Our Wedding Celebration'
                              : item.type === 'birthday'
                              ? 'Milestone Birthday Bash'
                              : item.type === 'community'
                              ? 'Neighborhood Harvest Fair'
                              : 'Special Gathering'),
                        });
                      }}
                      className={`group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-brand-primary bg-brand-soft/50 ring-2 ring-brand-primary/20 shadow-md'
                          : 'border-brand-border bg-brand-surface hover:border-brand-primary/40 hover:bg-brand-elevated'
                      }`}
                    >
                      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-surface shadow-sm ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="font-semibold text-brand-text group-hover:text-brand-primary text-sm">
                        {item.title}
                      </div>
                      <p className="mt-1 text-xs text-brand-text-secondary line-clamp-2">{item.tagline}</p>
                      {isSelected && (
                        <div className="absolute right-3 top-3">
                          <CheckCircle2 className="h-4 w-4 text-brand-primary" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: EVENT DETAILS */}
          {step === 2 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="text-center mb-6">
                <span className="rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand-deep uppercase tracking-wider">
                  Phase 2
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold text-brand-text">Core Celebration Details</h3>
                <p className="text-sm text-brand-text-secondary">Where and when is the magic taking place?</p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
                  Celebration Name <span className="text-brand-coral">*</span>
                </label>
                <input
                  type="text"
                  value={formData.eventName}
                  onChange={e => setFormData({ ...formData, eventName: e.target.value })}
                  placeholder="e.g. Diya & Neil's Sangeet & Reception"
                  className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
                    Target Date <span className="text-brand-coral">*</span>
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                      className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
                    Expected Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={formData.guestCount}
                    onChange={e => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 1 })}
                    className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
                  Location / City
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Goa Beachfront, Bangalore Courtyard, or South Mumbai"
                    className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
                    Environment Setting
                  </label>
                  <select
                    value={formData.setting}
                    onChange={e => setFormData({ ...formData, setting: e.target.value as any })}
                    className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                  >
                    <option value="indoor">Indoor (Ballroom/Lounge)</option>
                    <option value="outdoor">Outdoor (Lawn/Beach/Terrace)</option>
                    <option value="undecided">Undecided / Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
                    Event Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 1 Evening or 2 Days"
                    className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BUDGET AND PREFERENCES */}
          {step === 3 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="text-center mb-6">
                <span className="rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand-deep uppercase tracking-wider">
                  Phase 3
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold text-brand-text">Budget & Aesthetic Preferences</h3>
                <p className="text-sm text-brand-text-secondary">Financial boundaries and design choices.</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
                    Total Target Budget <span className="text-brand-coral">*</span>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="5000"
                    value={formData.budgetAmount}
                    onChange={e => setFormData({ ...formData, budgetAmount: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm font-semibold text-brand-text focus:border-brand-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface px-3 py-2.5 text-sm font-semibold text-brand-text focus:border-brand-primary focus:outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
                  Aesthetic Style Direction
                </label>
                <input
                  type="text"
                  value={formData.stylePreference}
                  onChange={e => setFormData({ ...formData, stylePreference: e.target.value })}
                  placeholder="e.g. Modern Romantic Chic, Industrial Minimalist, Bohemian"
                  className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
                  Preferred Color Harmony
                </label>
                <input
                  type="text"
                  value={formData.colorPreference}
                  onChange={e => setFormData({ ...formData, colorPreference: e.target.value })}
                  placeholder="e.g. Violet, Soft Coral, Lavender, and Warm Gold"
                  className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
                  Food & Dining Vision
                </label>
                <input
                  type="text"
                  value={formData.foodPreference}
                  onChange={e => setFormData({ ...formData, foodPreference: e.target.value })}
                  placeholder="e.g. Live artisanal counters, vegan regional delicacies, mocktail lab"
                  className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: THE VISION */}
          {step === 4 && (
            <div className="space-y-4 max-w-xl mx-auto">
              <div className="text-center mb-6">
                <span className="rounded-full bg-brand-soft px-3 py-1 text-[11px] font-semibold text-brand-deep uppercase tracking-wider">
                  Phase 4
                </span>
                <h3 className="mt-2 font-serif text-2xl font-bold text-brand-text">The Creative Vision</h3>
                <p className="text-sm text-brand-text-secondary">
                  In your own words, describe how you want guests to feel when they arrive.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
                  Atmosphere & Sensory Description
                </label>
                <textarea
                  rows={4}
                  value={formData.atmosphereDescription}
                  onChange={e => setFormData({ ...formData, atmosphereDescription: e.target.value })}
                  placeholder="e.g. As guests arrive at twilight, we want warm acoustic music, candlelit pathways, rich floral scents, and a relaxed, joyful atmosphere where conversations flow easily..."
                  className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-surface p-4 text-sm text-brand-text focus:border-brand-primary focus:outline-none"
                />
              </div>

              {/* Inspiration Chips */}
              <div>
                <span className="block text-xs font-medium text-brand-text-secondary mb-2">
                  Or pick an inspiring starting prompt:
                </span>
                <div className="flex flex-wrap gap-2">
                  {INSPIRATION_CHIPS.map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setFormData({ ...formData, atmosphereDescription: chip })}
                      className="rounded-full border border-brand-border bg-brand-elevated px-3 py-1.5 text-xs text-brand-text transition-colors hover:border-brand-primary hover:text-brand-primary"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: GENERATE & REVIEW PLAN */}
          {step === 5 && (
            <div>
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-brand-soft animate-ping opacity-75" />
                    <div className="h-12 w-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
                    <Sparkles className="absolute h-5 w-5 text-brand-primary" />
                  </div>
                  <h4 className="mt-6 font-serif text-xl font-bold text-brand-text">
                    Architecting Your Celebration...
                  </h4>
                  <p className="mt-2 max-w-sm text-xs text-brand-text-secondary">
                    FêteFlow GenAI is balancing your budget, synthesizing your theme, sequencing milestones, and curating vendor briefs.
                  </p>
                </div>
              )}

              {!loading && generatedPlan && (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-brand-primary/10 via-brand-soft/50 to-brand-coral/10 p-4 border border-brand-border">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-serif text-lg font-bold text-brand-text">
                          {generatedPlan.eventConcept.title}
                        </div>
                        <div className="text-xs text-brand-text-secondary">
                          Theme: {generatedPlan.eventConcept.theme} · Style: {generatedPlan.eventConcept.style}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          providerUsed === 'gemini'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {providerUsed === 'gemini' ? '✨ Live Gemini GenAI' : '⚡ Local Planner Engine'}
                      </span>
                    </div>
                  </div>

                  {/* Concept & Palette */}
                  <div className="rounded-2xl border border-brand-border bg-brand-elevated/40 p-4">
                    <h5 className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider">
                      Creative Direction
                    </h5>
                    <p className="mt-1 text-sm text-brand-text leading-relaxed">
                      {generatedPlan.eventConcept.description}
                    </p>

                    {/* Color Swatches */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-brand-text-secondary">Color Harmony:</span>
                      <div className="flex items-center gap-1.5">
                        {generatedPlan.eventConcept.colorPalette.map((color, idx) => (
                          <div
                            key={idx}
                            className="h-6 w-6 rounded-full border border-black/10 shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Budget Allocation Preview */}
                  <div className="rounded-2xl border border-brand-border bg-brand-surface p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider">
                        Budget Allocation ({formatCurrency(generatedPlan.budget.totalBudget, generatedPlan.budget.currency)})
                      </h5>
                    </div>
                    <div className="space-y-2">
                      {generatedPlan.budget.allocations.map((alloc, idx) => {
                        const pct = Math.round((alloc.amount / generatedPlan.budget.totalBudget) * 100);
                        return (
                          <div key={idx} className="flex flex-col gap-1 text-xs">
                            <div className="flex items-center justify-between font-medium">
                              <span className="text-brand-text">{alloc.category}</span>
                              <span className="text-brand-primary">
                                {formatCurrency(alloc.amount, generatedPlan.budget.currency)} ({pct}%)
                              </span>
                            </div>
                            <div className="h-1.5 w-full rounded-full bg-brand-elevated overflow-hidden">
                              <div className="h-full rounded-full bg-brand-primary" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-[10px] text-brand-text-secondary">{alloc.reason}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Milestones & Vendors Preview */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-brand-border bg-brand-surface p-4">
                      <h5 className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-2">
                        Key Milestones ({generatedPlan.timeline.length})
                      </h5>
                      <ul className="space-y-2 text-xs">
                        {generatedPlan.timeline.slice(0, 3).map((t, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-brand-text">
                            <Clock className="h-3.5 w-3.5 text-brand-coral shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold">{t.title}</div>
                              <div className="text-[10px] text-brand-text-secondary">Due: {t.dueDate}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-brand-border bg-brand-surface p-4">
                      <h5 className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-2">
                        Creative Ideas ({generatedPlan.personalizedIdeas.length})
                      </h5>
                      <ul className="space-y-2 text-xs">
                        {generatedPlan.personalizedIdeas.slice(0, 2).map((idea, idx) => (
                          <li key={idx} className="rounded-lg bg-brand-soft/30 p-2 text-brand-text">
                            <div className="font-semibold text-brand-primary">{idea.title}</div>
                            <div className="text-[10px] text-brand-text-secondary mt-0.5">{idea.description}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between border-t border-brand-border px-6 py-4 bg-brand-surface/70">
          {step > 1 && step < 5 ? (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-surface px-4 py-2 text-xs font-semibold text-brand-text hover:bg-brand-elevated"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 && (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Continue</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-coral px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand-primary/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate AI Plan</span>
            </button>
          )}

          {step === 5 && !loading && generatedPlan && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStep(4)}
                className="flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-xs font-semibold text-brand-text hover:bg-brand-elevated"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Refine Vision</span>
              </button>
              <button
                onClick={handleSaveAndConfirm}
                className="flex items-center gap-2 rounded-xl bg-brand-primary px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-primary/25 hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98]"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Save & Enter Workspace</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
