import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Trash2,
  ExternalLink,
  ShieldAlert,
  Info,
  MapPin,
  Users,
  Edit3,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { calculateBudgetMetrics, formatCurrency } from '../../utils/budgetLogic';

interface DashboardOverviewProps {
  onOpenCreateWizard: () => void;
  onNavigate: (view: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenCreateWizard,
  onNavigate,
}) => {
  const { events, activeEvent, setActiveEventId, deleteEvent, updateEvent, currency, resetToDemo } = useEvent();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    date: string;
    guestCount: number;
    totalBudget: number;
    location: string;
    venueName: string;
    conceptDescription: string;
  }>({
    title: '',
    date: '',
    guestCount: 200,
    totalBudget: 80000,
    location: '',
    venueName: '',
    conceptDescription: '',
  });

  const handleOpenEditEvent = () => {
    if (!activeEvent) return;
    setEditFormData({
      title: activeEvent.title,
      date: activeEvent.date,
      guestCount: activeEvent.guestCount,
      totalBudget: activeEvent.totalBudget,
      location: activeEvent.location,
      venueName: activeEvent.venueName || '',
      conceptDescription: activeEvent.conceptDescription || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEventDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !editFormData.title.trim()) return;

    updateEvent(activeEvent.id, {
      title: editFormData.title.trim(),
      date: editFormData.date,
      guestCount: Math.max(1, Number(editFormData.guestCount) || 1),
      totalBudget: Math.max(1000, Number(editFormData.totalBudget) || 1000),
      location: editFormData.location.trim(),
      venueName: editFormData.venueName.trim() || undefined,
      conceptDescription: editFormData.conceptDescription.trim(),
    });
    setIsEditModalOpen(false);
  };

  // Compute metrics across all events or active event
  const currentMetrics = activeEvent
    ? calculateBudgetMetrics(activeEvent.budget, activeEvent.totalBudget, activeEvent.guestCount)
    : null;

  // Tasks awaiting completion
  const pendingTasks = (activeEvent?.tasks || [])
    .filter((t) => t.status !== 'completed')
    .slice(0, 5);

  const completedTaskCount = (activeEvent?.tasks || []).filter((t) => t.status === 'completed').length;
  const totalTaskCount = activeEvent?.tasks.length || 0;
  const progressPercentage = totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Simulation / Demo Data Notification Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 text-xs">
        <div className="flex items-center gap-2.5 text-violet-900 dark:text-violet-200">
          <Info className="w-4 h-4 text-violet-600 shrink-0" />
          <span>
            <strong>Demonstration Workspace:</strong> Loaded with the reference{' '}
            <em>"Modern Bengali College Farewell"</em> (₹80,000 / 200 Guests). All modifications, budgets, tasks, and schedules persist locally.
          </span>
        </div>
        <button
          onClick={resetToDemo}
          className="self-start sm:self-auto px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 font-semibold hover:bg-violet-100 transition-colors"
        >
          Reset Demo Event
        </button>
      </div>

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--text-main)]">
            Event Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Real-time health, budgets, and scheduling across your active celebrations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateWizard}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/30 transition-all hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Event</span>
          </button>
        </div>
      </div>

      {/* Prominent Budget Overrun Protection Warning */}
      {currentMetrics?.isOverrun && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-rose-900 dark:text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="text-rose-700 dark:text-rose-400">Budget Overrun Detected:</strong> Planned expenditures ({formatCurrency(currentMetrics.plannedTotal, currency)}) exceed your authoritative budget limit ({formatCurrency(currentMetrics.totalBudget, currency)}) by{' '}
              <span className="font-extrabold underline">{formatCurrency(currentMetrics.overrunAmount, currency)}</span>.
            </div>
          </div>
          <button
            onClick={() => onNavigate('budget')}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors shrink-0"
          >
            Rebalance in Budget Studio →
          </button>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Planned Budget */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Total Planned Budget</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-[var(--text-main)]">
            {currentMetrics ? formatCurrency(currentMetrics.plannedTotal, currency) : '₹0'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Limit: {currentMetrics ? formatCurrency(currentMetrics.totalBudget, currency) : '₹0'}</span>
            <span
              className={`font-semibold ${
                currentMetrics?.isOverrun ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {currentMetrics ? `${Math.round(currentMetrics.utilizationRate)}% used` : '0%'}
            </span>
          </div>
        </div>

        {/* Cost Per Guest */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Cost Per Guest</span>
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center text-violet-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-[var(--text-main)]">
            {currentMetrics ? formatCurrency(currentMetrics.costPerGuest, currency) : '₹0'}
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Target headcount: {activeEvent?.guestCount || 0} attendees
          </div>
        </div>

        {/* Tasks & Milestones */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Event Readiness</span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-display text-[var(--text-main)]">
            {progressPercentage}%
          </div>
          <div className="w-full bg-[var(--border-main)] h-2 rounded-full overflow-hidden">
            <div
              className="bg-violet-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Next Key Milestone */}
        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-[var(--text-muted)]">
            <span className="text-xs font-semibold">Target Event Date</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-display text-[var(--text-main)] truncate">
            {activeEvent?.date || 'No date set'}
          </div>
          <div className="text-[11px] text-[var(--text-muted)] truncate">
            {activeEvent?.location || 'Venue pending'}
          </div>
        </div>
      </div>

      {/* Main Grid: Active Event Deep Dive & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Active Event Card + Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {activeEvent && (
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                      {activeEvent.eventType}
                    </span>
                    {activeEvent.isDemo && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                        Demonstration Scenario
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold font-display text-[var(--text-main)] mt-1">
                    {activeEvent.title}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-violet-500" />
                    <span>{activeEvent.venueName ? `${activeEvent.venueName}, ` : ''}{activeEvent.location}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenEditEvent}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] hover:bg-violet-100 dark:hover:bg-zinc-800 border border-[var(--border-main)] text-[var(--text-main)] transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-violet-600" />
                    <span>Edit Event</span>
                  </button>
                  <button
                    onClick={() => onNavigate('budget')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] hover:bg-violet-50 dark:hover:bg-zinc-800 border border-[var(--border-main)] transition-colors"
                  >
                    Budget Studio
                  </button>
                  <button
                    onClick={() => onNavigate('eventday')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center gap-1"
                  >
                    <span>Event Day</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Concept description */}
              <p className="text-xs text-[var(--text-main)]/90 leading-relaxed bg-[var(--bg-card-subtle)] p-3 rounded-xl border border-[var(--border-main)]">
                {activeEvent.conceptDescription}
              </p>

              {/* Theme & Palette preview */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div>
                  <div className="text-[11px] font-semibold text-[var(--text-muted)]">Active Theme</div>
                  <div className="text-xs font-bold text-[var(--text-main)]">{activeEvent.theme?.name}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  {(activeEvent.theme?.colors || []).map((c, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  <button
                    onClick={() => onNavigate('themes')}
                    className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline ml-2"
                  >
                    Customize →
                  </button>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--border-main)]">
                <button
                  onClick={() => onNavigate('budget')}
                  className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] hover:border-violet-400 border border-transparent text-left transition-all"
                >
                  <div className="text-[10px] text-[var(--text-muted)] font-semibold">Budget</div>
                  <div className="text-xs font-bold text-[var(--text-main)]">
                    {formatCurrency(currentMetrics?.plannedTotal || 0, currency)}
                  </div>
                </button>
                <button
                  onClick={() => onNavigate('timeline')}
                  className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] hover:border-violet-400 border border-transparent text-left transition-all"
                >
                  <div className="text-[10px] text-[var(--text-muted)] font-semibold">Tasks</div>
                  <div className="text-xs font-bold text-[var(--text-main)]">
                    {completedTaskCount}/{totalTaskCount} Done
                  </div>
                </button>
                <button
                  onClick={() => onNavigate('vendors')}
                  className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] hover:border-violet-400 border border-transparent text-left transition-all"
                >
                  <div className="text-[10px] text-[var(--text-muted)] font-semibold">Vendors</div>
                  <div className="text-xs font-bold text-[var(--text-main)]">
                    {activeEvent.vendors?.length || 0} Quoted
                  </div>
                </button>
                <button
                  onClick={() => onNavigate('collaborators')}
                  className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] hover:border-violet-400 border border-transparent text-left transition-all"
                >
                  <div className="text-[10px] text-[var(--text-muted)] font-semibold">Team</div>
                  <div className="text-xs font-bold text-[var(--text-main)]">
                    {activeEvent.collaborators?.length || 0} Members
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* All Events List */}
          <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-display text-base text-[var(--text-main)]">
                All Planned Events ({events.length})
              </h3>
              <button
                onClick={onOpenCreateWizard}
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Event</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--border-main)]">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className={`py-3 flex items-center justify-between gap-3 ${
                    ev.id === activeEvent?.id ? 'bg-violet-50/50 dark:bg-violet-950/20 px-2 rounded-lg' : ''
                  }`}
                >
                  <div
                    onClick={() => setActiveEventId(ev.id)}
                    className="cursor-pointer space-y-0.5 flex-1 min-w-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-[var(--text-main)] truncate">
                        {ev.title}
                      </span>
                      {ev.id === activeEvent?.id && (
                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-violet-600 text-white">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-3">
                      <span>{ev.date}</span>
                      <span>•</span>
                      <span>{ev.guestCount} guests</span>
                      <span>•</span>
                      <span>{formatCurrency(ev.totalBudget, currency)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveEventId(ev.id)}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-[var(--bg-card-subtle)] hover:bg-violet-100 dark:hover:bg-zinc-800 text-[var(--text-main)]"
                    >
                      Open
                    </button>
                    {events.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${ev.title}"?`)) {
                            deleteEvent(ev.id);
                          }
                        }}
                        className="p-1 rounded text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                        aria-label="Delete Event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Deadlines, Tasks awaiting completion, AI insights */}
        <div className="space-y-6">
          {/* Upcoming Deadlines & Tasks */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-display text-sm text-[var(--text-main)]">
                Upcoming Deadlines
              </h3>
              <button
                onClick={() => onNavigate('timeline')}
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
              >
                View all ({pendingTasks.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--text-muted)]">
                  All milestones completed! 🎉
                </div>
              ) : (
                pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] flex items-start justify-between gap-2"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="text-xs font-semibold text-[var(--text-main)] truncate">
                        {task.title}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span>Due {task.dueDate}</span>
                        {task.isCriticalPath && (
                          <span className="text-amber-600 font-bold">• Critical Path</span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        task.priority === 'urgent'
                          ? 'bg-rose-100 text-rose-700'
                          : task.priority === 'high'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Strategic Recommendations Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-900 to-indigo-950 text-white space-y-3 shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-violet-200">
                AI Architect Insight
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-violet-100">
              {currentMetrics && currentMetrics.remainingPlanned > 0
                ? `You have ${formatCurrency(currentMetrics.remainingPlanned, currency)} remaining in unallocated budget headroom. Consider reserving this in the Contingency fund or enhancing stage lighting for evening photos.`
                : `Budget is tightly matched at 100% capacity. Use the Copilot to rebalance allocations safely before committing new vendor deposits.`}
            </p>
            <button
              onClick={() => onNavigate('budget')}
              className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore Budget Rebalancer</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Key Contingencies */}
          {activeEvent && activeEvent.risks && activeEvent.risks.length > 0 && (
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-[var(--text-main)]">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold font-display text-sm">Monitored Contingencies</h3>
              </div>
              <div className="space-y-2">
                {activeEvent.risks.slice(0, 2).map((r) => (
                  <div key={r.id} className="text-xs space-y-0.5 p-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)]">
                    <div className="font-semibold text-[var(--text-main)]">{r.risk}</div>
                    <div className="text-[11px] text-[var(--text-muted)]">{r.contingencyPlan}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Event Details Modal */}
      {isEditModalOpen && activeEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEventDetails}
            className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-violet-600" />
                <h3 className="text-base font-bold font-display text-[var(--text-main)]">
                  Edit Event Parameters
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-muted)]">Event Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Target Event Date</label>
                  <input
                    type="date"
                    required
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Guest Headcount</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editFormData.guestCount}
                    onChange={(e) => setEditFormData({ ...editFormData, guestCount: parseInt(e.target.value, 10) || 1 })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">
                    Total Budget Limit ({currency})
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={editFormData.totalBudget}
                    onChange={(e) => setEditFormData({ ...editFormData, totalBudget: parseInt(e.target.value, 10) || 1000 })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Location / City</label>
                  <input
                    type="text"
                    required
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-muted)]">Venue / Facility Name (Optional)</label>
                <input
                  type="text"
                  value={editFormData.venueName}
                  onChange={(e) => setEditFormData({ ...editFormData, venueName: e.target.value })}
                  placeholder="e.g. St. Xavier's Grand Hall"
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-muted)]">Concept Narrative</label>
                <textarea
                  value={editFormData.conceptDescription}
                  onChange={(e) => setEditFormData({ ...editFormData, conceptDescription: e.target.value })}
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)] h-20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-card-subtle)] text-[var(--text-main)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-sm"
              >
                Save Event Parameters
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
