import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GitBranch,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { TaskItem } from '../../types/event';
import {
  detectDependencyCycle,
  findImpactedDownstreamTasks,
  calculateCriticalPath,
} from '../../utils/timelineLogic';

export const TimelineManager: React.FC = () => {
  const { activeEvent, addTask, updateTask, deleteTask } = useEvent();

  const [currentTab, setCurrentTab] = useState<'list' | 'board' | 'timeline'>('list');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  // Delay impact simulation modal state
  const [delayTaskTarget, setDelayTaskTarget] = useState<TaskItem | null>(null);
  const [delayDays, setDelayDays] = useState<number>(3);
  const [impactResult, setImpactResult] = useState<any>(null);

  // Validation error state for circular dependencies
  const [cycleError, setCycleError] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    title: string;
    category: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'pending' | 'in_progress' | 'completed' | 'blocked';
    assigneeName: string;
    estimatedDurationHours: number;
    dependencies: string[];
  }>({
    title: '',
    category: 'Planning',
    dueDate: '2026-11-20',
    priority: 'medium',
    status: 'pending',
    assigneeName: '',
    estimatedDurationHours: 6,
    dependencies: [],
  });

  if (!activeEvent) {
    return <div className="p-8 text-center text-xs text-[var(--text-muted)]">No active event selected.</div>;
  }

  const tasks = activeEvent.tasks || [];
  const { criticalTaskIds } = calculateCriticalPath(tasks);

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      category: 'Planning',
      dueDate: activeEvent.date || '2026-11-20',
      priority: 'medium',
      status: 'pending',
      assigneeName: '',
      estimatedDurationHours: 6,
      dependencies: [],
    });
    setCycleError(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      category: task.category,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      assigneeName: task.assigneeName || '',
      estimatedDurationHours: task.estimatedDurationHours || 4,
      dependencies: [...(task.dependencies || [])],
    });
    setCycleError(null);
    setIsAddModalOpen(true);
  };

  const handleToggleDependency = (taskId: string) => {
    setFormData((prev) => {
      const exists = prev.dependencies.includes(taskId);
      const nextDeps = exists
        ? prev.dependencies.filter((id) => id !== taskId)
        : [...prev.dependencies, taskId];

      // Test for cycles on the fly
      const cycleCheck = detectDependencyCycle(tasks, editingTask?.id, nextDeps);
      if (cycleCheck.hasCycle) {
        setCycleError(cycleCheck.message || 'Circular dependency detected!');
      } else {
        setCycleError(null);
      }

      return { ...prev, dependencies: nextDeps };
    });
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Check DAG cycle
    const cycleCheck = detectDependencyCycle(tasks, editingTask?.id, formData.dependencies);
    if (cycleCheck.hasCycle) {
      setCycleError(cycleCheck.message || 'Cannot save task with circular dependencies!');
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        title: formData.title,
        category: formData.category,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: formData.status,
        assigneeName: formData.assigneeName,
        estimatedDurationHours: formData.estimatedDurationHours,
        dependencies: formData.dependencies,
      });
    } else {
      addTask({
        title: formData.title,
        category: formData.category,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: formData.status,
        assigneeName: formData.assigneeName,
        estimatedDurationHours: formData.estimatedDurationHours,
        dependencies: formData.dependencies,
      });
    }
    setIsAddModalOpen(false);
  };

  const handleSimulateDelay = (task: TaskItem) => {
    setDelayTaskTarget(task);
    const result = findImpactedDownstreamTasks(tasks, task.id, delayDays);
    setImpactResult(result);
  };

  const handleApplyCascadeDelay = () => {
    if (!impactResult || !delayTaskTarget) return;
    for (const impacted of impactResult.impactedTasks) {
      updateTask(impacted.id, { dueDate: impacted.recommendedDueDate });
    }
    // Also push original task
    const origDate = new Date(delayTaskTarget.dueDate);
    origDate.setDate(origDate.getDate() + delayDays);
    updateTask(delayTaskTarget.id, { dueDate: origDate.toISOString().split('T')[0] });

    setDelayTaskTarget(null);
    setImpactResult(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
              DAG Dependency Engine
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              {criticalTaskIds.size} Critical Path Milestones
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--text-main)] mt-1">
            Timeline & Task Orchestration
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Prevent scheduling bottlenecks with cycle detection and downstream cascade impact tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)]">
            <button
              onClick={() => setCurrentTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'list'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setCurrentTab('board')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'board'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setCurrentTab('timeline')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'timeline'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Gantt Flow
            </button>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIST VIEW */}
      {currentTab === 'list' && (
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)] text-xs font-semibold text-[var(--text-muted)]">
            <span>All Tasks & Dependencies ({tasks.length})</span>
            <span className="text-[11px]">Click status to toggle completion</span>
          </div>

          <div className="divide-y divide-[var(--border-main)]">
            {tasks.map((task) => {
              const isCritical = criticalTaskIds.has(task.id);
              const parentDependencies = tasks.filter((t) => (task.dependencies || []).includes(t.id));
              const incompleteParents = parentDependencies.filter((p) => p.status !== 'completed');
              const isBlocked = task.status !== 'completed' && incompleteParents.length > 0;

              return (
                <div
                  key={task.id}
                  className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 rounded-xl transition-colors ${
                    isBlocked ? 'bg-amber-50/40 dark:bg-amber-950/20' : 'hover:bg-[var(--bg-card-subtle)]/50'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() =>
                        updateTask(task.id, {
                          status: task.status === 'completed' ? 'pending' : 'completed',
                        })
                      }
                      className="mt-0.5 shrink-0"
                    >
                      <CheckCircle2
                        className={`w-5 h-5 transition-colors ${
                          task.status === 'completed'
                            ? 'text-emerald-500 fill-emerald-500/20'
                            : 'text-[var(--text-muted)] hover:text-emerald-500'
                        }`}
                      />
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-bold ${
                            task.status === 'completed'
                              ? 'line-through text-[var(--text-muted)]'
                              : 'text-[var(--text-main)]'
                          }`}
                        >
                          {task.title}
                        </span>
                        {isCritical && (
                          <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                            Critical Path
                          </span>
                        )}
                        {isBlocked && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Blocked ({incompleteParents.length} dependency pending)
                          </span>
                        )}
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
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

                      <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)] flex-wrap">
                        <span className="font-semibold text-violet-600 dark:text-violet-400">
                          {task.category}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Due {task.dueDate}</span>
                        </span>
                        {task.assigneeName && (
                          <>
                            <span>•</span>
                            <span>👤 {task.assigneeName}</span>
                          </>
                        )}
                      </div>

                      {/* Dependencies chips */}
                      {parentDependencies.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 text-[10px] text-[var(--text-muted)]">
                          <GitBranch className="w-3 h-3 text-violet-500" />
                          <span>Depends on:</span>
                          {parentDependencies.map((p) => (
                            <span
                              key={p.id}
                              className={`px-1.5 py-0.5 rounded font-semibold ${
                                p.status === 'completed'
                                  ? 'bg-emerald-50 text-emerald-700 line-through'
                                  : 'bg-violet-50 text-violet-700'
                              }`}
                            >
                              {p.title}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleSimulateDelay(task)}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[var(--bg-card-subtle)] hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-[var(--border-main)] flex items-center gap-1 transition-colors"
                      title="Simulate delay and view downstream impacts"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Delay Slip</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-violet-600 transition-colors"
                      aria-label="Edit Task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-600 transition-colors"
                      aria-label="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: KANBAN BOARD */}
      {currentTab === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(['pending', 'in_progress', 'completed', 'blocked'] as const).map((statusCol) => {
            const colTasks = tasks.filter((t) => t.status === statusCol);
            const titles: Record<string, string> = {
              pending: 'To Do',
              in_progress: 'In Progress',
              completed: 'Completed',
              blocked: 'Blocked / Dependent',
            };
            return (
              <div
                key={statusCol}
                className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-3 flex flex-col"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-main)]">
                  <span className="text-xs font-bold text-[var(--text-main)]">{titles[statusCol]}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-card-subtle)] text-[var(--text-muted)]">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2 flex-1">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-2 text-xs shadow-xs"
                    >
                      <div className="font-semibold text-[var(--text-main)]">{t.title}</div>
                      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)]">
                        <span>Due {t.dueDate}</span>
                        <span className="font-semibold uppercase text-violet-600">{t.priority}</span>
                      </div>
                      <div className="flex gap-1 pt-1">
                        {statusCol !== 'completed' && (
                          <button
                            onClick={() => updateTask(t.id, { status: 'completed' })}
                            className="text-[10px] font-semibold text-emerald-600 hover:underline"
                          >
                            Mark Done
                          </button>
                        )}
                        {statusCol === 'pending' && (
                          <button
                            onClick={() => updateTask(t.id, { status: 'in_progress' })}
                            className="text-[10px] font-semibold text-violet-600 hover:underline ml-auto"
                          >
                            Start →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: GANTT FLOW / TIMELINE */}
      {currentTab === 'timeline' && (
        <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
            <h3 className="font-bold font-display text-sm text-[var(--text-main)]">
              Chronological Execution Stream
            </h3>
            <span className="text-xs text-[var(--text-muted)]">
              Organized by target milestone due dates
            </span>
          </div>

          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-main)]">
            {[...tasks]
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((t, idx) => {
                const isCritical = criticalTaskIds.has(t.id);
                return (
                  <div key={t.id} className="relative pl-8 space-y-1">
                    <span
                      className={`absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-card)] ${
                        t.status === 'completed'
                          ? 'bg-emerald-500'
                          : isCritical
                          ? 'bg-amber-500'
                          : 'bg-violet-500'
                      }`}
                    />
                    <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-semibold text-[var(--text-main)] flex items-center gap-2">
                          <span>{t.title}</span>
                          {isCritical && (
                            <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded font-bold">
                              Critical
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          {t.category} • Assigned to {t.assigneeName || 'Event Team'}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-[var(--text-main)]">
                        {t.dueDate}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Downstream Impact & Delay Simulator Modal */}
      {delayTaskTarget && impactResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold font-display text-[var(--text-main)]">
                  Simulate Milestone Slip Impact
                </h3>
              </div>
              <button
                onClick={() => setDelayTaskTarget(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              If <strong>"{delayTaskTarget.title}"</strong> slips by {delayDays} days, the DAG scheduling engine has identified{' '}
              <strong>{impactResult.impactedTasks.length} downstream tasks</strong> that will be pushed back:
            </p>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {impactResult.impactedTasks.length === 0 ? (
                <div className="p-3 text-xs text-emerald-600 bg-emerald-50 rounded-lg">
                  No downstream dependencies depend on this task! No cascade slip detected.
                </div>
              ) : (
                impactResult.impactedTasks.map((t: any) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-[var(--text-main)]">{t.title}</span>
                    <span className="font-mono text-[11px] text-amber-600">
                      {t.currentDueDate} → <strong>{t.recommendedDueDate}</strong>
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-main)]">
              <button
                onClick={() => setDelayTaskTarget(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--bg-card-subtle)] text-[var(--text-main)]"
              >
                Cancel
              </button>
              {impactResult.impactedTasks.length > 0 && (
                <button
                  onClick={handleApplyCascadeDelay}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                >
                  Apply Cascade Schedule Slip
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Task Modal with Dependency Picker and Cycle Protection */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveTask}
            className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
              <h3 className="text-base font-bold font-display text-[var(--text-main)]">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                ✕
              </button>
            </div>

            {cycleError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{cycleError}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[var(--text-muted)]">Task Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Confirm Stage AV & Band Soundcheck"
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[var(--text-muted)]">Assignee Name</label>
                  <input
                    type="text"
                    value={formData.assigneeName}
                    onChange={(e) => setFormData({ ...formData, assigneeName: e.target.value })}
                    placeholder="e.g. Priya Mukherjee"
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
              </div>

              {/* Task Dependency Picker */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-[var(--text-muted)] flex items-center justify-between">
                  <span>Prerequisite Tasks (Must complete before this task)</span>
                  <span className="text-[10px] text-violet-600">DAG Cycle Protected</span>
                </label>
                <div className="max-h-36 overflow-y-auto p-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-1">
                  {tasks
                    .filter((t) => t.id !== editingTask?.id)
                    .map((t) => {
                      const isSelected = formData.dependencies.includes(t.id);
                      return (
                        <label
                          key={t.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-[var(--bg-card)] cursor-pointer text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleDependency(t.id)}
                            className="rounded text-violet-600 focus:ring-violet-500"
                          />
                          <span className="font-medium text-[var(--text-main)] truncate">{t.title}</span>
                          <span className="ml-auto text-[10px] text-[var(--text-muted)]">{t.dueDate}</span>
                        </label>
                      );
                    })}
                </div>
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
                disabled={!!cycleError}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
