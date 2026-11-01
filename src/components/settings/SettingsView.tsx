import React from 'react';
import {
  Settings2,
  DollarSign,
  Moon,
  Sun,
  Download,
  RotateCcw,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { Currency } from '../../types/event';

export const SettingsView: React.FC = () => {
  const { currency, setCurrency, themeMode, setThemeMode, resetToDemo, activeEvent } = useEvent();

  const handleExportJSON = () => {
    if (!activeEvent) return;
    const blob = new Blob([JSON.stringify(activeEvent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeEvent.title.toLowerCase().replace(/\s+/g, '-')}-plan.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--text-main)]">
          System & Workspace Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Configure financial currency standards, aesthetic dark mode, and data persistence controls.
        </p>
      </div>

      {/* Preferences Section */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-6">
        <h3 className="font-bold font-display text-sm text-[var(--text-main)]">
          Localization & Display
        </h3>

        {/* Currency Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-main)]">
          <div>
            <div className="text-xs font-bold text-[var(--text-main)]">Authoritative Currency Standard</div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Formatted according to standard regional currency notations (e.g. Indian Lakhs/Thousands for INR).
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['INR', 'USD', 'EUR', 'GBP'] as Currency[]).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  currency === curr
                    ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                    : 'bg-[var(--bg-card-subtle)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-main)]">
          <div>
            <div className="text-xs font-bold text-[var(--text-main)]">Interface Theme Mode</div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Warm ivory default theme or deep charcoal dark theme.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setThemeMode('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                themeMode === 'light'
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-[var(--bg-card-subtle)] border-[var(--border-main)] text-[var(--text-muted)]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light Theme</span>
            </button>
            <button
              onClick={() => setThemeMode('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                themeMode === 'dark'
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-[var(--bg-card-subtle)] border-[var(--border-main)] text-[var(--text-muted)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark Theme</span>
            </button>
          </div>
        </div>

        {/* Export & Print */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-main)]">
          <div>
            <div className="text-xs font-bold text-[var(--text-main)]">Export Event Blueprint</div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Download your complete event plan as raw JSON or print a run-of-show summary sheet.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)] hover:bg-violet-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handlePrintSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)] hover:bg-violet-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>Print Run-of-Show</span>
            </button>
          </div>
        </div>

        {/* Reset Demo Data */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-rose-600">Reset Local Demonstration Dataset</div>
            <div className="text-[11px] text-[var(--text-muted)]">
              Restores the default "Modern Bengali College Farewell" reference event and resets changes.
            </div>
          </div>
          <button
            onClick={() => {
              if (confirm('Reset workspace to the initial reference demonstration event?')) {
                resetToDemo();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Academic Capstone Architecture Specification */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-violet-600" />
          <h3 className="font-bold font-display text-sm text-[var(--text-main)]">
            B.Tech CSE Project System Architecture
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--text-muted)]">
          <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
            <strong className="text-[var(--text-main)]">Core Generative AI Engine</strong>
            <p>Google GenAI SDK (`@google/genai`) on Node/Express server with Gemini 3.8 Flash and JSON Schema enforcement.</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
            <strong className="text-[var(--text-main)]">Algorithmic Budget Balancer</strong>
            <p>Deterministic reallocation logic: offsets target increases from flexible categories to strictly guarantee 0 budget overrun.</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
            <strong className="text-[var(--text-main)]">DAG Dependency & Critical Path</strong>
            <p>DFS cycle detection in Directed Acyclic Graphs; identifies scheduling bottlenecks and downstream delay ripples.</p>
          </div>
          <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
            <strong className="text-[var(--text-main)]">Real-Time Incident Rescheduler</strong>
            <p>Continuous run-of-show adjustment calculating ripple effects on dinner buffers, ceremonies, and venue curfews.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
