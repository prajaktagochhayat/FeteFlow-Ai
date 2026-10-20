import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  Check,
  Mail,
  Send,
  Heart,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { EventPlan, Guest } from '../../types';
import { ApiService } from '../../services/api';

interface GuestStudioProps {
  event: EventPlan;
  onUpdateEvent: (updates: Partial<EventPlan>) => void;
}

export const GuestStudio: React.FC<GuestStudioProps> = ({ event, onUpdateEvent }) => {
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestDiet, setNewGuestDiet] = useState('');
  const [newGuestAccess, setNewGuestAccess] = useState('');
  const [newGuestTable, setNewGuestTable] = useState('');

  const [generatingInvites, setGeneratingInvites] = useState(false);
  const [invitations, setInvitations] = useState<{
    formal: string;
    playful: string;
    elegant: string;
    minimal: string;
    provider: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const guests = event.guests || [];

  const attendingCount = guests.filter(g => g.rsvpStatus === 'attending').length;
  const declinedCount = guests.filter(g => g.rsvpStatus === 'declined').length;
  const pendingCount = guests.filter(g => g.rsvpStatus === 'pending').length;

  const handleAddGuest = () => {
    if (!newGuestName.trim()) return;
    const newGuest: Guest = {
      id: 'gst_' + Date.now(),
      name: newGuestName.trim(),
      email: newGuestEmail.trim(),
      rsvpStatus: 'pending',
      dietaryNotes: newGuestDiet.trim(),
      accessibilityNeeds: newGuestAccess.trim(),
      tableOrGroup: newGuestTable.trim(),
    };
    onUpdateEvent({ guests: [...guests, newGuest] });
    setShowAddGuest(false);
    setNewGuestName('');
    setNewGuestEmail('');
    setNewGuestDiet('');
    setNewGuestAccess('');
    setNewGuestTable('');
  };

  const handleDeleteGuest = (id: string) => {
    onUpdateEvent({ guests: guests.filter(g => g.id !== id) });
  };

  const handleUpdateRsvp = (id: string, rsvpStatus: 'attending' | 'declined' | 'pending') => {
    onUpdateEvent({
      guests: guests.map(g => (g.id === id ? { ...g, rsvpStatus } : g)),
    });
  };

  const handleGenerateInvitations = async () => {
    setGeneratingInvites(true);
    try {
      const result = await ApiService.generateInvitations(event.id || 'evt_default');
      setInvitations(result);
    } catch (err: any) {
      alert('Failed to generate invitation copy: ' + err.message);
    } finally {
      setGeneratingInvites(false);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text">Guest Experience Studio</h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary">
            Manage RSVP rosters, curate dietary comfort, and generate multi-style invitation copy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateInvitations}
            disabled={generatingInvites}
            className="flex items-center gap-2 rounded-xl border border-brand-coral/40 bg-brand-coral/10 px-3.5 py-2 text-xs font-bold text-brand-coral hover:bg-brand-coral/20"
          >
            {generatingInvites ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span>{generatingInvites ? 'Crafting Wording...' : 'AI Invitation Copy'}</span>
          </button>

          <button
            onClick={() => setShowAddGuest(true)}
            className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover"
          >
            <Plus className="h-4 w-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* RSVP Tally Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-4">
          <span className="text-xs font-semibold text-brand-text-secondary uppercase">Estimated Target</span>
          <div className="mt-1 text-2xl font-bold text-brand-text">{event.guestCount}</div>
          <span className="text-[10px] text-brand-text-secondary">Expected capacity</span>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface p-4">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Attending</span>
          <div className="mt-1 text-2xl font-bold text-brand-text">{attendingCount}</div>
          <span className="text-[10px] text-brand-text-secondary">Confirmed RSVPs</span>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface p-4">
          <span className="text-xs font-semibold text-amber-500 uppercase">Pending</span>
          <div className="mt-1 text-2xl font-bold text-brand-text">{pendingCount}</div>
          <span className="text-[10px] text-brand-text-secondary">Awaiting response</span>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface p-4">
          <span className="text-xs font-semibold text-red-500 uppercase">Declined</span>
          <div className="mt-1 text-2xl font-bold text-brand-text">{declinedCount}</div>
          <span className="text-[10px] text-brand-text-secondary">Warm regrets</span>
        </div>
      </div>

      {/* AI Invitation Copy Grid */}
      {invitations && (
        <div className="rounded-3xl border border-brand-primary/30 bg-gradient-to-r from-brand-primary/10 via-brand-soft/30 to-brand-coral/10 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-primary" />
              <h3 className="font-serif text-lg font-bold text-brand-text">AI Celebration Invitation Copy</h3>
            </div>
            <span className="rounded-full bg-brand-soft px-3 py-0.5 text-[10px] font-bold text-brand-deep">
              {invitations.provider === 'gemini' ? '✨ Gemini AI' : '⚡ Local Planner'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Formal */}
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">Classic & Formal</span>
                <p className="mt-2 text-xs text-brand-text whitespace-pre-line leading-relaxed">{invitations.formal}</p>
              </div>
              <button
                onClick={() => copyText(invitations.formal, 'formal')}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-brand-border py-1.5 text-xs font-semibold text-brand-text hover:bg-brand-elevated"
              >
                {copiedKey === 'formal' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'formal' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Playful */}
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-coral">Warm & Playful</span>
                <p className="mt-2 text-xs text-brand-text whitespace-pre-line leading-relaxed">{invitations.playful}</p>
              </div>
              <button
                onClick={() => copyText(invitations.playful, 'playful')}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-brand-border py-1.5 text-xs font-semibold text-brand-text hover:bg-brand-elevated"
              >
                {copiedKey === 'playful' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'playful' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Elegant */}
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-deep">Poetic & Elegant</span>
                <p className="mt-2 text-xs text-brand-text whitespace-pre-line leading-relaxed">{invitations.elegant}</p>
              </div>
              <button
                onClick={() => copyText(invitations.elegant, 'elegant')}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-brand-border py-1.5 text-xs font-semibold text-brand-text hover:bg-brand-elevated"
              >
                {copiedKey === 'elegant' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'elegant' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Minimal */}
            <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">Modern Minimal</span>
                <p className="mt-2 text-xs text-brand-text whitespace-pre-line leading-relaxed font-mono">{invitations.minimal}</p>
              </div>
              <button
                onClick={() => copyText(invitations.minimal, 'minimal')}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-brand-border py-1.5 text-xs font-semibold text-brand-text hover:bg-brand-elevated"
              >
                {copiedKey === 'minimal' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'minimal' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Roster Table */}
      <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-bold text-brand-text">Guest Roster ({guests.length})</h3>
          <span className="text-xs text-brand-text-secondary">Protected local workspace records</span>
        </div>

        {guests.length === 0 ? (
          <div className="p-8 text-center text-brand-text-secondary">
            <Users className="mx-auto h-8 w-8 text-brand-primary opacity-50 mb-2" />
            <p className="text-sm font-semibold text-brand-text">No guests added yet</p>
            <p className="text-xs">Add attendees to track dietary needs and table seating.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-brand-border text-brand-text-secondary uppercase">
                <tr>
                  <th className="py-2.5 font-semibold">Guest Name</th>
                  <th className="py-2.5 font-semibold">Status</th>
                  <th className="py-2.5 font-semibold">Table / Group</th>
                  <th className="py-2.5 font-semibold">Dietary & Accessibility</th>
                  <th className="py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/60">
                {guests.map(g => (
                  <tr key={g.id} className="hover:bg-brand-elevated/40">
                    <td className="py-3 font-semibold text-brand-text">
                      <div>{g.name}</div>
                      {g.email && <div className="text-[10px] text-brand-text-secondary">{g.email}</div>}
                    </td>

                    <td className="py-3">
                      <select
                        value={g.rsvpStatus}
                        onChange={e => handleUpdateRsvp(g.id, e.target.value as any)}
                        className={`rounded-lg border px-2 py-1 text-[11px] font-bold uppercase focus:outline-none ${
                          g.rsvpStatus === 'attending'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : g.rsvpStatus === 'declined'
                            ? 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="attending">Attending</option>
                        <option value="declined">Declined</option>
                      </select>
                    </td>

                    <td className="py-3 text-brand-text-secondary">{g.tableOrGroup || 'Unassigned'}</td>

                    <td className="py-3">
                      <div className="space-y-0.5">
                        {g.dietaryNotes && (
                          <span className="inline-block rounded bg-brand-soft px-1.5 py-0.5 text-[10px] font-semibold text-brand-deep mr-1">
                            {g.dietaryNotes}
                          </span>
                        )}
                        {g.accessibilityNeeds && (
                          <span className="inline-block rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600">
                            {g.accessibilityNeeds}
                          </span>
                        )}
                        {!g.dietaryNotes && !g.accessibilityNeeds && (
                          <span className="text-[10px] text-brand-text-secondary">Standard</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteGuest(g.id)}
                        className="rounded p-1 text-brand-text-secondary hover:text-red-500"
                        title="Delete guest"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Guest Modal */}
      {showAddGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-brand-text mb-4">Add Guest to Celebration</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Guest Name *</label>
                <input
                  type="text"
                  value={newGuestName}
                  onChange={e => setNewGuestName(e.target.value)}
                  placeholder="e.g. Priya Venkatesh"
                  className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Email Address (Optional)</label>
                <input
                  type="email"
                  value={newGuestEmail}
                  onChange={e => setNewGuestEmail(e.target.value)}
                  placeholder="e.g. priya@example.com"
                  className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Table or Seating Group</label>
                <input
                  type="text"
                  value={newGuestTable}
                  onChange={e => setNewGuestTable(e.target.value)}
                  placeholder="e.g. Table 1 - College Friends"
                  className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-brand-text-secondary uppercase">Dietary Notes</label>
                  <input
                    type="text"
                    value={newGuestDiet}
                    onChange={e => setNewGuestDiet(e.target.value)}
                    placeholder="e.g. Vegan, Jain, Nut Allergy"
                    className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-text-secondary uppercase">Accessibility</label>
                  <input
                    type="text"
                    value={newGuestAccess}
                    onChange={e => setNewGuestAccess(e.target.value)}
                    placeholder="e.g. Wheelchair, Quiet Seating"
                    className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowAddGuest(false)}
                className="rounded-xl border border-brand-border px-4 py-2 text-xs font-semibold text-brand-text"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGuest}
                className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white"
              >
                Save Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
