import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Heart,
  PartyPopper,
  GraduationCap,
  Building2,
  Tent,
  Check,
  RefreshCw,
  SlidersHorizontal,
  AlertCircle,
  HelpCircle,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { EventType, EventPlan } from '../../types/event';
import { formatCurrency } from '../../utils/budgetLogic';
import { validateAndRepairEventPlan } from '../../utils/validation';

interface AIEventWizardProps {
  onClose: () => void;
  onPlanAccepted: (newEvent: EventPlan) => void;
}

export const AIEventWizard: React.FC<AIEventWizardProps> = ({ onClose, onPlanAccepted }) => {
  const { createEvent, currency } = useEvent();

  // Wizard state
  const [step, setStep] = useState<number>(1);
  const [eventType, setEventType] = useState<EventType>('college');
  const [vision, setVision] = useState<string>('');
  const [date, setDate] = useState<string>('2026-11-28');
  const [location, setLocation] = useState<string>('Kolkata, West Bengal');
  const [guestCount, setGuestCount] = useState<number>(200);
  const [budget, setBudget] = useState<number>(80000);
  const [indoorOutdoor, setIndoorOutdoor] = useState<'Indoor' | 'Outdoor' | 'Hybrid'>('Indoor');
  const [culturalPreferences, setCulturalPreferences] = useState<string>('Bengali cultural motifs & authentic regional dinner');
  const [specialRequirements, setSpecialRequirements] = useState<string>('Photobooth, indie fusion live music, wheelchair accessible stage');
  const [selectedVibes, setSelectedVibes] = useState<string[]>(['Desi Royalty', 'Minimalist Elegance']);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [generationSource, setGenerationSource] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable sections
  const [editableTitle, setEditableTitle] = useState<string>('');
  const [editableConcept, setEditableConcept] = useState<string>('');

  const eventTypes: { type: EventType; title: string; subtitle: string; icon: any }[] = [
    { type: 'college', title: 'College Festival / Farewell', subtitle: 'Graduation, campus galas & fests', icon: GraduationCap },
    { type: 'wedding', title: 'Wedding & Sangeet', subtitle: 'Royal ceremonies, receptions & vows', icon: Heart },
    { type: 'birthday', title: 'Birthday & Milestone', subtitle: 'Intimate dinners to epic dance bashes', icon: PartyPopper },
    { type: 'community', title: 'Community / Cultural', subtitle: 'Festivals, charity galas & fairs', icon: Tent },
    { type: 'corporate', title: 'Corporate Gathering', subtitle: 'Product launches, summits & retreats', icon: Building2 },
    { type: 'other', title: 'Private Custom Party', subtitle: 'Bespoke dinners, popups & soirees', icon: Sparkles },
  ];

  const vibeOptions = [
    'Pinterest Dream',
    'Quiet Luxury',
    'Main Character Energy',
    'Minimalist Elegance',
    'Desi Royalty',
    'Futuristic Neon',
    'Garden Romance',
    'Cozy Celebration',
  ];

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          vision,
          date,
          location,
          guestCount,
          budget,
          currency,
          vibes: selectedVibes,
          indoorOutdoor,
          culturalPreferences,
          specialRequirements,
        }),
      });

      const data = await response.json();
      if (data.success && data.plan) {
        setGeneratedPlan(data.plan);
        const sourceLabel = data.isAIGenerated ? `Live Gemini (${data.source || 'gemini'})` : 'Offline Demonstration Blueprint';
        setGenerationSource(sourceLabel);
        setEditableTitle(data.plan.title);
        setEditableConcept(data.plan.conceptDescription);
        setStep(5);
      } else {
        throw new Error(data.error || data.warning || 'Failed to generate proposal');
      }
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setErrorMsg(err.message || 'Error communicating with generation engine.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateSection = async (section: 'theme' | 'budget' | 'tasks' | 'activities') => {
    setRegeneratingSection(section);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/ai/regenerate-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          currentPlan: {
            ...generatedPlan,
            title: editableTitle || generatedPlan?.title,
            conceptDescription: editableConcept || generatedPlan?.conceptDescription,
            eventType,
            budget,
            totalBudget: budget,
            guestCount,
            location,
            date,
            vibes: selectedVibes,
            currency,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setGeneratedPlan((prev: any) => ({
          ...prev,
          [section]: data.data,
        }));
      } else {
        throw new Error(data.error || `Failed to regenerate ${section}`);
      }
    } catch (err: any) {
      console.error(`Regenerate ${section} error:`, err);
      setErrorMsg(err.message || `Failed to regenerate ${section}. User edits to other sections have been preserved.`);
    } finally {
      setRegeneratingSection(null);
    }
  };

  const updateGeneratedBudgetItem = (index: number, newCost: number) => {
    setGeneratedPlan((prev: any) => {
      if (!prev?.budget) return prev;
      const updatedBudget = [...prev.budget];
      updatedBudget[index] = { ...updatedBudget[index], estimatedCost: Math.max(0, newCost) };
      return { ...prev, budget: updatedBudget };
    });
  };

  const updateGeneratedTaskItem = (index: number, newTitle: string) => {
    setGeneratedPlan((prev: any) => {
      if (!prev?.tasks) return prev;
      const updatedTasks = [...prev.tasks];
      updatedTasks[index] = { ...updatedTasks[index], title: newTitle };
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleRejectPlan = () => {
    if (confirm('Discard this proposed event plan and return to configuration?')) {
      setGeneratedPlan(null);
      setStep(4);
    }
  };

  const handleAcceptPlan = () => {
    if (!generatedPlan) return;

    const rawPayload = {
      ...generatedPlan,
      title: editableTitle || generatedPlan.title,
      tagline: generatedPlan.tagline || 'Your Vision. Your People. Your Moment.',
      eventType,
      conceptDescription: editableConcept || generatedPlan.conceptDescription,
      date,
      time: '16:00',
      location,
      guestCount,
      currency,
      totalBudget: budget,
      isDemo: false,
    };

    const validation = validateAndRepairEventPlan(rawPayload);
    const planToSave = validation.data || rawPayload;

    const created = createEvent(planToSave);
    onPlanAccepted(created);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-400 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display text-[var(--text-main)]">
                AI Event Creation Architect
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Step {step} of 5 — {step === 1 && 'Select Event Type'}
                {step === 2 && 'Articulate Your Vision'}
                {step === 3 && 'Key Parameters & Logistics'}
                {step === 4 && 'Curate Creative Vibes'}
                {step === 5 && 'Review & Calibrate Generated Blueprint'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 text-sm font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[var(--border-main)] h-1">
          <div
            className="bg-violet-600 h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Wizard Body */}
        <div className="p-6">
          {/* STEP 1: EVENT TYPE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold font-display text-[var(--text-main)]">
                  What kind of event are we orchestrating?
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Select the core category to tailor AI budget ratios, vendor categories, and timeline milestones.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {eventTypes.map((t) => {
                  const Icon = t.icon;
                  const isSelected = eventType === t.type;
                  return (
                    <button
                      key={t.type}
                      onClick={() => setEventType(t.type)}
                      className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-32 ${
                        isSelected
                          ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 ring-2 ring-violet-500/20'
                          : 'border-[var(--border-main)] bg-[var(--bg-card)] hover:border-violet-300 hover:bg-[var(--bg-card-subtle)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-violet-600 text-white'
                              : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-violet-600" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[var(--text-main)]">{t.title}</div>
                        <div className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">
                          {t.subtitle}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: EVENT VISION */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold font-display text-[var(--text-main)]">
                  Describe your dream event in natural language
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Be as vivid or specific as you want. Mention themes, special performances, dietary nuances, or emotional tone.
                </p>
              </div>

              <textarea
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Example: Plan a Bengali-themed college farewell for 200 students in Kolkata. Our total budget is ₹80,000. We want a premium-looking stage with marigolds and brass urlis, authentic food buffet, indie fusion acoustic music, and a photo booth for seniors."
                className="w-full h-36 p-3 text-xs rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] focus:outline-none focus:ring-2 focus:ring-violet-500 text-[var(--text-main)] leading-relaxed"
              />

              {/* Sample inspiration pills */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                  Quick Prompt Templates (Click to apply):
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setVision(
                        'Plan a Bengali-themed college farewell for 200 students in Kolkata. Total budget is ₹80,000. We want an elegant stage backdrop with brass urlis, authentic dinner buffet, acoustic live music, and a polaroid photo booth.'
                      )
                    }
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] hover:border-violet-400 text-left"
                  >
                    🎓 Kolkata College Farewell (₹80K / 200 Guests)
                  </button>
                  <button
                    onClick={() =>
                      setVision(
                        'A modern pastel rooftop engagement dinner for 70 guests with fairy lights, bespoke mocktail bar, string quartet, and high-end floral centerpieces.'
                      )
                    }
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] hover:border-violet-400 text-left"
                  >
                    💍 Intimate Pastel Rooftop Engagement
                  </button>
                  <button
                    onClick={() =>
                      setVision(
                        'A cybernetic neon 21st birthday dance party for 120 friends with interactive LED photowall, DJ decks, mocktail bar, and holographic favors.'
                      )
                    }
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] hover:border-violet-400 text-left"
                  >
                    ⚡ Cyberpunk 21st Birthday Bash
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: EVENT DETAILS */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold font-display text-[var(--text-main)]">
                  Key Parameters & Logistics
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  These inputs calibrate our deterministic budget allocation and schedule algorithms.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-violet-500" />
                    <span>Event Date</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-violet-500" />
                    <span>Location / City</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kolkata, West Bengal"
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>

                {/* Guest Count */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-violet-500" />
                    <span>Expected Guest Count</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Math.max(1, parseInt(e.target.value, 10) || 0))}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>

                {/* Total Budget */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)] flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Total Budget ({currency})</span>
                  </label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={budget}
                    onChange={(e) => setBudget(Math.max(1000, parseInt(e.target.value, 10) || 0))}
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                  <span className="text-[10px] text-[var(--text-muted)]">
                    Est. {formatCurrency(Math.round(budget / (guestCount || 1)), currency)} per guest
                  </span>
                </div>
              </div>

              {/* Indoor / Outdoor & Preferences */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)]">
                    Venue Setting
                  </label>
                  <div className="flex gap-2">
                    {['Indoor', 'Outdoor', 'Hybrid'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setIndoorOutdoor(opt as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          indoorOutdoor === opt
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-[var(--bg-card-subtle)] border-[var(--border-main)] text-[var(--text-muted)]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[var(--text-muted)]">
                    Cultural, Dietary, or Accessibility Nuances (Optional)
                  </label>
                  <input
                    type="text"
                    value={culturalPreferences}
                    onChange={(e) => setCulturalPreferences(e.target.value)}
                    placeholder="e.g. Authentic Bengali feast, vegetarian counter, wheelchair access"
                    className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: VIBE SELECTION */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold font-display text-[var(--text-main)]">
                  Curate your aesthetic vibes
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Pick one or multiple styles to blend together into a cohesive visual identity.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {vibeOptions.map((vibe) => {
                  const isChecked = selectedVibes.includes(vibe);
                  return (
                    <button
                      key={vibe}
                      onClick={() => toggleVibe(vibe)}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-violet-600 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500/20'
                          : 'border-[var(--border-main)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-violet-300'
                      }`}
                    >
                      <span>{vibe}</span>
                      {isChecked ? <Check className="w-3.5 h-3.5 text-violet-600" /> : <span />}
                    </button>
                  );
                })}
              </div>

              {/* Ready to generate trigger summary */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-200 dark:border-violet-900/50 space-y-2 mt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-violet-900 dark:text-violet-200">
                  <Sparkles className="w-4 h-4 text-violet-600 animate-spin" />
                  <span>Ready to Synthesize Event Blueprint</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Our server-side Gemini 3.8 Flash model will construct a calibrated plan with itemized budgets strictly capped at {formatCurrency(budget, currency)}, a DAG dependency schedule, curated color palette, and contingency risks.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW GENERATED PLAN */}
          {step === 5 && generatedPlan && (
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              {/* Header with Title and Full Regenerate */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--border-main)] gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 rounded">
                      {generationSource}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">Click text to edit</span>
                  </div>
                  <input
                    type="text"
                    value={editableTitle}
                    onChange={(e) => setEditableTitle(e.target.value)}
                    className="text-lg font-bold font-display text-[var(--text-main)] bg-transparent border-b border-dashed border-violet-300 focus:outline-none w-full mt-1"
                    placeholder="Event Title"
                  />
                </div>
                <button
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--bg-card-subtle)] border border-[var(--border-main)] hover:bg-violet-50 text-[var(--text-muted)] hover:text-violet-600 transition-colors shrink-0 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Regenerate Entire Plan</span>
                </button>
              </div>

              {/* Concept Narrative (Editable) */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)]">
                  Concept Description (Editable)
                </label>
                <textarea
                  value={editableConcept}
                  onChange={(e) => setEditableConcept(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)] leading-relaxed h-20 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              {/* Section 1: Theme & Palette */}
              {generatedPlan.theme && (
                <div className="p-3.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[var(--text-main)]">
                        Theme: {generatedPlan.theme.name}
                      </span>
                      <span className="text-[10px] text-violet-600 font-semibold ml-2">
                        {generatedPlan.theme.vibe}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRegenerateSection('theme')}
                      disabled={regeneratingSection === 'theme'}
                      className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-violet-200 dark:border-violet-800"
                    >
                      <RefreshCw className={`w-3 h-3 ${regeneratingSection === 'theme' ? 'animate-spin' : ''}`} />
                      <span>Regenerate Theme</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(generatedPlan.theme.colors || []).map((c: string, i: number) => (
                      <div key={i} className="flex items-center gap-1">
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: c }}
                        />
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">{c}</span>
                      </div>
                    ))}
                  </div>
                  {generatedPlan.theme.decorElements && generatedPlan.theme.decorElements.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {generatedPlan.theme.decorElements.map((el: string, idx: number) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                          {el}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)] pt-1">
                    <div>
                      <strong>Music Mood:</strong> {generatedPlan.theme.musicMood}
                    </div>
                    <div>
                      <strong>Lighting:</strong> {generatedPlan.theme.lightingStyle}
                    </div>
                  </div>
                </div>
              )}

              {/* Section 2: Budget Breakdown (Editable) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-main)]">
                      Budget Allocation (Editable Costs)
                    </h4>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      Allocated: {formatCurrency(
                        (generatedPlan.budget || []).reduce((s: number, b: any) => s + (Number(b.estimatedCost) || 0), 0),
                        currency
                      )} / Cap: {formatCurrency(budget, currency)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRegenerateSection('budget')}
                    disabled={regeneratingSection === 'budget'}
                    className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-violet-200 dark:border-violet-800"
                  >
                    <RefreshCw className={`w-3 h-3 ${regeneratingSection === 'budget' ? 'animate-spin' : ''}`} />
                    <span>Regenerate Budget</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {(generatedPlan.budget || []).map((b: any, i: number) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase">
                          {b.category}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-violet-500">{b.priority || 'must-have'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-[var(--text-muted)]">{currency === 'INR' ? '₹' : '$'}</span>
                        <input
                          type="number"
                          value={b.estimatedCost}
                          onChange={(e) => updateGeneratedBudgetItem(i, Number(e.target.value) || 0)}
                          className="w-full text-xs font-bold text-[var(--text-main)] bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-[var(--border-main)] focus:outline-none focus:ring-1 focus:ring-violet-500"
                        />
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] truncate">{b.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Tasks & Milestones Preview (Editable) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-main)]">
                      Key Timeline Tasks (DAG Scheduled)
                    </h4>
                    <span className="text-[10px] text-[var(--text-muted)]">Deterministic dependency sequence</span>
                  </div>
                  <button
                    onClick={() => handleRegenerateSection('tasks')}
                    disabled={regeneratingSection === 'tasks'}
                    className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-violet-200 dark:border-violet-800"
                  >
                    <RefreshCw className={`w-3 h-3 ${regeneratingSection === 'tasks' ? 'animate-spin' : ''}`} />
                    <span>Regenerate Tasks</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  {(generatedPlan.tasks || []).map((t: any, i: number) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-main)] flex items-center justify-between text-xs gap-2"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                        <input
                          type="text"
                          value={t.title}
                          onChange={(e) => updateGeneratedTaskItem(i, e.target.value)}
                          className="w-full text-xs font-medium text-[var(--text-main)] bg-transparent border-b border-transparent hover:border-[var(--border-main)] focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] font-semibold shrink-0">
                        Due {t.dueDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Signature Activities */}
              {generatedPlan.activities && generatedPlan.activities.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[var(--text-main)]">Signature Event Moments</h4>
                    <button
                      onClick={() => handleRegenerateSection('activities')}
                      disabled={regeneratingSection === 'activities'}
                      className="flex items-center gap-1 text-[11px] font-semibold text-violet-600 hover:text-violet-700 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-violet-200 dark:border-violet-800"
                    >
                      <RefreshCw className={`w-3 h-3 ${regeneratingSection === 'activities' ? 'animate-spin' : ''}`} />
                      <span>Regenerate Activities</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedPlan.activities.map((act: string, idx: number) => (
                      <span key={idx} className="text-[11px] px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800 font-medium">
                        ✦ {act}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 5: Risks & Contingencies */}
              {generatedPlan.risks && generatedPlan.risks.length > 0 && (
                <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-2 text-xs">
                  <h4 className="font-bold text-[var(--text-main)] text-xs">Risks & Contingency Mitigation</h4>
                  <div className="space-y-1.5">
                    {generatedPlan.risks.map((r: any, idx: number) => (
                      <div key={idx} className="p-2 rounded bg-white dark:bg-zinc-800 border border-[var(--border-main)] space-y-0.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <strong className="text-[var(--text-main)]">{r.risk}</strong>
                          <span className="text-[9px] uppercase font-bold text-amber-600">Severity: {r.severity}</span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)]">{r.contingencyPlan}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Disclaimers */}
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                <strong>Notice:</strong> This plan is an editable proposed blueprint. All sections above can be regenerated individually without losing changes to other sections. Once accepted, all items save to your workspace.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 mt-4">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="px-6 py-4 border-t border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
          {step > 1 && step < 5 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 && (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/25 ml-auto"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white shadow-md shadow-violet-500/30 ml-auto"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing with Gemini...' : 'Generate Event Plan'}</span>
            </button>
          )}

          {step === 5 && (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={handleRejectPlan}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
              >
                Reject / Discard Proposal
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(4)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] hover:bg-[var(--bg-card-subtle)]"
                >
                  Back to Config
                </button>
                <button
                  onClick={handleAcceptPlan}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.01]"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Plan & Open Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
