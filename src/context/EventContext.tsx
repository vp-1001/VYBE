import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventPlan, BudgetItem, TaskItem, Vendor, VendorQuotation, EventScheduleItem, AIChangeProposal, Currency, EventTheme } from '../types/event';
import { DEMO_EVENT } from '../data/seedEvent';
import { recalculateScheduleForDelay } from '../utils/eventDayLogic';

interface EventContextType {
  events: EventPlan[];
  activeEvent: EventPlan | null;
  activeEventId: string;
  currency: Currency;
  themeMode: 'light' | 'dark';
  pendingProposals: AIChangeProposal[];
  setCurrency: (c: Currency) => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  setActiveEventId: (id: string) => void;
  createEvent: (planData: Partial<EventPlan>) => EventPlan;
  updateEvent: (id: string, updates: Partial<EventPlan>) => void;
  deleteEvent: (id: string) => void;
  // Budget operations
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  // Task operations
  addTask: (task: Omit<TaskItem, 'id'>) => void;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  // Vendor operations
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  addVendorQuotation: (vendorId: string, quote: Omit<VendorQuotation, 'id' | 'vendorId'>) => void;
  // Schedule operations
  updateSchedule: (schedule: EventScheduleItem[]) => void;
  handleScheduleIncident: (keyword: string, delayMinutes: number) => { impactedCount: number; summary: string[] };
  // Collaboration
  votePoll: (pollId: string, optionId: string) => void;
  createPoll: (question: string, options: string[]) => void;
  addCollaborator: (name: string, email: string, role: any) => void;
  // Theme
  setEventTheme: (theme: EventTheme) => void;
  // AI Copilot Proposals
  addProposal: (proposal: AIChangeProposal) => void;
  applyProposal: (proposalId: string) => void;
  rejectProposal: (proposalId: string) => void;
  resetToDemo: () => void;
}

const STORAGE_KEY = 'vybe_ai_events_v1';
const SETTINGS_KEY = 'vybe_ai_settings_v1';

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventPlan[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load stored events', e);
    }
    return [DEMO_EVENT];
  });

  const [activeEventId, setActiveEventId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.activeEventId) return parsed.activeEventId;
      }
    } catch {}
    return events[0]?.id || DEMO_EVENT.id;
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.currency) return parsed.currency;
      }
    } catch {}
    return 'INR';
  });

  const [themeMode, setThemeModeState] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.themeMode) return parsed.themeMode;
      }
    } catch {}
    return 'light';
  });

  const [pendingProposals, setPendingProposals] = useState<AIChangeProposal[]>([]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (err) {
      console.error('LocalStorage write error', err);
    }
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({ currency, themeMode, activeEventId }));
      if (themeMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [currency, themeMode, activeEventId]);

  const setCurrency = (c: Currency) => setCurrencyState(c);
  const setThemeMode = (mode: 'light' | 'dark') => setThemeModeState(mode);

  const activeEvent = events.find((e) => e.id === activeEventId) || events[0] || null;

  const createEvent = (planData: Partial<EventPlan>): EventPlan => {
    const newId = `evt-${Date.now()}`;
    const newEvent: EventPlan = {
      ...DEMO_EVENT,
      ...planData,
      id: newId,
      isDemo: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev]);
    setActiveEventId(newId);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<EventPlan>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      if (filtered.length === 0) {
        // preserve demo if empty
        return [DEMO_EVENT];
      }
      return filtered;
    });
    if (activeEventId === id) {
      const remaining = events.filter((e) => e.id !== id);
      setActiveEventId(remaining[0]?.id || DEMO_EVENT.id);
    }
  };

  const addBudgetItem = (item: Omit<BudgetItem, 'id'>) => {
    if (!activeEvent) return;
    const newItem: BudgetItem = {
      ...item,
      id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    updateEvent(activeEvent.id, {
      budget: [...activeEvent.budget, newItem],
    });
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, {
      budget: activeEvent.budget.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    });
  };

  const deleteBudgetItem = (id: string) => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, {
      budget: activeEvent.budget.filter((b) => b.id !== id),
    });
  };

  const addTask = (task: Omit<TaskItem, 'id'>) => {
    if (!activeEvent) return;
    const newTask: TaskItem = {
      ...task,
      id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    updateEvent(activeEvent.id, {
      tasks: [...activeEvent.tasks, newTask],
    });
  };

  const updateTask = (id: string, updates: Partial<TaskItem>) => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, {
      tasks: activeEvent.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    });
  };

  const deleteTask = (id: string) => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, {
      tasks: activeEvent.tasks.filter((t) => t.id !== id),
    });
  };

  const addVendor = (vendor: Omit<Vendor, 'id'>) => {
    if (!activeEvent) return;
    const newVendor: Vendor = {
      ...vendor,
      id: `v-${Date.now()}`,
    };
    updateEvent(activeEvent.id, {
      vendors: [...activeEvent.vendors, newVendor],
    });
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, {
      vendors: activeEvent.vendors.map((v) => (v.id === id ? { ...v, ...updates } : v)),
    });
  };

  const deleteVendor = (id: string) => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, {
      vendors: activeEvent.vendors.filter((v) => v.id !== id),
    });
  };

  const addVendorQuotation = (vendorId: string, quote: Omit<VendorQuotation, 'id' | 'vendorId'>) => {
    if (!activeEvent) return;
    const newQuote: VendorQuotation = {
      ...quote,
      id: `q-${Date.now()}`,
      vendorId,
    };
    updateEvent(activeEvent.id, {
      vendors: activeEvent.vendors.map((v) =>
        v.id === vendorId ? { ...v, quotations: [...v.quotations, newQuote] } : v
      ),
    });
  };

  const updateSchedule = (schedule: EventScheduleItem[]) => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, { schedule });
  };

  const handleScheduleIncident = (keyword: string, delayMinutes: number) => {
    if (!activeEvent) return { impactedCount: 0, summary: [] };
    const result = recalculateScheduleForDelay(activeEvent.schedule, keyword, delayMinutes);
    if (result.impactedItemIds.length > 0) {
      updateSchedule(result.proposedSchedule);
    }
    return {
      impactedCount: result.impactedItemIds.length,
      summary: result.affectedSummary,
    };
  };

  const votePoll = (pollId: string, optionId: string) => {
    if (!activeEvent) return;
    const currentUserId = activeEvent.collaborators.find((c) => c.isCurrentUser)?.id || 'c1';
    updateEvent(activeEvent.id, {
      polls: activeEvent.polls.map((p) => {
        if (p.id !== pollId) return p;
        return {
          ...p,
          options: p.options.map((opt) => {
            const hasVoted = opt.votes.includes(currentUserId);
            if (opt.id === optionId) {
              return {
                ...opt,
                votes: hasVoted ? opt.votes.filter((uid) => uid !== currentUserId) : [...opt.votes, currentUserId],
              };
            } else {
              // Single vote per poll: remove vote from other options
              return {
                ...opt,
                votes: opt.votes.filter((uid) => uid !== currentUserId),
              };
            }
          }),
        };
      }),
    });
  };

  const createPoll = (question: string, options: string[]) => {
    if (!activeEvent) return;
    const currentUser = activeEvent.collaborators.find((c) => c.isCurrentUser);
    const newPoll = {
      id: `poll-${Date.now()}`,
      question,
      creatorId: currentUser?.id || 'c1',
      creatorName: currentUser?.name || 'Lead Organizer',
      createdAt: new Date().toISOString().split('T')[0],
      status: 'open' as const,
      options: options.map((optText, idx) => ({
        id: `opt-${idx + 1}`,
        text: optText,
        votes: [],
      })),
    };
    updateEvent(activeEvent.id, {
      polls: [newPoll, ...activeEvent.polls],
    });
  };

  const addCollaborator = (name: string, email: string, role: any) => {
    if (!activeEvent) return;
    const newCollab = {
      id: `collab-${Date.now()}`,
      name,
      email,
      role,
    };
    updateEvent(activeEvent.id, {
      collaborators: [...activeEvent.collaborators, newCollab],
    });
  };

  const setEventTheme = (theme: EventTheme) => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, { theme });
  };

  const addProposal = (proposal: AIChangeProposal) => {
    setPendingProposals((prev) => [proposal, ...prev]);
  };

  const applyProposal = (proposalId: string) => {
    const proposal = pendingProposals.find((p) => p.id === proposalId);
    if (!proposal || !activeEvent) return;

    const changes = proposal.proposedChanges;
    let updatedBudget = [...activeEvent.budget];
    let updatedSchedule = [...activeEvent.schedule];
    let updatedTasks = [...activeEvent.tasks];
    let updatedTheme = { ...activeEvent.theme };

    // Apply budget adjustments
    if (changes.budgetAdjustments && changes.budgetAdjustments.length > 0) {
      for (const adj of changes.budgetAdjustments) {
        const itemIdx = updatedBudget.findIndex((b) => b.category.toLowerCase() === adj.category.toLowerCase());
        if (itemIdx !== -1) {
          updatedBudget[itemIdx] = {
            ...updatedBudget[itemIdx],
            estimatedCost: adj.newAmount,
          };
        } else {
          updatedBudget.push({
            id: `b-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            category: adj.category,
            name: `${adj.category} Allocation`,
            estimatedCost: adj.newAmount,
            actualCost: 0,
            priority: 'nice-to-have',
          });
        }
      }
    }

    // Apply schedule shifts
    if (changes.scheduleShifts && changes.scheduleShifts.length > 0) {
      for (const shift of changes.scheduleShifts) {
        updatedSchedule = updatedSchedule.map((s) => {
          if (s.id === shift.itemId) {
            return {
              ...s,
              startTime: shift.newStartTime,
              endTime: shift.newEndTime,
              status: 'delayed' as const,
              notes: `${s.notes ? s.notes + ' ' : ''}[AI Shift: ${shift.reason}]`,
            };
          }
          return s;
        });
      }
    }

    // Apply tasks to add
    if (changes.tasksToAdd && changes.tasksToAdd.length > 0) {
      for (const task of changes.tasksToAdd) {
        updatedTasks.push({
          id: `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: task.title || 'New AI Scheduled Task',
          category: task.category || 'Planning',
          dueDate: task.dueDate || new Date().toISOString().split('T')[0],
          priority: task.priority || 'medium',
          status: 'pending',
          dependencies: task.dependencies || [],
          estimatedDurationHours: task.estimatedDurationHours || 4,
        });
      }
    }

    // Apply theme updates
    if (changes.themeUpdate) {
      updatedTheme = {
        ...updatedTheme,
        ...changes.themeUpdate,
      };
    }

    updateEvent(activeEvent.id, {
      budget: updatedBudget,
      schedule: updatedSchedule,
      tasks: updatedTasks,
      theme: updatedTheme,
    });

    setPendingProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'applied' as const } : p))
    );
  };

  const rejectProposal = (proposalId: string) => {
    setPendingProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'rejected' as const } : p))
    );
  };

  const resetToDemo = () => {
    setEvents([DEMO_EVENT]);
    setActiveEventId(DEMO_EVENT.id);
    setPendingProposals([]);
  };

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        activeEventId,
        currency,
        themeMode,
        pendingProposals,
        setCurrency,
        setThemeMode,
        setActiveEventId,
        createEvent,
        updateEvent,
        deleteEvent,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addTask,
        updateTask,
        deleteTask,
        addVendor,
        updateVendor,
        deleteVendor,
        addVendorQuotation,
        updateSchedule,
        handleScheduleIncident,
        votePoll,
        createPoll,
        addCollaborator,
        setEventTheme,
        addProposal,
        applyProposal,
        rejectProposal,
        resetToDemo,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
