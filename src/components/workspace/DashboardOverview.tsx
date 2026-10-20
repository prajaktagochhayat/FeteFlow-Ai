import React from 'react';
import {
  Sparkles,
  Banknote,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Heart,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { EventPlan, WorkspaceTab } from '../../types';

interface DashboardOverviewProps {
  event: EventPlan;
  onNavigateTab: (tab: WorkspaceTab) => void;
  onUpdateEvent: (updates: Partial<EventPlan>) => void;
  onOpenWizard: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  event,
  onNavigateTab,
  onUpdateEvent,
  onOpenWizard,
}) => {
  // Calculations
  const totalBudget = event.budget.totalBudget || 0;
  const totalAllocated = event.budget.allocations.reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalSpent = event.budget.allocations.reduce((sum, a) => sum + (a.actualCost || 0), 0);
  const remainingBudget = totalBudget - totalSpent;

  const totalTasks = event.timeline.length;
  const completedTasks = event.timeline.filter(t => t.completed).length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const confirmedVendors = event.vendorChecklist.filter(v => v.status === 'confirmed').length;
  const totalVendors = event.vendorChecklist.length;

  // Holistic planning health: 50% task progress + 25% vendor confirmation + 25% budget safety
  const vendorScore = totalVendors > 0 ? (confirmedVendors / totalVendors) * 100 : 50;
  const budgetScore = totalSpent <= totalBudget ? 100 : Math.max(0, 100 - ((totalSpent - totalBudget) / totalBudget) * 100);
  const planningHealth = Math.round(taskProgress * 0.5 + vendorScore * 0.25 + budgetScore * 0.25);

  const upcomingMilestones = event.timeline
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const toggleTaskCompletion = (id?: string) => {
    if (!id) return;
    const updated = event.timeline.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
    onUpdateEvent({ timeline: updated });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-border bg-gradient-to-r from-brand-deep/15 via-brand-soft/40 to-brand-coral/15 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary uppercase tracking-wider">
                {event.eventType} celebration
              </span>
              <span className="text-xs text-brand-text-secondary">· {event.setting} setting</span>
            </div>
            <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-brand-text">
              {event.name}
            </h1>
            <p className="mt-1 text-sm text-brand-text-secondary">
              Theme: <span className="font-semibold text-brand-text">{event.eventConcept.theme}</span> · Target: {event.date} ({event.guestCount} guests)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('ai-planner')}
              className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ask FêteFlow AI</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-brand-primary/20 blur-3xl" />
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Planned Budget */}
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <div className="flex items-center justify-between text-brand-text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Planned Budget</span>
            <Banknote className="h-4 w-4 text-brand-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-brand-text">
            {event.budget.currency} {totalBudget.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-brand-text-secondary">
            Allocated: {event.budget.currency} {totalAllocated.toLocaleString()}
          </div>
        </div>

        {/* Actual Spend */}
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <div className="flex items-center justify-between text-brand-text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Actual Logged Spend</span>
            <TrendingUp className="h-4 w-4 text-brand-coral" />
          </div>
          <div className="mt-2 text-2xl font-bold text-brand-text">
            {event.budget.currency} {totalSpent.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-brand-text-secondary">
            Remaining: {event.budget.currency} {remainingBudget.toLocaleString()}
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <div className="flex items-center justify-between text-brand-text-secondary">
            <span className="text-xs font-semibold uppercase tracking-wider">Milestones Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-brand-text">
            {completedTasks} / {totalTasks}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-brand-elevated overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${taskProgress}%` }} />
            </div>
            <span className="text-xs font-semibold text-brand-text">{taskProgress}%</span>
          </div>
        </div>

        {/* Holistic Planning Health */}
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5 shadow-sm">
          <div className="flex items-center justify-between text-brand-text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider">Planning Health</span>
              <div className="group relative">
                <HelpCircle className="h-3.5 w-3.5 text-brand-text-secondary cursor-help" />
                <div className="pointer-events-none absolute -left-16 bottom-full z-20 mb-2 hidden w-48 rounded-lg bg-brand-text p-2 text-[10px] text-brand-surface shadow-lg group-hover:block">
                  Calculated from: 50% milestone completion, 25% vendor contract confirmations, and 25% budget health.
                </div>
              </div>
            </div>
            <Sparkles className="h-4 w-4 text-brand-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-brand-primary">{planningHealth}%</span>
            <span className="text-xs text-brand-text-secondary">
              {planningHealth >= 80 ? 'Exceptional' : planningHealth >= 50 ? 'On Track' : 'Needs Attention'}
            </span>
          </div>
          <div className="mt-1 text-xs text-brand-text-secondary">
            {confirmedVendors} of {totalVendors} vendors locked in
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Upcoming Milestones & Next Actions */}
        <div className="space-y-6 lg:col-span-2">
          {/* Upcoming Priority Milestones */}
          <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-primary" />
                <h3 className="font-serif text-lg font-bold text-brand-text">Upcoming Planning Milestones</h3>
              </div>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
              >
                <span>Full Timeline</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {upcomingMilestones.length === 0 ? (
              <div className="rounded-2xl bg-brand-soft/30 p-6 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                <p className="mt-2 text-sm font-semibold text-brand-text">All active milestones completed!</p>
                <p className="text-xs text-brand-text-secondary">Great momentum. Check the timeline to add more tasks.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingMilestones.map(t => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-2xl border border-brand-border bg-brand-elevated/40 p-3.5 transition-all hover:bg-brand-elevated"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskCompletion(t.id)}
                        className={`flex h-5 w-5 items-center justify-center rounded-lg border transition-colors ${
                          t.completed
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-brand-border hover:border-brand-primary'
                        }`}
                      >
                        {t.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <div>
                        <div className="text-xs font-semibold text-brand-text">{t.title}</div>
                        <div className="text-[10px] text-brand-text-secondary">
                          Category: {t.category} · Due: {t.dueDate}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                        t.priority === 'high'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : t.priority === 'medium'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-brand-soft text-brand-deep'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommended Next Actions */}
          <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-brand-coral" />
              <h3 className="font-serif text-lg font-bold text-brand-text">FêteFlow Action Priorities</h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(event.nextActions || []).map((action, idx) => (
                <div key={idx} className="flex flex-col justify-between rounded-2xl border border-brand-border bg-brand-elevated/30 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-primary">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-soft text-[10px]">
                      {idx + 1}
                    </span>
                    <span>Action {idx + 1}</span>
                  </div>
                  <p className="mt-2 text-xs text-brand-text leading-relaxed">{action}</p>
                  <button
                    onClick={() => onNavigateTab('ai-planner')}
                    className="mt-3 text-[11px] font-semibold text-brand-coral hover:underline text-left"
                  >
                    Discuss with AI →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Theme & Creative Direction + Quick Actions */}
        <div className="space-y-6">
          {/* Creative Concept Card */}
          <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-brand-coral" />
              <h3 className="font-serif text-lg font-bold text-brand-text">Aesthetic Story</h3>
            </div>

            <div className="rounded-2xl bg-brand-soft/40 p-4">
              <div className="font-serif font-bold text-brand-text text-sm">
                {event.eventConcept.title}
              </div>
              <p className="mt-1 text-xs text-brand-text-secondary leading-relaxed">
                {event.eventConcept.description}
              </p>
            </div>

            {/* Color Palette */}
            <div className="mt-4">
              <span className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider">
                Color Story
              </span>
              <div className="mt-2 flex items-center gap-2">
                {event.eventConcept.colorPalette.map((color, idx) => (
                  <div
                    key={idx}
                    className="group relative h-8 flex-1 rounded-xl shadow-sm transition-transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: color }}
                    title={color}
                  >
                    <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 hidden rounded bg-black/80 px-1 py-0.5 text-[9px] text-white group-hover:block">
                      {color}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('inspiration')}
              className="mt-5 w-full rounded-xl border border-brand-border bg-brand-surface py-2 text-xs font-semibold text-brand-text transition-colors hover:border-brand-primary hover:text-brand-primary"
            >
              Open Creative Moodboard
            </button>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-brand-text mb-3">Quick Navigation</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigateTab('budget')}
                className="flex w-full items-center justify-between rounded-xl border border-brand-border bg-brand-elevated/40 p-3 text-xs font-semibold text-brand-text hover:bg-brand-elevated"
              >
                <div className="flex items-center gap-2">
                  <Banknote className="h-4 w-4 text-brand-primary" />
                  <span>Review Budget Studio</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-brand-text-secondary" />
              </button>

              <button
                onClick={() => onNavigateTab('vendors')}
                className="flex w-full items-center justify-between rounded-xl border border-brand-border bg-brand-elevated/40 p-3 text-xs font-semibold text-brand-text hover:bg-brand-elevated"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-brand-coral" />
                  <span>Draft Vendor Briefs</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-brand-text-secondary" />
              </button>

              <button
                onClick={() => onNavigateTab('guests')}
                className="flex w-full items-center justify-between rounded-xl border border-brand-border bg-brand-elevated/40 p-3 text-xs font-semibold text-brand-text hover:bg-brand-elevated"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <span>Generate Invitation Copy</span>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-brand-text-secondary" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
