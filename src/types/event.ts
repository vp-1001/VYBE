export type EventType =
  | 'wedding'
  | 'birthday'
  | 'college'
  | 'community'
  | 'corporate'
  | 'cultural'
  | 'other';

export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
}

export interface EventTheme {
  id: string;
  name: string;
  vibe: string;
  tagline: string;
  description: string;
  colors: string[];
  decorElements: string[];
  musicMood: string;
  lightingStyle: string;
  dressCodePrompt: string;
  referenceImage?: string;
}

export interface BudgetItem {
  id: string;
  category: string; // e.g. 'Venue', 'Catering', 'Decorations', 'Photography', 'Entertainment', 'Invitations', 'Transport', 'Contingency'
  name: string;
  estimatedCost: number;
  actualCost: number;
  isPaid?: boolean;
  notes?: string;
  priority?: 'must-have' | 'nice-to-have' | 'optional';
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  dueDate: string; // YYYY-MM-DD
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assigneeId?: string;
  assigneeName?: string;
  estimatedDurationHours?: number;
  dependencies: string[]; // task IDs that must be completed first
  isCriticalPath?: boolean;
  delayedByHours?: number;
}

export interface VendorQuotation {
  id: string;
  vendorId: string;
  basePrice: number;
  taxes: number;
  transportationFee: number;
  setupFee: number;
  includedServices: string[];
  additionalCharges: number;
  notes?: string;
  status: 'draft' | 'submitted' | 'shortlisted' | 'accepted' | 'declined';
  validUntil?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: 'Venue' | 'Catering' | 'Photography' | 'Decorations' | 'Entertainment' | 'Transportation' | 'Equipment' | 'Other';
  location: string;
  contactPerson: string;
  email: string;
  phone: string;
  rating?: number;
  isVerifiedDemo?: boolean;
  notes?: string;
  quotations: VendorQuotation[];
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'Event Owner' | 'Finance Coordinator' | 'Decoration Coordinator' | 'Food Coordinator' | 'Logistics Coordinator' | 'Viewer';
  isCurrentUser?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: string[]; // collaborator IDs
}

export interface Poll {
  id: string;
  question: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  options: PollOption[];
  status: 'open' | 'closed';
  selectedOptionId?: string;
}

export interface EventScheduleItem {
  id: string;
  startTime: string; // "14:00"
  endTime: string;   // "15:00"
  activity: string;
  location: string;
  responsiblePersonId?: string;
  responsiblePersonName?: string;
  status: 'scheduled' | 'active' | 'completed' | 'delayed';
  originalStartTime?: string;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  role: string;
  name: string;
  phone: string;
  organization?: string;
}

export interface RiskAndContingency {
  id: string;
  risk: string;
  severity: 'low' | 'medium' | 'high';
  likelihood: 'low' | 'medium' | 'high';
  contingencyPlan: string;
  status: 'monitored' | 'triggered' | 'resolved';
}

export interface AIChangeProposal {
  id: string;
  timestamp: string;
  type: 'budget_adjustment' | 'schedule_shift' | 'add_task' | 'theme_change' | 'contingency_action' | 'general_advice';
  title: string;
  description: string;
  impactSummary: string;
  proposedChanges: {
    budgetAdjustments?: { category: string; oldAmount: number; newAmount: number }[];
    scheduleShifts?: { itemId: string; newStartTime: string; newEndTime: string; reason: string }[];
    tasksToAdd?: Partial<TaskItem>[];
    themeUpdate?: Partial<EventTheme>;
  };
  status: 'pending' | 'applied' | 'rejected';
}

export interface EventPlan {
  id: string;
  title: string;
  tagline: string;
  eventType: EventType;
  conceptDescription: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "17:00"
  location: string;
  venueName?: string;
  guestCount: number;
  currency: Currency;
  totalBudget: number;
  contingencyReservePercentage: number; // default 10%
  theme: EventTheme;
  budget: BudgetItem[];
  tasks: TaskItem[];
  schedule: EventScheduleItem[];
  vendors: Vendor[];
  collaborators: Collaborator[];
  polls: Poll[];
  risks: RiskAndContingency[];
  emergencyContacts: EmergencyContact[];
  activities: string[];
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}
