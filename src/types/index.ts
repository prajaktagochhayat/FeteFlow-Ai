export type EventType =
  | 'wedding'
  | 'birthday'
  | 'anniversary'
  | 'community'
  | 'cultural'
  | 'corporate'
  | 'custom';

export interface EventConcept {
  title: string;
  description: string;
  theme: string;
  style: string;
  colorPalette: string[];
  creativeDirection: string;
}

export interface BudgetAllocationItem {
  category: string;
  amount: number;
  reason: string;
  actualCost?: number;
}

export interface Budget {
  currency: string;
  totalBudget: number;
  allocations: BudgetAllocationItem[];
}

export interface TimelineMilestone {
  id?: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  completed?: boolean;
}

export interface VendorChecklistItem {
  id?: string;
  category: string;
  tasks: string[];
  questionsToAsk: string[];
  status: 'researching' | 'quote_received' | 'negotiating' | 'confirmed';
  notes?: string;
  quotedAmount?: number;
}

export interface PersonalizedIdea {
  id?: string;
  title: string;
  description: string;
  category: string;
  estimatedCost?: number;
  reason?: string;
  isFavorite?: boolean;
}

export interface Risk {
  id?: string;
  description: string;
  mitigation: string;
  severity?: 'low' | 'medium' | 'high';
}

export interface Guest {
  id: string;
  name: string;
  email?: string;
  rsvpStatus: 'attending' | 'declined' | 'pending';
  dietaryNotes?: string;
  accessibilityNeeds?: string;
  tableOrGroup?: string;
}

export interface EventPlan {
  id?: string;
  name: string;
  eventType: EventType;
  date: string;
  location?: string;
  guestCount: number;
  setting?: 'indoor' | 'outdoor' | 'undecided';
  duration?: string;
  priorities?: string[];
  atmosphereVision?: string;
  eventConcept: EventConcept;
  budget: Budget;
  timeline: TimelineMilestone[];
  vendorChecklist: VendorChecklistItem[];
  personalizedIdeas: PersonalizedIdea[];
  risks: Risk[];
  nextActions: string[];
  guests?: Guest[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EventWizardInput {
  eventType: EventType;
  eventName: string;
  date: string;
  location?: string;
  guestCount: number;
  setting?: 'indoor' | 'outdoor' | 'undecided';
  duration?: string;
  budgetAmount: number;
  currency?: string;
  budgetFlexibility?: string;
  stylePreference?: string;
  colorPreference?: string;
  foodPreference?: string;
  accessibilityNeeds?: string;
  priorities?: string[];
  atmosphereDescription?: string;
}

export interface AppSettings {
  geminiApiKey: string;
  geminiModel: string;
  defaultCurrency: string;
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  hasApiKey?: boolean;
  aiStatus?: {
    isConfigured: boolean;
    model: string;
    provider: 'gemini' | 'fallback';
  };
}

export type WorkspaceTab =
  | 'overview'
  | 'events'
  | 'ai-planner'
  | 'budget'
  | 'timeline'
  | 'vendors'
  | 'guests'
  | 'inspiration'
  | 'settings';
