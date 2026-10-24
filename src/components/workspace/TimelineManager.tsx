import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Sparkles,
  Calendar,
  Trash2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { EventPlan, TimelineMilestone } from '../../types';
import { ApiService } from '../../services/api';

interface TimelineManagerProps {
  event: EventPlan;
  onUpdateEvent: (updates: Partial<EventPlan>) => void;
}

export const TimelineManager: React.FC<TimelineManagerProps> = ({ event, onUpdateEvent }) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'overdue' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryData, setRecoveryData] = useState<{
    recoveryActions: string[];
    updatedTimeline: TimelineMilestone[];
    provider: string;
  } | null>(null);

  // Add task modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState(event.date);
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState('Planning');

  const milestones = event.timeline || [];
  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredMilestones = milestones
    .filter(m => {
      const isOverdue = !m.completed && m.dueDate < todayStr;
      if (filterStatus === 'completed') return m.completed;
      if (filterStatus === 'overdue') return isOverdue;
      if (filterStatus === 'upcoming') return !m.completed && !isOverdue;
      return true;
    })
    .filter(m =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.category && m.category.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const toggleTask = (id?: string) => {
    if (!id) return;
    const updated = milestones.map(m => (m.id === id ? { ...m, completed: !m.completed } : m));
    onUpdateEvent({ timeline: updated });
  };

  const deleteTask = (id?: string) => {
    if (!id) return;
    const updated = milestones.filter(m => m.id !== id);
    onUpdateEvent({ timeline: updated });
  };

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    const newTask: TimelineMilestone = {
      id: 'tml_' + Date.now(),
      title: newTitle.trim(),
      description: newDesc.trim(),
      dueDate: newDate,
      priority: newPriority,
      category: newCategory,
      completed: false,
    };
    onUpdateEvent({ timeline: [...milestones, newTask] });
    setShowAddModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  const handleRunRecovery = async () => {
    setIsRecovering(true);
    setRecoveryData(null);
    try {
      const result = await ApiService.getTimelineRecovery(event.id || 'evt_default', event);
      setRecoveryData(result);
    } catch (err: any) {
      alert('Recovery assistant error: ' + err.message);
    } finally {
      setIsRecovering(false);
    }
  };

  const handleApplyRecovery = () => {
    if (!recoveryData) return;
    onUpdateEvent({ timeline: recoveryData.updatedTimeline });
    setRecoveryData(null);
  };

  const overdueCount = milestones.filter(m => !m.completed && m.dueDate < todayStr).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text">Planning Timeline</h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary">
            Keep every milestone synchronized and stress-free leading to {event.date}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <button
              onClick={handleRunRecovery}
              disabled={isRecovering}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isRecovering ? 'Analyzing...' : `AI Recovery (${overdueCount} Overdue)`}</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover"
          >
            <Plus className="h-4 w-4" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* AI Recovery Proposal Card */}
      {recoveryData && (
        <div className="rounded-3xl border border-brand-coral/40 bg-gradient-to-r from-brand-coral/10 via-brand-soft/40 to-brand-primary/10 p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 font-serif text-lg font-bold text-brand-text">
              <Sparkles className="h-5 w-5 text-brand-coral" />
              <span>AI Timeline Recovery Plan</span>
            </div>
            <span className="rounded-full bg-brand-soft px-3 py-0.5 text-[10px] font-bold text-brand-deep">
              {recoveryData.provider === 'gemini' ? '✨ Gemini AI' : '⚡ Local Planner'}
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary mb-3">
            The AI has diagnosed timeline bottlenecks and recommends this revised action checklist:
          </p>
          <div className="space-y-2 mb-4">
            {recoveryData.recoveryActions.map((action, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-brand-surface p-3 text-xs text-brand-text">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-coral/20 font-bold text-brand-coral text-[10px]">
                  {i + 1}
                </span>
                <span>{action}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setRecoveryData(null)}
              className="rounded-xl border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-text hover:bg-brand-elevated"
            >
              Dismiss
            </button>
            <button
              onClick={handleApplyRecovery}
              className="rounded-xl bg-brand-primary px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-brand-primary-hover"
            >
              Apply Rescheduled Milestones
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-brand-border bg-brand-surface p-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search milestones or categories..."
            className="w-full rounded-xl border-none bg-brand-elevated/50 pl-9 pr-4 py-2 text-xs text-brand-text placeholder-brand-text-secondary focus:outline-none focus:ring-1 focus:ring-brand-primary"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['all', 'upcoming', 'overdue', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filterStatus === tab
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-brand-text-secondary hover:bg-brand-elevated hover:text-brand-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chronological Milestone List */}
      <div className="relative border-l-2 border-brand-border ml-4 sm:ml-6 pl-4 sm:pl-6 space-y-6">
        {filteredMilestones.length === 0 ? (
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-8 text-center ml-[-1rem]">
            <Clock className="mx-auto h-8 w-8 text-brand-primary opacity-50" />
            <p className="mt-2 text-sm font-semibold text-brand-text">No milestones match your filter</p>
            <p className="text-xs text-brand-text-secondary">Try adjusting search or add a new milestone.</p>
          </div>
        ) : (
          filteredMilestones.map(m => {
            const isOverdue = !m.completed && m.dueDate < todayStr;

            return (
              <div key={m.id} className="relative group">
                {/* Timeline Node Point */}
                <div
                  className={`absolute -left-[27px] sm:-left-[35px] top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 bg-brand-surface transition-transform group-hover:scale-125 ${
                    m.completed
                      ? 'border-emerald-500 text-emerald-500'
                      : isOverdue
                      ? 'border-red-500 text-red-500 animate-pulse'
                      : 'border-brand-primary text-brand-primary'
                  }`}
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      m.completed ? 'bg-emerald-500' : isOverdue ? 'bg-red-500' : 'bg-brand-primary'
                    }`}
                  />
                </div>

                {/* Milestone Card */}
                <div
                  className={`rounded-2xl border p-4 transition-all ${
                    m.completed
                      ? 'border-brand-border/60 bg-brand-surface/60 opacity-80'
                      : isOverdue
                      ? 'border-red-500/40 bg-red-500/5 shadow-sm'
                      : 'border-brand-border bg-brand-surface hover:border-brand-primary/40 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(m.id)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                          m.completed
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-brand-border hover:border-brand-primary'
                        }`}
                      >
                        {m.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>

                      <div>
                        <div className={`font-semibold text-sm ${m.completed ? 'line-through text-brand-text-secondary' : 'text-brand-text'}`}>
                          {m.title}
                        </div>
                        {m.description && (
                          <p className="mt-1 text-xs text-brand-text-secondary leading-relaxed">
                            {m.description}
                          </p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
                          <span className="rounded-md bg-brand-soft px-2 py-0.5 font-semibold text-brand-deep">
                            {m.category || 'General'}
                          </span>
                          <span
                            className={`flex items-center gap-1 font-semibold ${
                              isOverdue ? 'text-red-500' : 'text-brand-text-secondary'
                            }`}
                          >
                            <Calendar className="h-3 w-3" />
                            Target: {m.dueDate} {isOverdue && '(Overdue)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          m.priority === 'high'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            : m.priority === 'medium'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            : 'bg-brand-soft text-brand-deep'
                        }`}
                      >
                        {m.priority}
                      </span>
                      <button
                        onClick={() => deleteTask(m.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-brand-text-secondary hover:text-red-500 transition-opacity"
                        title="Delete milestone"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-brand-text mb-4">Add Planning Milestone</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Milestone Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Confirm live acoustic band contract"
                  className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Description</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Details, deliverables, or checklist steps..."
                  className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-brand-text-secondary uppercase">Due Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-text-secondary uppercase">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="e.g. Venue, Catering, Music, Decor"
                  className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-brand-border px-4 py-2 text-xs font-semibold text-brand-text"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white"
              >
                Add to Timeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
