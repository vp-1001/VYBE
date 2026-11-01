import React from 'react';
import {
  Sparkles,
  ArrowRight,
  PieChart,
  GitBranch,
  Store,
  Radio,
  Palette,
  CheckCircle2,
  Calendar,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { INSPIRATION_THEMES } from '../../data/inspirationThemes';

interface LandingPageProps {
  onStartPlanning: () => void;
  onExploreThemes: () => void;
  onOpenDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanning,
  onExploreThemes,
  onOpenDashboard,
}) => {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-500/15 via-purple-400/10 to-amber-300/10 blur-3xl pointer-events-none rounded-full -z-10" />

        <div className="text-center max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/60 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Next-Gen AI Event Architecture</span>
            <span className="text-[10px] text-violet-500">★</span>
            <span className="text-neutral-500 dark:text-neutral-400 font-normal">Powered by Gemini</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-display leading-[1.15]">
            Your next unforgettable event starts with an{' '}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              idea.
            </span>
          </h1>

          {/* Tagline & Supporting Copy */}
          <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-2xl mx-auto font-normal leading-relaxed">
            Turn your natural-language vision into a personalized event plan—complete with deterministic budgets, DAG-scheduled timelines, curated visual themes, and an event-day command center.
          </p>

          <p className="text-xs uppercase tracking-widest font-bold text-violet-600 dark:text-violet-400">
            "Your Vision. Your People. Your Moment."
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onStartPlanning}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/30 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Plan My Event</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreThemes}
              className="px-6 py-3 rounded-xl font-semibold text-sm bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-main)] border border-[var(--border-main)] shadow-sm flex items-center gap-2 transition-all"
            >
              <Palette className="w-4 h-4 text-violet-500" />
              <span>Explore Visual Themes</span>
            </button>
            <button
              onClick={onOpenDashboard}
              className="px-4 py-3 rounded-xl font-semibold text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              Demo Workspace →
            </button>
          </div>
        </div>

        {/* Interactive Feature Hero Card Mockup */}
        <div className="mt-12 md:mt-16 relative max-w-5xl mx-auto rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] p-4 sm:p-6 shadow-xl shadow-black/5 dark:shadow-purple-950/20">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-main)]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs font-semibold text-[var(--text-muted)]">
                VYBE AI / Bengal Farewell 2026 / Active Blueprint
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Budget Calibrated ₹80,000
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* Column 1: AI Prompt & Concept */}
            <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-violet-600 dark:text-violet-400">
                Natural-Language Input
              </span>
              <p className="text-xs font-medium text-[var(--text-main)] italic">
                "Plan a Bengali-themed college farewell for 200 students in Kolkata. Total budget is ₹80,000 with stage decor, authentic buffet, acoustic indie music, and a photo booth."
              </p>
              <div className="pt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold">
                  200 Guests
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-semibold">
                  Desi Royalty Vibe
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Kolkata, WB
                </span>
              </div>
            </div>

            {/* Column 2: Budget Breakdown */}
            <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-violet-600 dark:text-violet-400">
                  Deterministic Budget Allocation
                </span>
                <span className="text-xs font-bold text-[var(--text-main)]">₹80,000</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Authentic Dinner Buffet</span>
                  <span className="font-semibold text-[var(--text-main)]">₹32,000 (40%)</span>
                </div>
                <div className="w-full bg-[var(--border-main)] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-violet-500 h-full w-[40%]" />
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Auditorium Hall & Courtyard</span>
                  <span className="font-semibold text-[var(--text-main)]">₹18,000 (22.5%)</span>
                </div>
                <div className="w-full bg-[var(--border-main)] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full w-[22.5%]" />
                </div>
                <div className="flex justify-between text-[var(--text-muted)]">
                  <span>Floral Stage & Photobooth</span>
                  <span className="font-semibold text-[var(--text-main)]">₹12,000 (15%)</span>
                </div>
                <div className="w-full bg-[var(--border-main)] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[15%]" />
                </div>
              </div>
            </div>

            {/* Column 3: Intelligent DAG Tasks */}
            <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-violet-600 dark:text-violet-400">
                DAG Schedule Engine
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2 p-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-main)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="truncate">Confirm Venue Lease</span>
                  <span className="ml-auto text-[9px] px-1 bg-emerald-100 text-emerald-700 rounded font-bold">Done</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-main)]">
                  <GitBranch className="w-3.5 h-3.5 text-violet-500" />
                  <span className="truncate">Finalize Catering Headcount</span>
                  <span className="ml-auto text-[9px] px-1 bg-violet-100 text-violet-700 rounded font-bold">Dep: Venue</span>
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded bg-[var(--bg-card)] border border-[var(--border-main)]">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span className="truncate">Stage Soundcheck</span>
                  <span className="ml-auto text-[9px] px-1 bg-amber-100 text-amber-700 rounded font-bold">Critical Path</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-main)]">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            Engineered for Modern Event Organizers
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            A unified suite that eliminates fragmented spreadsheets, messy chat threads, and surprise budget overruns.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-3 hover:border-violet-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-main)]">AI Natural-Language Architect</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Describe your vision in free text. Gemini converts your ideas into structured tasks, schedules, and custom aesthetics with strict schema enforcement.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-3 hover:border-purple-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-300">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-main)]">Budget Studio & Rebalancer</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Real-time cost per guest, actual versus estimated tracking, and deterministic algorithmic rebalancing so budget caps are never breached.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-3 hover:border-amber-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-300">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-main)]">DAG Dependency & Critical Path</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Mathematical Directed Acyclic Graph logic detects circular dependencies, calculates critical bottlenecks, and cascades delay impacts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] space-y-3 hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-main)]">Event-Day Command Center</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Real-time run-of-show orchestration, vendor arrival tracking, emergency contacts, and one-click cascading incident rescheduling.
            </p>
          </div>
        </div>
      </section>

      {/* Visual Inspiration Gallery */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-main)]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
              Curated Theme Inspirations
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              From traditional royal banquets to cybernetic festivals, find the perfect vibe.
            </p>
          </div>
          <button
            onClick={onExploreThemes}
            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Browse Full Theme Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {INSPIRATION_THEMES.slice(0, 3).map((theme) => (
            <div
              key={theme.id}
              onClick={onExploreThemes}
              className="group cursor-pointer rounded-2xl border border-[var(--border-main)] bg-[var(--bg-card)] overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={theme.referenceImage}
                  alt={theme.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // graceful fallback if network image fails
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-violet-300">
                      {theme.vibe}
                    </span>
                    <h3 className="text-white font-bold text-base leading-tight">
                      {theme.name}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <p className="text-xs text-[var(--text-muted)] line-clamp-2">
                  {theme.description}
                </p>
                {/* Palette swatches */}
                <div className="flex items-center gap-1.5 pt-1">
                  {theme.colors.map((c, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border border-black/10 shadow-inner"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-[var(--border-main)] bg-[var(--bg-card)] text-center text-xs text-[var(--text-muted)] space-y-2">
        <div className="flex items-center justify-center gap-2 font-display font-bold text-sm text-[var(--text-main)]">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span>VYBE AI</span>
        </div>
        <p>Your Vision. Your People. Your Moment. — B.Tech Computer Science & Engineering Capstone Prototype</p>
        <p className="text-[10px] text-neutral-400">
          Built with React 19, TypeScript, Tailwind CSS, Express, and Google Gemini 3.8 Flash.
        </p>
      </footer>
    </div>
  );
};
