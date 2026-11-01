import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  PieChart,
  ListTodo,
  Palette,
  Store,
  Users2,
  RadioTower,
  Settings2,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { formatCurrency } from '../../utils/budgetLogic';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenCreateWizard: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onOpenCreateWizard }) => {
  const { activeEvent, currency } = useEvent();

  const navigationItems = [
    { id: 'dashboard', label: 'My Events', icon: CalendarDays },
    { id: 'wizard', label: 'AI Planner', icon: Sparkles, badge: 'New' },
    { id: 'budget', label: 'Budget Studio', icon: PieChart },
    { id: 'timeline', label: 'Timeline & Tasks', icon: ListTodo },
    { id: 'themes', label: 'Theme Studio', icon: Palette },
    { id: 'vendors', label: 'Vendors', icon: Store },
    { id: 'collaborators', label: 'Collaborators', icon: Users2 },
    { id: 'eventday', label: 'Event Day', icon: RadioTower, liveBadge: true },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  return (
    <aside className="w-64 border-r border-[var(--border-main)] bg-[var(--bg-card)] flex flex-col justify-between shrink-0 h-[calc(100vh-57px)] sticky top-[57px] transition-colors overflow-y-auto">
      <div className="p-3 space-y-4">
        {/* Navigation list */}
        <nav className="space-y-1" aria-label="Main Navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'wizard') {
                    onOpenCreateWizard();
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/30'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.liveBadge && (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                )}
                {item.badge && !item.liveBadge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Event Mini Summary Card */}
      {activeEvent && (
        <div className="p-3 border-t border-[var(--border-main)]">
          <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                Active Project
              </span>
              <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                {activeEvent.guestCount} Guests
              </span>
            </div>
            <div className="font-semibold text-xs text-[var(--text-main)] truncate" title={activeEvent.title}>
              {activeEvent.title}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
              <span>Budget</span>
              <span className="font-semibold text-[var(--text-main)]">
                {formatCurrency(activeEvent.totalBudget, currency)}
              </span>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full flex items-center justify-center gap-1 py-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline pt-1"
            >
              <span>View Workspace</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
