import { EventPlan, BudgetItem, TaskItem, EventTheme, EventScheduleItem } from '../types/event';
import { detectDependencyCycle } from './timelineLogic';

export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
  repaired: boolean;
}

/**
 * Validates and repairs AI-generated or user-submitted event plan data.
 * Guarantees that corrupted or partial AI responses never damage the app state.
 */
export function validateAndRepairEventPlan(raw: any, fallback?: Partial<EventPlan>): ValidationResult<EventPlan> {
  const errors: string[] = [];
  let repaired = false;

  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      errors: ['Plan payload must be a non-null object.'],
      repaired: false,
    };
  }

  // 1. Title validation
  let title = typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : '';
  if (!title) {
    title = fallback?.title || 'Untitled Celebration';
    repaired = true;
    errors.push('Missing plan title; assigned default title.');
  }

  // 2. Budget limit validation
  let totalBudget = Number(raw.totalBudget || raw.budgetLimit || fallback?.totalBudget);
  if (isNaN(totalBudget) || totalBudget <= 0) {
    totalBudget = 50000;
    repaired = true;
    errors.push('Invalid total budget limit; default allocated.');
  }

  // 3. Guest count validation
  let guestCount = Number(raw.guestCount || fallback?.guestCount);
  if (isNaN(guestCount) || guestCount <= 0) {
    guestCount = 100;
    repaired = true;
    errors.push('Invalid guest count; fallback applied.');
  }

  // 4. Budget items array validation & budget cap protection
  const budget: BudgetItem[] = [];
  if (Array.isArray(raw.budget)) {
    for (let i = 0; i < raw.budget.length; i++) {
      const b = raw.budget[i];
      if (b && typeof b === 'object') {
        const estCost = Math.max(0, Number(b.estimatedCost) || 0);
        budget.push({
          id: b.id || `b-${Date.now()}-${i}`,
          category: String(b.category || 'General').trim(),
          name: String(b.name || `${b.category || 'Line'} Item`).trim(),
          estimatedCost: estCost,
          actualCost: Math.max(0, Number(b.actualCost) || 0),
          isPaid: Boolean(b.isPaid),
          priority: ['must-have', 'nice-to-have', 'optional'].includes(b.priority) ? b.priority : 'nice-to-have',
          notes: typeof b.notes === 'string' ? b.notes : undefined,
        });
      }
    }
  }

  if (budget.length === 0) {
    // Generate minimal safe budget items if empty
    budget.push(
      { id: 'b1', category: 'Venue', name: 'Venue & Facilities', estimatedCost: Math.round(totalBudget * 0.3), actualCost: 0, priority: 'must-have' },
      { id: 'b2', category: 'Catering', name: 'Food & Beverage', estimatedCost: Math.round(totalBudget * 0.45), actualCost: 0, priority: 'must-have' },
      { id: 'b3', category: 'Decorations', name: 'Decor & Theme Styling', estimatedCost: Math.round(totalBudget * 0.15), actualCost: 0, priority: 'nice-to-have' },
      { id: 'b4', category: 'Contingency', name: 'Contingency Reserve', estimatedCost: Math.round(totalBudget * 0.1), actualCost: 0, priority: 'optional' }
    );
    repaired = true;
    errors.push('Empty budget list repaired with standard allocation.');
  }

  // Ensure total allocated does not exceed total budget cap
  const currentSum = budget.reduce((acc, item) => acc + item.estimatedCost, 0);
  if (currentSum > totalBudget) {
    const scaleFactor = totalBudget / currentSum;
    budget.forEach((item) => {
      item.estimatedCost = Math.round(item.estimatedCost * scaleFactor);
    });
    repaired = true;
    errors.push(`AI budget sum exceeded total limit (${currentSum} > ${totalBudget}); deterministically rescaled.`);
  }

  // 5. Tasks array & DAG cycle validation
  const tasks: TaskItem[] = [];
  if (Array.isArray(raw.tasks)) {
    for (let i = 0; i < raw.tasks.length; i++) {
      const t = raw.tasks[i];
      if (t && typeof t === 'object' && t.title) {
        tasks.push({
          id: t.id || `t-${Date.now()}-${i}`,
          title: String(t.title).trim(),
          category: String(t.category || 'Planning').trim(),
          dueDate: t.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate) ? t.dueDate : (fallback?.date || '2026-11-20'),
          priority: ['low', 'medium', 'high', 'urgent'].includes(t.priority) ? t.priority : 'medium',
          status: ['pending', 'in_progress', 'completed', 'blocked'].includes(t.status) ? t.status : 'pending',
          dependencies: Array.isArray(t.dependencies) ? t.dependencies.filter((d: any) => typeof d === 'string') : [],
          assigneeName: typeof t.assigneeName === 'string' ? t.assigneeName : undefined,
          estimatedDurationHours: Number(t.estimatedDurationHours) || 4,
        });
      }
    }
  }

  // Check DAG cycles in task dependencies
  const cycleResult = detectDependencyCycle(tasks);
  if (cycleResult.hasCycle) {
    // Break cycle by clearing invalid back-edges
    tasks.forEach((t) => {
      if (cycleResult.cycleNodes?.includes(t.id)) {
        t.dependencies = [];
      }
    });
    repaired = true;
    errors.push(`Detected circular dependency in tasks (${cycleResult.message}); safely removed cycle links.`);
  }

  // 6. Theme validation
  const rawTheme = raw.theme || {};
  const validHexRegex = /^#([0-9A-F]{3}){1,2}$/i;
  let colors: string[] = Array.isArray(rawTheme.colors)
    ? rawTheme.colors.filter((c: any) => typeof c === 'string' && validHexRegex.test(c))
    : [];

  if (colors.length < 3) {
    colors = ['#7F1D1D', '#D4AF37', '#FAF8F5', '#22212A', '#A78BFA'];
    repaired = true;
    errors.push('Incomplete theme palette; supplemented with cohesive fallback palette.');
  }

  const theme: EventTheme = {
    id: rawTheme.id || `theme-${Date.now()}`,
    name: String(rawTheme.name || 'Bespoke Celebration Theme').trim(),
    vibe: String(rawTheme.vibe || 'Modern Elegance').trim(),
    tagline: String(rawTheme.tagline || 'Curated aesthetics & celebration atmosphere').trim(),
    description: String(rawTheme.description || 'Thoughtfully orchestrated ambience tailored to the event vision.').trim(),
    colors,
    decorElements: Array.isArray(rawTheme.decorElements) && rawTheme.decorElements.length > 0
      ? rawTheme.decorElements.map(String)
      : ['Ambient uplighting', 'Custom stage backdrop', 'Floral entryway arch', 'Interactive photo area'],
    musicMood: String(rawTheme.musicMood || 'Celebratory acoustic lounge transitioning into upbeat evening sets'),
    lightingStyle: String(rawTheme.lightingStyle || 'Warm ambient wash with focused spotlighting'),
    dressCodePrompt: String(rawTheme.dressCodePrompt || 'Smart festive / semi-formal chic'),
    referenceImage: typeof rawTheme.referenceImage === 'string' ? rawTheme.referenceImage : undefined,
  };

  // 7. Schedule validation
  const schedule: EventScheduleItem[] = [];
  if (Array.isArray(raw.schedule)) {
    for (let i = 0; i < raw.schedule.length; i++) {
      const s = raw.schedule[i];
      if (s && typeof s === 'object' && s.activity) {
        schedule.push({
          id: s.id || `s-${Date.now()}-${i}`,
          startTime: typeof s.startTime === 'string' ? s.startTime : '16:00',
          endTime: typeof s.endTime === 'string' ? s.endTime : '17:00',
          activity: String(s.activity).trim(),
          location: String(s.location || 'Main Venue').trim(),
          responsiblePersonName: typeof s.responsiblePersonName === 'string' ? s.responsiblePersonName : undefined,
          status: ['scheduled', 'active', 'completed', 'delayed'].includes(s.status) ? s.status : 'scheduled',
          notes: typeof s.notes === 'string' ? s.notes : undefined,
        });
      }
    }
  }

  const validatedPlan: EventPlan = {
    id: raw.id || `evt-${Date.now()}`,
    title,
    tagline: typeof raw.tagline === 'string' ? raw.tagline : 'Your Vision. Your People. Your Moment.',
    eventType: ['wedding', 'birthday', 'college', 'community', 'corporate', 'cultural', 'other'].includes(raw.eventType)
      ? raw.eventType
      : 'college',
    conceptDescription: typeof raw.conceptDescription === 'string' && raw.conceptDescription.trim()
      ? raw.conceptDescription.trim()
      : 'A carefully curated celebration designed to bring people together in a memorable environment.',
    date: raw.date && /^\d{4}-\d{2}-\d{2}$/.test(raw.date) ? raw.date : '2026-11-28',
    time: typeof raw.time === 'string' ? raw.time : '16:00',
    location: typeof raw.location === 'string' && raw.location.trim() ? raw.location.trim() : 'Kolkata, WB',
    venueName: typeof raw.venueName === 'string' ? raw.venueName : undefined,
    guestCount,
    currency: ['INR', 'USD', 'EUR', 'GBP'].includes(raw.currency) ? raw.currency : 'INR',
    totalBudget,
    contingencyReservePercentage: Number(raw.contingencyReservePercentage) || 6,
    theme,
    budget,
    tasks,
    schedule,
    vendors: Array.isArray(raw.vendors) ? raw.vendors : [],
    collaborators: Array.isArray(raw.collaborators) ? raw.collaborators : [],
    polls: Array.isArray(raw.polls) ? raw.polls : [],
    risks: Array.isArray(raw.risks) ? raw.risks : [],
    emergencyContacts: Array.isArray(raw.emergencyContacts) ? raw.emergencyContacts : [],
    activities: Array.isArray(raw.activities) ? raw.activities : [],
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isDemo: Boolean(raw.isDemo),
  };

  return {
    isValid: true,
    data: validatedPlan,
    errors,
    repaired,
  };
}
