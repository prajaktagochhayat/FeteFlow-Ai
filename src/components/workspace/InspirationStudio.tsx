import React, { useState } from 'react';
import {
  Lightbulb,
  Heart,
  Sparkles,
  Copy,
  Check,
  Plus,
  Trash2,
  Palette,
  DollarSign,
  Tag,
  RefreshCw,
} from 'lucide-react';
import { EventPlan, PersonalizedIdea } from '../../types';
import { formatCurrency } from '../../utils/formatCurrency';

interface InspirationStudioProps {
  event: EventPlan;
  onUpdateEvent: (updates: Partial<EventPlan>) => void;
}

export const InspirationStudio: React.FC<InspirationStudioProps> = ({ event, onUpdateEvent }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [newIdeaDesc, setNewIdeaDesc] = useState('');
  const [newIdeaCategory, setNewIdeaCategory] = useState('Decor');
  const [newIdeaCost, setNewIdeaCost] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const ideas = event.personalizedIdeas || [];
  const currency = event.budget.currency || 'INR';

  const categories = ['all', ...Array.from(new Set(ideas.map(i => i.category)))];

  const filteredIdeas = activeCategory === 'all'
    ? ideas
    : ideas.filter(i => i.category.toLowerCase() === activeCategory.toLowerCase());

  const toggleFavorite = (id?: string) => {
    if (!id) return;
    const updated = ideas.map(i => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i));
    onUpdateEvent({ personalizedIdeas: updated });
  };

  const deleteIdea = (id?: string) => {
    if (!id) return;
    const updated = ideas.filter(i => i.id !== id);
    onUpdateEvent({ personalizedIdeas: updated });
  };

  const handleAddIdea = () => {
    if (!newIdeaTitle.trim() || !newIdeaDesc.trim()) return;
    const newIdea: PersonalizedIdea = {
      id: 'idea_' + Date.now(),
      title: newIdeaTitle.trim(),
      description: newIdeaDesc.trim(),
      category: newIdeaCategory,
      estimatedCost: newIdeaCost,
      reason: 'Host personalized addition',
      isFavorite: true,
    };
    onUpdateEvent({ personalizedIdeas: [newIdea, ...ideas] });
    setShowAddModal(false);
    setNewIdeaTitle('');
    setNewIdeaDesc('');
    setNewIdeaCost(0);
  };

  const copyIdea = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text">Creative Inspiration Studio</h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary">
            Bespoke aesthetic ideas, sensory mood-board cards, and non-generic celebration touches.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Idea</span>
        </button>
      </div>

      {/* Aesthetic Identity Banner */}
      <div className="rounded-3xl border border-brand-border bg-gradient-to-r from-brand-deep/15 via-brand-soft/40 to-brand-coral/15 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">Event Visual Identity</span>
            <h2 className="mt-1 font-serif text-2xl font-bold text-brand-text">{event.eventConcept.title}</h2>
            <p className="mt-1 text-xs text-brand-text-secondary max-w-2xl leading-relaxed">
              {event.eventConcept.creativeDirection}
            </p>
          </div>

          {/* Color Palette Display with hex values */}
          <div className="rounded-2xl border border-brand-border bg-brand-surface p-3">
            <span className="text-[10px] font-semibold text-brand-text-secondary uppercase">Signature Palette</span>
            <div className="mt-2 flex items-center gap-1.5">
              {event.eventConcept.colorPalette.map((color, idx) => (
                <div
                  key={idx}
                  onClick={() => copyIdea(color, `hex_${idx}`)}
                  className="group relative flex h-8 w-8 items-center justify-center rounded-xl shadow-sm cursor-pointer transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  title={`Click to copy: ${color}`}
                >
                  <span className="pointer-events-none absolute -bottom-6 hidden rounded bg-black/80 px-1 py-0.5 text-[9px] text-white group-hover:block">
                    {color}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
              activeCategory === cat
                ? 'bg-brand-primary text-white shadow-sm'
                : 'border border-brand-border bg-brand-surface text-brand-text-secondary hover:bg-brand-elevated hover:text-brand-text'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mood-Board Idea Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIdeas.map((idea, idx) => (
          <div
            key={idea.id || idx}
            className="group relative flex flex-col justify-between rounded-3xl border border-brand-border bg-brand-surface p-5 shadow-sm transition-all hover:border-brand-primary/40 hover:shadow-md"
          >
            <div>
              {/* Top row: Category tag & Favorite heart */}
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-lg bg-brand-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-deep">
                  {idea.category}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleFavorite(idea.id)}
                    className="p-1 text-brand-text-secondary hover:text-brand-coral transition-colors"
                  >
                    <Heart
                      className={`h-4 w-4 ${idea.isFavorite ? 'fill-brand-coral text-brand-coral' : ''}`}
                    />
                  </button>
                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-brand-text-secondary hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="font-serif text-lg font-bold text-brand-text leading-snug">
                {idea.title}
              </h3>
              <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
                {idea.description}
              </p>

              {/* Why it fits rationale */}
              {idea.reason && (
                <div className="mt-3 rounded-xl bg-brand-elevated/50 p-2.5 text-[11px] text-brand-text italic">
                  "{idea.reason}"
                </div>
              )}
            </div>

            {/* Bottom Row: Estimated Cost & Copy */}
            <div className="mt-4 flex items-center justify-between border-t border-brand-border/60 pt-3">
              <div className="text-xs">
                {idea.estimatedCost && idea.estimatedCost > 0 ? (
                  <span className="font-semibold text-brand-text">
                    Est. {formatCurrency(idea.estimatedCost, currency)}
                  </span>
                ) : (
                  <span className="text-[10px] text-brand-text-secondary">Low / DIY Cost</span>
                )}
              </div>

              <button
                onClick={() => copyIdea(`${idea.title}\n${idea.description}`, idea.id || String(idx))}
                className="flex items-center gap-1 rounded-lg border border-brand-border px-2 py-1 text-[10px] font-semibold text-brand-text hover:bg-brand-elevated"
              >
                {copiedId === (idea.id || String(idx)) ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copiedId === (idea.id || String(idx)) ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Custom Idea Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-brand-text mb-4">Add Custom Celebration Idea</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Idea Title</label>
                <input
                  type="text"
                  value={newIdeaTitle}
                  onChange={e => setNewIdeaTitle(e.target.value)}
                  placeholder="e.g. Polaroid Guest Favor Station"
                  className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Category</label>
                <select
                  value={newIdeaCategory}
                  onChange={e => setNewIdeaCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                >
                  <option value="Decor">Decor & Visuals</option>
                  <option value="Culinary Experience">Food & Cocktails</option>
                  <option value="Guest Experience">Guest Experience</option>
                  <option value="Entertainment">Music & Games</option>
                  <option value="Keepsakes">Gifts & Keepsakes</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Estimated Budget ({currency})</label>
                <input
                  type="number"
                  value={newIdeaCost}
                  onChange={e => setNewIdeaCost(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Description & Details</label>
                <textarea
                  rows={3}
                  value={newIdeaDesc}
                  onChange={e => setNewIdeaDesc(e.target.value)}
                  placeholder="Describe the aesthetic and how it enhances the guest experience..."
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
                onClick={handleAddIdea}
                className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white"
              >
                Save Idea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
