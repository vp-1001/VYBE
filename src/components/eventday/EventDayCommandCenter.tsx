import React, { useState, useEffect } from 'react';
import {
  RadioTower,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Shield,
  ArrowRight,
  Flame,
  Sparkles,
  Users,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { recalculateScheduleForDelay } from '../../utils/eventDayLogic';

export const EventDayCommandCenter: React.FC = () => {
  const { activeEvent, updateSchedule, handleScheduleIncident } = useEvent();

  // Simulated live clock
  const [currentTime, setCurrentTime] = useState<string>('16:15');

  // Incident reporting state
  const [incidentInput, setIncidentInput] = useState<string>('The photographer is running 30 minutes late');
  const [isSimulatingIncident, setIsSimulatingIncident] = useState<boolean>(false);
  const [incidentProposal, setIncidentProposal] = useState<{
    impactedCount: number;
    summary: string[];
    delayMinutes: number;
    activityKeyword: string;
    proposedSchedule: any[];
  } | null>(null);

  const [vendorArrivals, setVendorArrivals] = useState<Record<string, boolean>>({
    v1: true, // Caterers arrived
    v3: true, // Stage Decor arrived
    v4: false, // Photographer en route
  });

  if (!activeEvent) {
    return <div className="p-8 text-center text-xs text-[var(--text-muted)]">No active event selected.</div>;
  }

  const schedule = activeEvent.schedule || [];
  const vendors = activeEvent.vendors || [];
  const emergencyContacts = activeEvent.emergencyContacts || [];

  const handleSimulateIncident = () => {
    setIsSimulatingIncident(true);

    // Extract minutes & keyword from text
    let delayMinutes = 30;
    const minMatch = incidentInput.match(/(\d+)\s*(?:min|minute|m)/i);
    if (minMatch) {
      delayMinutes = parseInt(minMatch[1], 10);
    }

    let keyword = 'Photographer';
    if (incidentInput.toLowerCase().includes('cater') || incidentInput.toLowerCase().includes('food')) {
      keyword = 'Buffet';
    } else if (incidentInput.toLowerCase().includes('band') || incidentInput.toLowerCase().includes('sound')) {
      keyword = 'Performance';
    }

    const result = recalculateScheduleForDelay(schedule, keyword, delayMinutes);

    setIncidentProposal({
      impactedCount: result.impactedItemIds.length,
      summary: result.affectedSummary,
      delayMinutes,
      activityKeyword: keyword,
      proposedSchedule: result.proposedSchedule,
    });
    setIsSimulatingIncident(false);
  };

  const handleApplyIncidentResolution = () => {
    if (!incidentProposal) return;
    updateSchedule(incidentProposal.proposedSchedule);
    setIncidentProposal(null);
    setIncidentInput('');
  };

  const toggleVendorArrival = (vendorId: string) => {
    setVendorArrivals((prev) => ({
      ...prev,
      [vendorId]: !prev[vendorId],
    }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Live Status Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-900 via-indigo-950 to-neutral-900 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <RadioTower className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Live Operations Active
                </span>
                <span className="text-xs text-zinc-300">{activeEvent.date}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold font-display leading-tight mt-0.5">
                {activeEvent.title} — Command Center
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm self-start sm:self-auto">
            <Clock className="w-4 h-4 text-amber-300" />
            <div className="font-mono text-xl font-bold tracking-wider">{currentTime} IST</div>
            <span className="text-[10px] text-zinc-300 uppercase">Live Clock</span>
          </div>
        </div>
      </div>

      {/* Incident Reporting Workflow Banner */}
      <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--text-main)]">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold font-display text-sm">Real-time Incident & Delay Rescheduling</h3>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-700">
            Automated Downstream Recalculation
          </span>
        </div>

        <p className="text-xs text-[var(--text-muted)]">
          Report sudden vendor delays or schedule changes in natural language. The deterministic engine calculates downstream ripple effects and presents an actionable approval proposal before updating the run-of-show.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={incidentInput}
            onChange={(e) => setIncidentInput(e.target.value)}
            placeholder="e.g. The photographer is running 30 minutes late"
            className="flex-1 p-2.5 text-xs rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button
            onClick={handleSimulateIncident}
            disabled={!incidentInput.trim() || isSimulatingIncident}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-sm transition-all whitespace-nowrap"
          >
            Calculate Schedule Adjustments
          </button>
        </div>

        {/* Incident Resolution Approval Card */}
        {incidentProposal && (
          <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Proposed Shift for: "{incidentProposal.activityKeyword}" (+{incidentProposal.delayMinutes}m)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                {incidentProposal.impactedCount} Downstream Activities Impacted
              </span>
            </div>

            <div className="space-y-1 text-xs">
              {incidentProposal.summary.map((line, idx) => (
                <div key={idx} className="text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <span>↳</span>
                  <span className="font-medium">{line}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-amber-200 dark:border-amber-800">
              <button
                onClick={() => setIncidentProposal(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 text-[var(--text-main)] border border-[var(--border-main)]"
              >
                Reject Changes
              </button>
              <button
                onClick={handleApplyIncidentResolution}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Approve & Reschedule Live Run-of-Show
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Run of Show Timeline & Vendor Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Run of Show Timeline */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-main)]">
            <h3 className="font-bold font-display text-sm text-[var(--text-main)]">
              Master Run-of-Show Schedule ({schedule.length} Segments)
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">
              Real-time agenda
            </span>
          </div>

          <div className="space-y-3">
            {schedule.map((item, idx) => {
              const isDelayed = item.status === 'delayed';
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                    isDelayed
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                      : 'bg-[var(--bg-card-subtle)] border-[var(--border-main)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="font-mono font-bold text-xs text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/40 px-2 py-1 rounded-md shrink-0">
                      {item.startTime} - {item.endTime}
                    </div>
                    <div>
                      <div className="font-bold text-[var(--text-main)] flex items-center gap-2">
                        <span>{item.activity}</span>
                        {isDelayed && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            Rescheduled
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-violet-500" />
                        <span>{item.location}</span>
                        {item.responsiblePersonName && (
                          <>
                            <span>•</span>
                            <span>Lead: {item.responsiblePersonName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        const nextStatus = item.status === 'completed' ? 'scheduled' : 'completed';
                        const updated = schedule.map((s) => (s.id === item.id ? { ...s, status: nextStatus as any } : s));
                        updateSchedule(updated);
                      }}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${
                        item.status === 'completed'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                          : 'bg-[var(--bg-card)] border-[var(--border-main)] text-[var(--text-muted)] hover:text-emerald-600'
                      }`}
                    >
                      {item.status === 'completed' ? 'Completed ✓' : 'Mark Complete'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 span): Vendor Arrival Checklist & Emergency Contacts */}
        <div className="space-y-6">
          {/* Vendor Arrival Checklist */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-3">
            <h3 className="font-bold font-display text-sm text-[var(--text-main)]">
              Vendor Arrival On-Site Status
            </h3>
            <div className="space-y-2">
              {vendors.map((v) => {
                const arrived = !!vendorArrivals[v.id];
                return (
                  <div
                    key={v.id}
                    onClick={() => toggleVendorArrival(v.id)}
                    className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] flex items-center justify-between text-xs cursor-pointer hover:border-violet-300 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-[var(--text-main)]">{v.name}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{v.category}</div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        arrived
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      }`}
                    >
                      {arrived ? 'Arrived On-Site' : 'En Route'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-main)] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[var(--text-main)]">
              <Shield className="w-4 h-4 text-violet-600" />
              <h3 className="font-bold font-display text-sm">Key Contacts & Facilities</h3>
            </div>
            <div className="space-y-2">
              {emergencyContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-main)] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[var(--text-main)]">{contact.name}</span>
                    <span className="text-[10px] text-violet-600 font-semibold">{contact.role}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>{contact.organization}</span>
                    <a
                      href={`tel:${contact.phone}`}
                      className="font-mono font-bold text-emerald-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{contact.phone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
