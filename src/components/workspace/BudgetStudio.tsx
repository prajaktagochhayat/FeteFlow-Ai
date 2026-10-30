import React, { useState, useMemo, memo } from 'react';
import {
  Banknote,
  PieChart as PieIcon,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { EventPlan, BudgetAllocationItem } from '../../types';
import { ApiService } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

interface BudgetStudioProps {
  event: EventPlan;
  onUpdateEvent: (updates: Partial<EventPlan>) => void;
}

export const BudgetStudio: React.FC<BudgetStudioProps> = memo(({ event, onUpdateEvent }) => {
  const [optimizerQuery, setOptimizerQuery] = useState('');
  const [optimizing, setOptimizing] = useState(false);
  const [proposedResult, setProposedResult] = useState<{
    newAllocations: BudgetAllocationItem[];
    explanation: string;
    provider: string;
  } | null>(null);

  // New Category Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatAmount, setNewCatAmount] = useState<number>(0);
  const [newCatReason, setNewCatReason] = useState('');

  // Editing Category
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editActual, setEditActual] = useState<number>(0);

  const currency = event.budget.currency || 'INR';
  const totalBudget = event.budget.totalBudget || 0;
  const allocations = event.budget.allocations || [];

  const totalAllocated = allocations.reduce((sum, a) => sum + (a.amount || 0), 0);
  const totalActual = allocations.reduce((sum, a) => sum + (a.actualCost || 0), 0);
  const remainingBudget = totalBudget - totalActual;
  const isOverAllocated = totalAllocated > totalBudget;
  const isOverSpent = totalActual > totalBudget;

  const handleRunOptimizer = async () => {
    if (!optimizerQuery.trim()) return;
    setOptimizing(true);
    setProposedResult(null);
    try {
      const result = await ApiService.optimizeBudget(event.id || 'evt_default', optimizerQuery, event);
      setProposedResult(result);
    } catch (err: any) {
      alert('Budget optimization failed: ' + err.message);
    } finally {
      setOptimizing(false);
    }
  };

  const handleApplyOptimization = () => {
    if (!proposedResult) return;
    onUpdateEvent({
      budget: {
        ...event.budget,
        allocations: proposedResult.newAllocations,
      },
    });
    setProposedResult(null);
    setOptimizerQuery('');
  };

  const handleAddCategory = () => {
    if (!newCatName.trim() || newCatAmount <= 0) return;
    const updated = [
      ...allocations,
      {
        category: newCatName.trim(),
        amount: newCatAmount,
        reason: newCatReason.trim() || 'Custom planning category',
        actualCost: 0,
      },
    ];
    onUpdateEvent({
      budget: {
        ...event.budget,
        allocations: updated,
      },
    });
    setShowAddModal(false);
    setNewCatName('');
    setNewCatAmount(0);
    setNewCatReason('');
  };

  const handleDeleteCategory = (index: number) => {
    const updated = allocations.filter((_, i) => i !== index);
    onUpdateEvent({
      budget: {
        ...event.budget,
        allocations: updated,
      },
    });
  };

  const handleSaveEdit = (index: number) => {
    const updated = allocations.map((a, i) =>
      i === index ? { ...a, amount: editAmount, actualCost: editActual } : a
    );
    onUpdateEvent({
      budget: {
        ...event.budget,
        allocations: updated,
      },
    });
    setEditingIndex(null);
  };

  // Palette for Donut slices
  const sliceColors = ['#7655E8', '#FF7C91', '#5535B8', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text">Budget Studio</h1>
          <p className="text-xs sm:text-sm text-brand-text-secondary">
            Manage target allocations, track real-world receipts, and optimize with GenAI.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
            Total Target Budget
          </div>
          <div className="mt-2 text-2xl font-bold text-brand-text">
            {formatCurrency(totalBudget, currency)}
          </div>
          <div className="mt-1 text-xs text-brand-text-secondary">
            Allocated: {formatCurrency(totalAllocated, currency)} ({Math.round((totalAllocated / (totalBudget || 1)) * 100)}%)
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
            Logged Actual Expenses
          </div>
          <div className="mt-2 text-2xl font-bold text-brand-text">
            {formatCurrency(totalActual, currency)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs">
            {isOverSpent ? (
              <span className="flex items-center gap-1 text-red-500 font-semibold">
                <AlertTriangle className="h-3.5 w-3.5" /> Over budget by {formatCurrency(totalActual - totalBudget, currency)}
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Within planned ceiling
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border bg-brand-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-text-secondary">
            Remaining Funds
          </div>
          <div className={`mt-2 text-2xl font-bold ${remainingBudget < 0 ? 'text-red-500' : 'text-brand-primary'}`}>
            {formatCurrency(remainingBudget, currency)}
          </div>
          <div className="mt-1 text-xs text-brand-text-secondary">
            Available for contingency & unlogged items
          </div>
        </div>
      </div>

      {/* AI Budget Optimizer Section */}
      <div className="rounded-3xl border border-brand-primary/30 bg-gradient-to-r from-brand-primary/10 via-brand-soft/30 to-brand-coral/10 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-brand-primary" />
          <h2 className="font-serif text-lg font-bold text-brand-text">FêteFlow GenAI Budget Strategist</h2>
        </div>
        <p className="text-xs text-brand-text-secondary max-w-2xl mb-4">
          Instruct AI to rebalance allocations to meet custom trade-offs (e.g. "Reduce decoration by 15% without hurting theme" or "Trim catering by 50,000 and allocate to photography").
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={optimizerQuery}
            onChange={e => setOptimizerQuery(e.target.value)}
            placeholder="e.g. Reduce decoration by 15% and allocate surplus to entertainment..."
            className="flex-1 rounded-xl border border-brand-border bg-brand-surface px-4 py-2.5 text-xs text-brand-text focus:border-brand-primary focus:outline-none"
          />
          <button
            onClick={handleRunOptimizer}
            disabled={optimizing || !optimizerQuery.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover disabled:opacity-50"
          >
            {optimizing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{optimizing ? 'Analyzing...' : 'Optimize Budget'}</span>
          </button>
        </div>

        {/* Proposed Optimization Diff Review */}
        {proposedResult && (
          <div className="mt-4 rounded-2xl border border-brand-border bg-brand-surface p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-primary">AI Rebalance Proposal</span>
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-brand-deep">
                {proposedResult.provider === 'gemini' ? '✨ Gemini AI' : '✨ AI Rebalance'}
              </span>
            </div>
            <p className="mt-1 text-xs text-brand-text">{proposedResult.explanation}</p>

            <div className="mt-3 space-y-1.5 border-t border-brand-border pt-3">
              {proposedResult.newAllocations.map((alloc, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1">
                  <span className="font-medium text-brand-text">{alloc.category}</span>
                  <span className="font-bold text-brand-primary">
                    {formatCurrency(alloc.amount, currency)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-brand-border pt-3">
              <button
                onClick={() => setProposedResult(null)}
                className="rounded-xl border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-text hover:bg-brand-elevated"
              >
                Discard
              </button>
              <button
                onClick={handleApplyOptimization}
                className="flex items-center gap-1.5 rounded-xl bg-brand-primary px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-brand-primary-hover"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Apply Rebalance</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Allocations Table & Donut Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Allocations Table */}
        <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-brand-text">Category Allocations</h3>
            <span className="text-xs text-brand-text-secondary">{allocations.length} categories</span>
          </div>

          <div className="space-y-3">
            {allocations.map((alloc, idx) => {
              const pct = Math.round((alloc.amount / (totalBudget || 1)) * 100);
              const isEditing = editingIndex === idx;

              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-brand-border bg-brand-elevated/30 p-4 transition-all hover:border-brand-primary/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: sliceColors[idx % sliceColors.length] }}
                        />
                        <span className="font-semibold text-brand-text text-sm">{alloc.category}</span>
                        <span className="text-xs font-semibold text-brand-primary">({pct}%)</span>
                      </div>
                      <p className="mt-0.5 text-xs text-brand-text-secondary">{alloc.reason}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <button
                          onClick={() => handleSaveEdit(idx)}
                          className="rounded-lg bg-emerald-500 p-1.5 text-white hover:bg-emerald-600"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingIndex(idx);
                            setEditAmount(alloc.amount);
                            setEditActual(alloc.actualCost || 0);
                          }}
                          className="rounded-lg border border-brand-border p-1.5 text-brand-text-secondary hover:text-brand-primary"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCategory(idx)}
                        className="rounded-lg border border-brand-border p-1.5 text-brand-text-secondary hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Fields */}
                  {isEditing ? (
                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-brand-border pt-3">
                      <div>
                        <label className="text-[10px] font-semibold text-brand-text-secondary uppercase">
                          Planned Allocation
                        </label>
                        <input
                          type="number"
                          value={editAmount}
                          onChange={e => setEditAmount(parseFloat(e.target.value) || 0)}
                          className="mt-1 w-full rounded-lg border border-brand-border bg-brand-surface px-2 py-1 text-xs text-brand-text"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-brand-text-secondary uppercase">
                          Actual Logged Spent
                        </label>
                        <input
                          type="number"
                          value={editActual}
                          onChange={e => setEditActual(parseFloat(e.target.value) || 0)}
                          className="mt-1 w-full rounded-lg border border-brand-border bg-brand-surface px-2 py-1 text-xs text-brand-text"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center justify-between text-xs border-t border-brand-border/60 pt-2">
                      <div>
                        <span className="text-brand-text-secondary">Planned: </span>
                        <span className="font-semibold text-brand-text">
                          {formatCurrency(alloc.amount, currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-brand-text-secondary">Actual: </span>
                        <span
                          className={`font-semibold ${
                            (alloc.actualCost || 0) > alloc.amount ? 'text-red-500' : 'text-brand-text'
                          }`}
                        >
                          {formatCurrency(alloc.actualCost || 0, currency)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Allocation Visual Bar */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-brand-elevated overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: sliceColors[idx % sliceColors.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual Donut Chart Breakdown */}
        <div className="rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-sm flex flex-col items-center">
          <h3 className="font-serif text-lg font-bold text-brand-text mb-4 w-full">Allocation Share</h3>

          {/* SVG Donut */}
          <div className="relative flex h-48 w-48 items-center justify-center">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              {allocations.map((alloc, i) => {
                const total = totalAllocated || 1;
                const pct = alloc.amount / total;
                const strokeDasharray = `${pct * 282.7} 282.7`;
                // Calculate cumulative offset
                let offset = 0;
                for (let j = 0; j < i; j++) {
                  offset += (allocations[j].amount / total) * 282.7;
                }

                return (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke={sliceColors[i % sliceColors.length]}
                    strokeWidth="10"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-offset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            <div className="absolute text-center">
              <div className="text-xs font-semibold text-brand-text-secondary">Allocated</div>
              <div className="text-sm font-bold text-brand-text">{formatCurrency(totalAllocated, currency)}</div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 w-full space-y-1.5 text-xs max-h-48 overflow-y-auto">
            {allocations.map((alloc, i) => (
              <div key={i} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: sliceColors[i % sliceColors.length] }}
                  />
                  <span className="truncate text-brand-text">{alloc.category}</span>
                </div>
                <span className="font-semibold text-brand-text">
                  {Math.round((alloc.amount / (totalBudget || 1)) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-brand-text mb-4">Add Custom Category</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Category Name</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="e.g. Drone Videography or Guest Keepsakes"
                  className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Planned Allocation ({currency})</label>
                <input
                  type="number"
                  value={newCatAmount}
                  onChange={e => setNewCatAmount(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full rounded-xl border border-brand-border bg-brand-elevated px-3 py-2 text-xs text-brand-text focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-brand-text-secondary uppercase">Reason / Notes</label>
                <input
                  type="text"
                  value={newCatReason}
                  onChange={e => setNewCatReason(e.target.value)}
                  placeholder="Why is this allocation important?"
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
                onClick={handleAddCategory}
                className="rounded-xl bg-brand-primary px-4 py-2 text-xs font-bold text-white"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
BudgetStudio.displayName = "BudgetStudio";
