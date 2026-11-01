import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Check,
  RefreshCw,
  Sliders,
  Eye,
  Image as ImageIcon,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { INSPIRATION_THEMES } from '../../data/inspirationThemes';
import { EventTheme } from '../../types/event';
import { apiUrl } from '../../utils/api';

export const ThemeStudio: React.FC = () => {
  const { activeEvent, setEventTheme } = useEvent();

  const [activeTheme, setActiveTheme] = useState<EventTheme>(() => {
    return activeEvent?.theme || INSPIRATION_THEMES[0];
  });

  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Customizer state
  const [isEditingTheme, setIsEditingTheme] = useState<boolean>(false);
  const [themeName, setThemeName] = useState<string>(activeTheme.name);
  const [themeVibe, setThemeVibe] = useState<string>(activeTheme.vibe);
  const [themeColors, setThemeColors] = useState<string[]>([...activeTheme.colors]);
  const [themeMusic, setThemeMusic] = useState<string>(activeTheme.musicMood);
  const [themeLighting, setThemeLighting] = useState<string>(activeTheme.lightingStyle);
  const [themeDressCode, setThemeDressCode] = useState<string>(activeTheme.dressCodePrompt);

  const handleSelectTheme = (theme: EventTheme) => {
    setActiveTheme(theme);
    setThemeName(theme.name);
    setThemeVibe(theme.vibe);
    setThemeColors([...theme.colors]);
    setThemeMusic(theme.musicMood);
    setThemeLighting(theme.lightingStyle);
    setThemeDressCode(theme.dressCodePrompt);
  };

  const handleApplyToEvent = () => {
    const updated: EventTheme = {
      ...activeTheme,
      name: themeName,
      vibe: themeVibe,
      colors: themeColors,
      musicMood: themeMusic,
      lightingStyle: themeLighting,
      dressCodePrompt: themeDressCode,
    };
    setEventTheme(updated);
    setSuccessToast(`Applied "${updated.name}" to active event!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const [isGeneratingTheme, setIsGeneratingTheme] = useState<boolean>(false);

  const handleGenerateAlternativeTheme = async () => {
    setIsGeneratingTheme(true);
    try {
      const response = await fetch(apiUrl('/api/ai/suggest-themes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: activeEvent?.eventType || 'celebration',
          concept: activeEvent?.conceptDescription || 'Bespoke event',
          vibe: activeTheme.vibe,
        }),
      });
      const data = await response.json();
      if (data.success && data.theme) {
        handleSelectTheme(data.theme);
        setSuccessToast(`Synthesized alternative theme: "${data.theme.name}"`);
        setTimeout(() => setSuccessToast(null), 3000);
      }
    } catch (e) {
      console.error('Failed to generate theme', e);
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  const copyHex = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
              Creative Direction
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[var(--text-main)] mt-1">
            Visual Theme Studio
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)]">
            Explore curated design aesthetics, modify 5-tone palettes, and sync mood boards directly with your event.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {successToast && (
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200">
              {successToast}
            </span>
          )}
          <button
            onClick={handleGenerateAlternativeTheme}
            disabled={isGeneratingTheme}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-100 dark:bg-purple-900/40 hover:bg-purple-200 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700 transition-colors"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingTheme ? 'animate-spin' : ''}`} />
            <span>{isGeneratingTheme ? 'Generating...' : 'AI Generate Alternative'}</span>
          </button>
          <button
            onClick={handleApplyToEvent}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/25 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Apply to Active Event</span>
          </button>
        </div>
      </div>

      {/* Active Theme Highlight Showcase */}
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Reference Imagery preview */}
          <div className="md:w-1/3 rounded-xl overflow-hidden relative border border-[var(--border-main)] max-h-72">
            <img
              src={activeTheme.referenceImage}
              alt={activeTheme.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
              <span className="text-[10px] uppercase font-bold text-violet-300">{activeTheme.vibe}</span>
              <h3 className="font-bold font-display text-lg leading-tight">{activeTheme.name}</h3>
              <p className="text-[11px] text-zinc-300 line-clamp-2 mt-1">{activeTheme.tagline}</p>
            </div>
          </div>

          {/* Details & Palette */}
          <div className="md:w-2/3 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold font-display text-[var(--text-main)]">
                    {activeTheme.name}
                  </h3>
                  <p className="text-xs text-violet-600 dark:text-violet-400 font-semibold">
                    {activeTheme.vibe}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditingTheme(!isEditingTheme)}
                  className="px-3 py-1 rounded-lg text-xs font-semibold border border-[var(--border-main)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-main)]"
                >
                  {isEditingTheme ? 'Done Editing' : 'Customize Colors'}
                </button>
              </div>

              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {activeTheme.description}
              </p>

              {/* Color Swatches with Click to Copy */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                  Signature Color Palette (Click swatch to copy hex):
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  {themeColors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => copyHex(color)}
                      className="group flex items-center gap-2 p-1.5 rounded-xl border border-[var(--border-main)] bg-[var(--bg-card-subtle)] hover:scale-105 transition-all cursor-pointer"
                      title="Click to copy hex"
                    >
                      <span
                        className="w-6 h-6 rounded-lg shadow-inner border border-black/10"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-mono text-xs font-semibold text-[var(--text-main)]">
                        {copiedHex === color ? 'Copied!' : color}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Decor & Sensory Cues */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[var(--border-main)] text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Music Mood</span>
                <p className="font-semibold text-[var(--text-main)] text-[11px] leading-tight">
                  {themeMusic}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Lighting Fixtures</span>
                <p className="font-semibold text-[var(--text-main)] text-[11px] leading-tight">
                  {themeLighting}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Attire Guidance</span>
                <p className="font-semibold text-[var(--text-main)] text-[11px] leading-tight">
                  {themeDressCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customizer Panel */}
        {isEditingTheme && (
          <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] space-y-4 pt-4">
            <h4 className="text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">
              Fine-tune Aesthetic Attributes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)]">Theme Name</label>
                <input
                  type="text"
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)]">Creative Vibe</label>
                <input
                  type="text"
                  value={themeVibe}
                  onChange={(e) => setThemeVibe(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--text-muted)]">Music Direction</label>
                <input
                  type="text"
                  value={themeMusic}
                  onChange={(e) => setThemeMusic(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Key Decorative Elements */}
        <div className="space-y-2 pt-2 border-t border-[var(--border-main)]">
          <span className="text-[11px] font-semibold text-[var(--text-muted)]">
            Signature Architectural Decor Accents:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {(activeTheme.decorElements || []).map((elem, i) => (
              <div
                key={i}
                className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-xs font-semibold text-[var(--text-main)] flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                <span>{elem}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Theme Catalog Inspiration Grid */}
      <div className="space-y-4">
        <h3 className="font-bold font-display text-base text-[var(--text-main)]">
          Curated Design Catalog ({INSPIRATION_THEMES.length} Concepts)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {INSPIRATION_THEMES.map((theme) => {
            const isSelected = activeTheme.id === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => handleSelectTheme(theme)}
                className={`group cursor-pointer rounded-2xl border bg-[var(--bg-card)] overflow-hidden shadow-xs hover:shadow-md transition-all ${
                  isSelected
                    ? 'border-violet-600 ring-2 ring-violet-500/20'
                    : 'border-[var(--border-main)] hover:border-violet-300'
                }`}
              >
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={theme.referenceImage}
                    alt={theme.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-violet-300">{theme.vibe}</span>
                      <h4 className="text-white font-bold text-sm leading-tight">{theme.name}</h4>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2">{theme.description}</p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                      {theme.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 group-hover:underline">
                      {isSelected ? 'Selected' : 'View Palette →'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
