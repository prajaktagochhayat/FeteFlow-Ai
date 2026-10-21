import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Sparkles,
  FileText,
  Copy,
  Check,
  Plus,
  HelpCircle,
  Clock,
  Phone,
  DollarSign,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { EventPlan, VendorChecklistItem } from '../../types';
import { ApiService } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

interface VendorHubProps {
  event: EventPlan;
  onUpdateEvent: (updates: Partial<EventPlan>) => void;
}

export const VendorHub: React.FC<VendorHubProps> = ({ event, onUpdateEvent }) => {
  const [selectedVendor, setSelectedVendor] = useState<VendorChecklistItem | null>(
    event.vendorChecklist[0] || null
  );

  const [generatingBrief, setGeneratingBrief] = useState(false);
  const [briefOutput, setBriefOutput] = useState<{
    briefMarkdown: string;
    questionsToAsk: string[];
    estimatedRange: string;
    provider: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  const vendors = event.vendorChecklist || [];
  const currency = event.budget.currency || 'INR';

  const handleGenerateBrief = async (category: string) => {
    setGeneratingBrief(true);
    setBriefOutput(null);
    try {
      const result = await ApiService.generateVendorBrief(event.id || 'evt_default', category);
      setBriefOutput(result);
    } catch (err: any) {
      alert('Failed to generate vendor brief: ' + err.message);
    } finally {
      setGeneratingBrief(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateVendorStatus = (
    id: string | undefined,
    status: 'researching' | 'quote_received' | 'negotiating' | 'confirmed'
  ) => {
    if (!id) return;
    const updated = vendors.map(v => (v.id === id ? { ...v, status } : v));
    onUpdateEvent({ vendorChecklist: updated });
    if (selectedVendor?.id === id) {
      setSelectedVendor({ ...selectedVendor, status });
    }
  };

  const updateVendorNotes = (id: string | undefined, notes: string) => {
    if (!id) return;
    const updated = vendors.map(v => (v.id === id ? { ...v, notes } : v));
    onUpdateEvent({ vendorChecklist: updated });
  };

  const updateVendorQuote = (id: string | undefined, quotedAmount: number) => {
    if (!id) return;
    const updated = vendors.map(v => (v.id === id ? { ...v, quotedAmount } : v));
    onUpdateEvent({ vendorChecklist: updated });
  };

  const statusColors = {
    researching: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    quote_received: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    negotiating: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
    confirmed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text">Vendor Hub & Briefs</h1>
        <p className="text-xs sm:text-sm text-brand-text-secondary">
          Track outreach statuses, negotiate quotes, and generate AI-crafted vendor briefs.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Vendor Category List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
            <span>Vendor Categories</span>
            <span>{vendors.length} Total</span>
          </div>

          <div className="space-y-2">
            {vendors.map(v => {
              const isSelected = selectedVendor?.id === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVendor(v);
                    setBriefOutput(null);
                  }}
                  className={`flex w-full flex-col rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-brand-primary bg-brand-soft/40 shadow-sm'
                      : 'border-brand-border bg-brand-surface hover:bg-brand-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-brand-text">{v.category}</span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                        statusColors[v.status]
                      }`}
                    >
                      {v.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-brand-text-secondary">
                    <span>{v.tasks.length} checklist items</span>
                    {v.quotedAmount && v.quotedAmount > 0 ? (
                      <span className="font-semibold text-brand-text">
                        {formatCurrency(v.quotedAmount, currency)}
                      </span>
                    ) : (
                      <span>No quote logged</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Selected Vendor Detail & AI Brief Generator */}
        <div className="space-y-6 lg:col-span-2">
          {selectedVendor ? (
            <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm space-y-6">
              {/* Category Header & Status Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
                <div>
                  <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
                    Vendor Workspace
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-brand-text">
                    {selectedVendor.category}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-text-secondary">Status:</span>
                  <select
                    value={selectedVendor.status}
                    onChange={e => updateVendorStatus(selectedVendor.id, e.target.value as any)}
                    className="rounded-xl border border-brand-border bg-brand-elevated px-3 py-1.5 text-xs font-semibold text-brand-text focus:outline-none"
                  >
                    <option value="researching">Researching</option>
                    <option value="quote_received">Quote Received</option>
                    <option value="negotiating">Negotiating</option>
                    <option value="confirmed">Confirmed / Booked</option>
                  </select>
                </div>
              </div>

              {/* Quotation & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-brand-text-secondary uppercase">
                    Quoted / Estimated Cost ({currency})
                  </label>
                  <input
                    type="number"
                    value={selectedVendor.quotedAmount || ''}
                    onChange={e => updateVendorQuote(selectedVendor.id, parseFloat(e.target.value) || 0)}
                    placeholder="Enter agreed or quoted price..."
                    className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs font-semibold text-brand-text focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-brand-text-secondary uppercase">
                    Contacts & Vendor Notes
                  </label>
                  <input
                    type="text"
                    value={selectedVendor.notes || ''}
                    onChange={e => updateVendorNotes(selectedVendor.id, e.target.value)}
                    placeholder="e.g. Lead contact phone, meeting scheduled, terms..."
                    className="mt-1.5 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                  />
                </div>
              </div>

              {/* Checklist & Questions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-brand-border bg-brand-elevated/30 p-4">
                  <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary" />
                    Deliverables & Checklist
                  </h4>
                  <ul className="space-y-1.5 text-xs text-brand-text-secondary">
                    {selectedVendor.tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-brand-primary">•</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-brand-border bg-brand-elevated/30 p-4">
                  <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-brand-coral" />
                    Key Questions to Ask
                  </h4>
                  <ul className="space-y-1.5 text-xs text-brand-text-secondary">
                    {selectedVendor.questionsToAsk.map((q, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-brand-coral">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* AI Vendor Brief Generator Button */}
              <div className="border-t border-brand-border pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-brand-text">Generate Formal Vendor Brief (RFP)</h4>
                    <p className="text-xs text-brand-text-secondary">
                      Synthesize an executive planning document with guest count, aesthetic direction, and budget ceiling.
                    </p>
                  </div>

                  <button
                    onClick={() => handleGenerateBrief(selectedVendor.category)}
                    disabled={generatingBrief}
                    className="flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover disabled:opacity-50"
                  >
                    {generatingBrief ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    <span>{generatingBrief ? 'Generating...' : 'Generate Brief'}</span>
                  </button>
                </div>

                {/* Generated Brief Display */}
                {briefOutput && (
                  <div className="mt-4 rounded-2xl border border-brand-border bg-brand-elevated/60 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-brand-primary" />
                        <span className="text-xs font-bold text-brand-text">
                          Vendor Brief: {selectedVendor.category}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(briefOutput.briefMarkdown)}
                        className="flex items-center gap-1.5 rounded-xl border border-brand-border bg-brand-surface px-3 py-1.5 text-xs font-semibold text-brand-text hover:bg-brand-elevated"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy RFP'}</span>
                      </button>
                    </div>

                    <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl bg-brand-surface p-4 text-xs text-brand-text font-mono border border-brand-border/60">
                      {briefOutput.briefMarkdown}
                    </pre>

                    <div className="flex items-center justify-between text-xs text-brand-text-secondary">
                      <span>Estimated Market Range: <strong className="text-brand-text">{briefOutput.estimatedRange}</strong></span>
                      <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[10px] font-bold text-brand-deep">
                        {briefOutput.provider === 'gemini' ? '✨ Gemini AI' : '⚡ Local Planner'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-brand-border bg-brand-surface p-8 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-brand-primary opacity-50" />
              <p className="mt-2 text-sm font-semibold text-brand-text">Select a vendor category</p>
              <p className="text-xs text-brand-text-secondary">View contracts, tasks, and generate AI briefs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
