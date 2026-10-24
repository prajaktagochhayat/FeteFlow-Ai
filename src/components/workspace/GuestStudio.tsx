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
  Printer,
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
      const result = await ApiService.generateInvitations(event.id || 'evt_default', event);
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

  const handlePrintCard = (title: string, selectorId: string) => {
    const cardEl = document.getElementById(selectorId);
    if (!cardEl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - FêteFlow AI</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { margin: 0; padding: 20px; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body class="flex items-center justify-center min-h-screen bg-neutral-100 p-6">
          <div style="max-width: 520px; width: 100%;">
            ${cardEl.outerHTML}
          </div>
          <script>
            setTimeout(() => {
              window.print();
            }, 500);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

      {/* AI Celebration Invitation Cards */}
      <div className="rounded-3xl border border-brand-primary/30 bg-gradient-to-r from-brand-primary/10 via-brand-soft/30 to-brand-coral/10 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-brand-text">AI Celebration Invitation Cards</h3>
              <p className="text-xs text-brand-text-secondary">
                Curated visual invitation designs tailored for {event.name} with complete event details.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-soft px-3 py-1 text-[10px] font-bold text-brand-deep">
              {invitations?.provider === 'gemini' ? '✨ Gemini AI' : '⚡ Local Planner'}
            </span>
            <button
              onClick={handleGenerateInvitations}
              disabled={generatingInvites}
              className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-primary-hover disabled:opacity-50 transition-colors"
            >
              {generatingInvites ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              <span>{generatingInvites ? 'Generating...' : 'Regenerate Cards'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Card 1: Modern Luxury Velvet & Gold Royale */}
          <div
            id="invite-card-luxury"
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-neutral-950 via-purple-950/90 to-neutral-900 p-6 text-white shadow-2xl transition-all duration-300 hover:scale-[1.01]"
          >
            {/* Gold foil border styling */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200" />
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-amber-400/20 pb-3">
                <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">
                  ✦ Royal Luxe Edition ✦
                </span>
                <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-semibold text-amber-200 uppercase">
                  VIP Invitation
                </span>
              </div>

              <div className="text-center pt-2">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400">You Are Cordially Invited To Celebrate</p>
                <h4 className="mt-2 font-serif text-xl font-bold bg-gradient-to-r from-amber-200 via-amber-100 to-amber-300 bg-clip-text text-transparent">
                  {event.name}
                </h4>
                <p className="mt-1 text-xs text-amber-200/80 italic font-serif">
                  "{event.eventConcept?.title || 'An Evening of Distinction'}"
                </p>
              </div>

              <div className="rounded-2xl border border-amber-400/20 bg-black/40 p-3.5 text-xs text-neutral-200 leading-relaxed text-center whitespace-pre-line">
                {invitations?.formal ||
                  `We request the pleasure of your company to celebrate ${event.name}.\nJoin us for an extraordinary celebration surrounded by loved ones and timeless elegance.`}
              </div>

              <div className="space-y-1.5 text-xs border-t border-amber-400/20 pt-3">
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="text-neutral-400">Date:</span>
                  <span className="font-semibold text-amber-200">{event.date}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="text-neutral-400">Venue:</span>
                  <span className="font-semibold text-amber-200">{event.location || 'Private Celebration Pavilion'}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="text-neutral-400">Dress Code:</span>
                  <span className="font-semibold text-amber-200">Formal Celebration Attire</span>
                </div>
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="text-neutral-400">RSVP:</span>
                  <span className="font-semibold text-amber-200">By 14 days prior via FêteFlow</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 pt-2 border-t border-amber-400/20">
              <button
                onClick={() => copyText(
                  `✦ CELEBRATION INVITATION: ${event.name} ✦\n\n${invitations?.formal || `You are cordially invited to celebrate ${event.name}.`}\n\nDate: ${event.date}\nVenue: ${event.location || 'Private Pavilion'}\nDress Code: Formal Celebration Attire\nRSVP: Confirmed via FêteFlow`,
                  'luxury'
                )}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/10 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-400/20 transition-colors"
              >
                {copiedKey === 'luxury' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'luxury' ? 'Copied' : 'Copy Text'}</span>
              </button>
              <button
                onClick={() => handlePrintCard('Modern Luxury Invitation', 'invite-card-luxury')}
                className="flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800/80 px-3 py-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors"
                title="Print or Save Invitation"
              >
                <Printer className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Ethereal Botanical Elegance */}
          <div
            id="invite-card-botanical"
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-rose-300/80 dark:border-rose-700/60 bg-gradient-to-br from-violet-50/90 via-pink-50/80 to-purple-50/90 dark:from-violet-950/60 dark:via-purple-950/40 dark:to-neutral-950 p-6 shadow-xl transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-400 via-pink-400 to-violet-400" />
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-800/40 pb-3">
                <span className="text-[10px] font-bold tracking-widest text-rose-600 dark:text-rose-400 uppercase">
                  🌿 Botanical Chic 🌿
                </span>
                <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[9px] font-semibold text-rose-700 dark:text-rose-300 uppercase">
                  Honored Guest
                </span>
              </div>

              <div className="text-center pt-2">
                <p className="text-[10px] uppercase tracking-widest text-brand-text-secondary">A Joyful Celebration Of Life</p>
                <h4 className="mt-2 font-serif text-xl font-bold text-brand-text">
                  {event.name}
                </h4>
                <p className="mt-1 text-xs text-brand-primary italic font-serif">
                  "{event.eventConcept?.theme || 'Curated Joy & Harmony'}"
                </p>
              </div>

              <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-white/70 dark:bg-black/30 p-3.5 text-xs text-brand-text leading-relaxed text-center whitespace-pre-line">
                {invitations?.elegant ||
                  `Join us under the open skies as we gather to celebrate ${event.name}.\nExpect delightful culinary creations, joyful music, and unforgettable memories.`}
              </div>

              <div className="space-y-1.5 text-xs border-t border-rose-200 dark:border-rose-800/40 pt-3">
                <div className="flex items-center justify-between text-brand-text">
                  <span className="text-brand-text-secondary">Celebration Date:</span>
                  <span className="font-semibold text-rose-700 dark:text-rose-300">{event.date}</span>
                </div>
                <div className="flex items-center justify-between text-brand-text">
                  <span className="text-brand-text-secondary">Location:</span>
                  <span className="font-semibold">{event.location || 'Bespoke Garden Venue'}</span>
                </div>
                <div className="flex items-center justify-between text-brand-text">
                  <span className="text-brand-text-secondary">Atmosphere:</span>
                  <span className="font-semibold">{event.setting || 'Outdoor Twilight'}</span>
                </div>
                <div className="flex items-center justify-between text-brand-text">
                  <span className="text-brand-text-secondary">Hospitality:</span>
                  <span className="font-semibold">Curated Drinks & Seasonal Dining</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 pt-2 border-t border-rose-200 dark:border-rose-800/40">
              <button
                onClick={() => copyText(
                  `🌿 CELEBRATE WITH US: ${event.name} 🌿\n\n${invitations?.elegant || `Join us as we gather to celebrate ${event.name}.`}\n\nDate: ${event.date}\nLocation: ${event.location || 'Garden Pavilion'}\nAtmosphere: ${event.setting || 'Celebration'}\nRSVP via FêteFlow`,
                  'botanical'
                )}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-rose-400/40 bg-rose-500/10 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 transition-colors"
              >
                {copiedKey === 'botanical' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'botanical' ? 'Copied' : 'Copy Text'}</span>
              </button>
              <button
                onClick={() => handlePrintCard('Botanical Chic Invitation', 'invite-card-botanical')}
                className="flex items-center justify-center rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-xs text-brand-text hover:bg-brand-elevated transition-colors"
                title="Print or Save Invitation"
              >
                <Printer className="h-3.5 w-3.5 text-brand-text" />
              </button>
            </div>
          </div>

          {/* Card 3: Contemporary Minimalist Editorial */}
          <div
            id="invite-card-editorial"
            className="relative flex flex-col justify-between overflow-hidden rounded-3xl border-2 border-brand-border bg-brand-surface p-6 shadow-xl transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-brand-primary" />
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <span className="font-mono text-[10px] font-bold tracking-widest text-brand-primary uppercase">
                  // EDITORIAL ISSUE 01
                </span>
                <span className="font-mono rounded bg-brand-soft px-2 py-0.5 text-[9px] font-bold text-brand-deep uppercase">
                  ACCESS TICKET
                </span>
              </div>

              <div>
                <div className="inline-block rounded-lg bg-brand-primary/10 px-2.5 py-1 text-xs font-mono font-bold text-brand-primary">
                  {event.date}
                </div>
                <h4 className="mt-2 font-serif text-2xl font-black text-brand-text uppercase tracking-tight">
                  {event.name}
                </h4>
                <p className="mt-1 text-xs text-brand-text-secondary uppercase tracking-wider font-mono">
                  {event.eventType} · {event.guestCount} PASSES ISSUED
                </p>
              </div>

              <div className="rounded-2xl border border-brand-border bg-brand-elevated/40 p-3.5 text-xs text-brand-text leading-relaxed font-sans whitespace-pre-line">
                {invitations?.minimal ||
                  `${event.name.toUpperCase()}\nScheduled for ${event.date} at ${event.location || 'Private Venue'}.\nRSVP confirmation required for entry access.`}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs border-t border-brand-border pt-3 font-mono">
                <div>
                  <span className="text-[10px] text-brand-text-secondary uppercase">Destination</span>
                  <div className="font-semibold text-brand-text truncate">{event.location || 'Local Venue'}</div>
                </div>
                <div>
                  <span className="text-[10px] text-brand-text-secondary uppercase">Access Pass</span>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">AUTHORIZED</div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 pt-2 border-t border-brand-border">
              <button
                onClick={() => copyText(
                  `// PRIVATE ACCESS TICKET //\n\nEVENT: ${event.name}\nDATE: ${event.date}\nVENUE: ${event.location || 'Private Location'}\nCAPACITY: ${event.guestCount} Guests\n\n${invitations?.minimal || 'RSVP via FêteFlow required for entry.'}`,
                  'editorial'
                )}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-brand-primary py-2 text-xs font-bold text-white hover:bg-brand-primary-hover transition-colors"
              >
                {copiedKey === 'editorial' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKey === 'editorial' ? 'Copied' : 'Copy Text'}</span>
              </button>
              <button
                onClick={() => handlePrintCard('Contemporary Editorial Invitation', 'invite-card-editorial')}
                className="flex items-center justify-center rounded-xl border border-brand-border bg-brand-surface px-3 py-2 text-xs text-brand-text hover:bg-brand-elevated transition-colors"
                title="Print or Save Invitation"
              >
                <Printer className="h-3.5 w-3.5 text-brand-text" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
