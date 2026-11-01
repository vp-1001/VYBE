import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Check,
  X,
  Filter,
  DollarSign,
  Users,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { BudgetItem } from '../../types/event';
import { calculateBudgetMetrics, formatCurrency, proposeDeterministicRebalance, RebalanceProposal } from '../../utils/budgetLogic';

export const BudgetStudio: React.FC = () => {
  const { activeEvent, updateBudgetItem, addBudgetItem, deleteBudgetItem, currency } = useEvent();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [isRebalanceModalOpen, setIsRebalanceModalOpen] = useState<boolean>(false);

  // Form states
  const [formData, setFormData] = useState<{
    category: string;
    name: string;
    estimatedCost: number;
    actualCost: number;
    isPaid: boolean;
    priority: 'must-have' | 'nice-to-have' | 'optional';
    notes: string;
  }>({
    category: 'Catering',
    name: '',
    estimatedCost: 10000,
    actualCost: 0,
    isPaid: false,
    priority: 'must-have',
    notes: '',
  });

  // Rebalance instruction state
  const [rebalanceCategory, setRebalanceCategory] = useState<string>('Catering');
  const [rebalanceDelta, setRebalanceDelta] = useState<number>(5000);
  const [rebalanceResult, setRebalanceResult] = useState<RebalanceProposal | null>(null);

  // Category filter
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  if (!activeEvent) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)]">
        No active event selected.
      </div>
    );
  }

  const metrics = calculateBudgetMetrics(activeEvent.budget, activeEvent.totalBudget, activeEvent.guestCount);

  const categories = [
    'Venue',
    'Catering',
    'Decorations',
    'Photography',
    'Entertainment',
    'Invitations',
    'Transportation',
    'Clothing',
    'Miscellaneous',
    'Contingency',
  ];

  const filteredItems = selectedCategoryFilter === 'all'
    ? activeEvent.budget
    : activeEvent.budget.filter((b) => b.category.toLowerCase() === selectedCategoryFilter.toLowerCase());

  const handleOpenAdd = () => {
    setFormData({
      category: 'Catering',
      name: '',
      estimatedCost: 5000,
      actualCost: 0,
      isPaid: false,
      priority: 'must-have',
      notes: '',
    });
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      name: item.name,
      estimatedCost: item.estimatedCost,
      actualCost: item.actualCost,
      isPaid: !!item.isPaid,
      priority: item.priority || 'must-have',
      notes: item.notes || '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      updateBudgetItem(editingItem.id, {
        category: formData.category,
        name: formData.name,
        estimatedCost: Number(formData.estimatedCost) || 0,
        actualCost: Number(formData.actualCost) || 0,
        isPaid: formData.isPaid,
        priority: formData.priority,
        notes: formData.notes,
      });
    } else {
      addBudgetItem({
        category: formData.category,
        name: formData.name,
        estimatedCost: Number(formData.estimatedCost) || 0,
        actualCost: Number(formData.actualCost) || 0,
        isPaid: formData.isPaid,
        priority: formData.priority,
        notes: formData.notes,
      });
    }
    setIsAddModalOpen(false);
  };

  const handleSimulateRebalance = () => {
    const proposal = proposeDeterministicRebalance(
      activeEvent.budget,
      activeEvent.totalBudget,
      rebalanceCategory,
      rebalanceDelta
    );
    setRebalanceResult(proposal);
  };

  const handleApplyRebalance = () => {
    if (!rebalanceResult) return;
    for (const adj of rebalanceResult.adjustedItems) {
      updateBudgetItem(adj.id, { estimatedCost: adj.newEstimated });
    }
    setIsRebalanceModalOpen(false);
    setRebalanceResult(null);
  };

  // SVG Donut calculation
  const totalSum = metrics.plannedTotal || 1;
  let accumulatedAngle = 0;
  const colors = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#14B8A6', '#84CC16'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Rebalance Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
              Interactive Financial Engine
            </span>
            {metrics.isOverrun && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Overrun by {formatCurrency(metrics.overrunAmount, currency)}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--text-main)] mt-1">
            Budget Studio
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Algorithmic budget tracking with deterministic rebalancing and actual expense verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRebalanceCategory('Catering');
              setRebalanceDelta(5000);
              setRebalanceResult(null);
              setIsRebalanceModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>AI Budget Rebalancer</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Total Budget</span>
          <div className="text-lg font-bold font-display text-[var(--text-main)]">
            {formatCurrency(metrics.totalBudget, currency)}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Authoritative Cap</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Planned Total</span>
          <div className={`text-lg font-bold font-display ${metrics.isOverrun ? 'text-rose-600' : 'text-violet-600'}`}>
            {formatCurrency(metrics.plannedTotal, currency)}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">
            {Math.round(metrics.utilizationRate)}% Allocated
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Actual Spent</span>
          <div className="text-lg font-bold font-display text-emerald-600">
            {formatCurrency(metrics.actualTotal, currency)}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Verified Outflow</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Remaining Headroom</span>
          <div className={`text-lg font-bold font-display ${metrics.remainingPlanned < 0 ? 'text-rose-600' : 'text-[var(--text-main)]'}`}>
            {formatCurrency(metrics.remainingPlanned, currency)}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Buffer Available</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Cost Per Guest</span>
          <div className="text-lg font-bold font-display text-amber-600">
            {formatCurrency(metrics.costPerGuest, currency)}
          </div>
          <span className="text-[10px] text-[var(--text-muted)]">Across {activeEvent.guestCount} Pax</span>
        </div>
      </div>

      {/* Chart & Category Allocation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Donut Chart */}
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold font-display text-sm text-[var(--text-main)]">
              Category Distribution
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              Relative share of planned expenditures.
            </p>
          </div>

          {/* SVG Donut Chart */}
          <div className="flex items-center justify-center py-4 relative">
            <svg viewBox="0 0 100 100" className="w-48 h-48 -rotate-90">
              {metrics.categoryBreakdown.map((cat, idx) => {
                const fraction = cat.planned / totalSum;
                const strokeDasharray = `${fraction * 283} 283`;
                const strokeDashoffset = -accumulatedAngle * 283;
                accumulatedAngle += fraction;
                return (
                  <circle
                    key={cat.category}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    stroke={colors[idx % colors.length]}
                    strokeWidth="10"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500 hover:opacity-80"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">Total</span>
              <span className="text-sm font-bold font-display text-[var(--text-main)]">
                {formatCurrency(metrics.plannedTotal, currency)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-main)]">
            {metrics.categoryBreakdown.slice(0, 6).map((cat, idx) => (
              <div key={cat.category} className="flex items-center gap-1.5 text-[11px]">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: colors[idx % colors.length] }}
                />
                <span className="truncate text-[var(--text-muted)]">{cat.category}</span>
                <span className="ml-auto font-semibold text-[var(--text-main)]">
                  {Math.round(cat.percentageOfBudget)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (2 spans): Category Level Breakdown Bars */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold font-display text-sm text-[var(--text-main)]">
                Category Allocations vs Actuals
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Compare planned budgets with recorded vendor payments.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {metrics.categoryBreakdown.map((cat, idx) => {
              const catColor = colors[idx % colors.length];
              const pct = Math.min(100, Math.round(cat.percentageOfBudget));
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--text-main)]">{cat.category}</span>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-[var(--text-muted)]">
                        Est: <strong className="text-[var(--text-main)]">{formatCurrency(cat.planned, currency)}</strong>
                      </span>
                      <span className="text-emerald-600 font-semibold">
                        Act: {formatCurrency(cat.actual, currency)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[var(--bg-card-subtle)] h-2 rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: catColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Itemized Budget Table */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-main)]">
          <div className="flex items-center gap-3">
            <h3 className="font-bold font-display text-base text-[var(--text-main)]">
              Itemized Line Items ({filteredItems.length})
            </h3>
            {/* Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-[var(--bg-card-subtle)] text-[var(--text-main)] text-xs font-semibold rounded-lg px-2 py-1 border border-[var(--border-main)] focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] hover:bg-violet-100 dark:hover:bg-zinc-800 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Line Item</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--border-main)] text-[var(--text-muted)] font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Item / Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3 text-right">Estimated</th>
                <th className="py-2.5 px-3 text-right">Actual</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--bg-card-subtle)]/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-[var(--text-main)]">{item.name}</div>
                    {item.notes && (
                      <div className="text-[10px] text-[var(--text-muted)] truncate max-w-xs">{item.notes}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-[var(--text-muted)] font-medium">{item.category}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        item.priority === 'must-have'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          : item.priority === 'nice-to-have'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      {item.priority || 'standard'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-[var(--text-main)]">
                    {formatCurrency(item.estimatedCost, currency)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-emerald-600">
                    {formatCurrency(item.actualCost, currency)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => updateBudgetItem(item.id, { isPaid: !item.isPaid })}
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                        item.isPaid
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                      }`}
                    >
                      {item.isPaid ? 'Paid' : 'Unpaid'}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-violet-600 transition-colors"
                      aria-label="Edit Item"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteBudgetItem(item.id)}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                      aria-label="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Budget Rebalancer Modal */}
      {isRebalanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                <h3 className="text-base font-bold font-display text-[var(--text-main)]">
                  Deterministic Budget Rebalancing Engine
                </h3>
              </div>
              <button
                onClick={() => setIsRebalanceModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Want to upgrade food or decor without exceeding the total {formatCurrency(activeEvent.totalBudget, currency)} limit? Select the category you wish to increase; our algorithm will calculate safe offsets from optional line items.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)]">
                  Target Category
                </label>
                <select
                  value={rebalanceCategory}
                  onChange={(e) => setRebalanceCategory(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)]">
                  Adjustment Delta ({currency})
                </label>
                <input
                  type="number"
                  step="500"
                  value={rebalanceDelta}
                  onChange={(e) => setRebalanceDelta(parseInt(e.target.value, 10) || 0)}
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>
            </div>

            <button
              onClick={handleSimulateRebalance}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-all shadow-sm"
            >
              Simulate Balanced Reallocation
            </button>

            {/* Results Preview */}
            {rebalanceResult && (
              <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-main)]">Calculated Strategy</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      rebalanceResult.willExceedBudget ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {rebalanceResult.willExceedBudget ? 'Overrun Warning' : '100% Balanced'}
                  </span>
                </div>

                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {rebalanceResult.explanation}
                </p>

                <div className="space-y-1.5 text-xs">
                  {rebalanceResult.adjustedItems.map((adj) => (
                    <div key={adj.id} className="flex items-center justify-between p-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-main)]">
                      <div>
                        <span className="font-semibold text-[var(--text-main)]">{adj.category}</span>: {adj.name}
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <span>{formatCurrency(adj.oldEstimated, currency)}</span>
                        <span>→</span>
                        <span className={`font-bold ${adj.difference > 0 ? 'text-violet-600' : 'text-amber-600'}`}>
                          {formatCurrency(adj.newEstimated, currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setRebalanceResult(null)}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyRebalance}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Apply Rebalanced Allocations
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Line Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveItem}
            className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <h3 className="text-base font-bold font-display text-[var(--text-main)]">
                {editingItem ? 'Edit Budget Line Item' : 'Add New Budget Item'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)]">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)]">Item Name / Vendor</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Stage Floral Arch & Brass Urlis"
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)]">Estimated Cost ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)]">Actual Paid ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.actualCost}
                    onChange={(e) => setFormData({ ...formData, actualCost: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)]">Priority Level</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  >
                    <option value="must-have">Must-Have</option>
                    <option value="nice-to-have">Nice-to-Have</option>
                    <option value="optional">Optional / Flexible</option>
                  </select>
                </div>
                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] cursor-pointer text-xs font-semibold text-[var(--text-main)]">
                    <input
                      type="checkbox"
                      checked={formData.isPaid}
                      onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                    <span>Payment Completed</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)]">Notes / Scope details</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Contract signed with 10% plate buffer"
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-card-subtle)] text-[var(--text-main)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 shadow-sm transition-colors"
              >
                Save Line Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
