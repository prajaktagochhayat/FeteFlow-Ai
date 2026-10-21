import React from 'react';
import {
  CalendarDays,
  Plus,
  MapPin,
  Users,
  Banknote,
  ArrowRight,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { EventPlan } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface EventsListProps {
  events: EventPlan[];
  selectedEvent: EventPlan | null;
  onSelectEvent: (event: EventPlan) => void;
  onOpenWizard: () => void;
  onDeleteEvent: (id: string) => void;
}

export const EventsList: React.FC<EventsListProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
  onOpenWizard,
  onDeleteEvent,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text">My Celebrations</h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary">
            Switch between ongoing celebrations or architect a new one with AI.
          </p>
        </div>

        <button
          onClick={onOpenWizard}
          className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover"
        >
          <Plus className="h-4 w-4" />
          <span>New Celebration</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map(event => {
          const isSelected = selectedEvent?.id === event.id;
          const completedCount = event.timeline.filter(t => t.completed).length;
          const totalTasks = event.timeline.length;
          const pct = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

          return (
            <div
              key={event.id}
              className={`group relative flex flex-col justify-between rounded-3xl border p-6 transition-all ${
                isSelected
                  ? 'border-brand-primary bg-brand-soft/30 shadow-md ring-2 ring-brand-primary/20'
                  : 'border-brand-border bg-brand-surface hover:border-brand-primary/40 hover:shadow-md'
              }`}
            >
              <div>
                {/* Event Category Tag & Actions */}
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-lg bg-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-deep">
                    {event.eventType}
                  </span>

                  <div className="flex items-center gap-1">
                    {isSelected && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        Active
                      </span>
                    )}
                    {events.length > 1 && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (confirm(`Delete "${event.name}"?`)) {
                            onDeleteEvent(event.id || '');
                          }
                        }}
                        className="p-1 text-brand-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete event"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Event Title & Concept */}
                <h2 className="font-serif text-lg font-bold text-brand-text leading-snug">
                  {event.name}
                </h2>
                <p className="mt-1 text-xs text-brand-text-secondary line-clamp-2">
                  {event.eventConcept.description}
                </p>

                {/* Meta details */}
                <div className="mt-4 space-y-1.5 text-xs text-brand-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-brand-coral shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-brand-deep shrink-0" />
                    <span>{event.guestCount} Guests · {event.setting}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Banknote className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>
                      {formatCurrency(event.budget.totalBudget, event.budget.currency)} Budget
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Progress & Switch Button */}
              <div className="mt-5 border-t border-brand-border/60 pt-4">
                <div className="flex items-center justify-between text-[11px] mb-1.5 text-brand-text-secondary">
                  <span>Milestones</span>
                  <span className="font-semibold text-brand-text">{completedCount} / {totalTasks} ({pct}%)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-brand-elevated overflow-hidden mb-4">
                  <div className="h-full rounded-full bg-brand-primary" style={{ width: `${pct}%` }} />
                </div>

                <button
                  onClick={() => onSelectEvent(event)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-brand-primary text-white shadow-sm'
                      : 'border border-brand-border bg-brand-surface text-brand-text hover:bg-brand-elevated'
                  }`}
                >
                  <span>{isSelected ? 'Currently Selected' : 'Switch to Event'}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
