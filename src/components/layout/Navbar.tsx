import React from 'react';
import {
  Sparkles,
  Calendar,
  DollarSign,
  CheckSquare,
  Palette,
  Users,
  Store,
  Radio,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  Plus,
  Compass,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenCreateWizard: () => void;
  onToggleCopilot: () => void;
  copilotOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenCreateWizard,
  onToggleCopilot,
  copilotOpen,
}) => {
  const { events, activeEvent, setActiveEventId, themeMode, setThemeMode, currency, setCurrency } = useEvent();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-main)] bg-[var(--bg-card)]/90 backdrop-blur-md px-4 sm:px-6 py-3 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 group text-left focus:outline-none"
            aria-label="VYBE AI Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-500 to-amber-300 flex items-center justify-center shadow-sm shadow-violet-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-[var(--text-main)]">
                  VYBE<span className="text-violet-500">.AI</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                  Pro
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] hidden sm:block">
                Your Vision. Your People. Your Moment.
              </p>
            </div>
          </button>

          {/* Active Event Selector */}
          {activeEvent && (
            <div className="hidden md:flex items-center ml-4 pl-4 border-l border-[var(--border-main)]">
              <label htmlFor="event-select" className="sr-only">Select Event</label>
              <div className="relative">
                <select
                  id="event-select"
                  value={activeEvent.id}
                  onChange={(e) => setActiveEventId(e.target.value)}
                  className="appearance-none bg-[var(--bg-card-subtle)] text-[var(--text-main)] text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 border border-[var(--border-main)] focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({ev.eventType})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Action Controls & Navigation Shortcuts */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick AI Planner Button */}
          <button
            onClick={onOpenCreateWizard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Event</span>
          </button>

          {/* AI Copilot Toggle */}
          <button
            onClick={onToggleCopilot}
            aria-label="Toggle AI Copilot"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              copilotOpen
                ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-400 text-purple-700 dark:text-purple-300'
                : 'bg-[var(--bg-card-subtle)] border-[var(--border-main)] text-[var(--text-main)] hover:border-violet-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span className="hidden sm:inline">Copilot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          {/* Currency Selector */}
          <div className="relative hidden lg:block">
            <select
              aria-label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="bg-[var(--bg-card-subtle)] text-[var(--text-main)] text-xs font-medium rounded-lg px-2.5 py-1.5 border border-[var(--border-main)] focus:outline-none cursor-pointer"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            aria-label="Toggle Theme"
            className="p-1.5 rounded-lg border border-[var(--border-main)] bg-[var(--bg-card-subtle)] text-[var(--text-main)] hover:bg-violet-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {themeMode === 'light' ? (
              <Moon className="w-4 h-4 text-violet-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
