import { z } from 'zod';

export const EventConceptSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  theme: z.string(),
  style: z.string(),
  colorPalette: z.array(z.string()).default([]),
  creativeDirection: z.string(),
});

export const BudgetAllocationItemSchema = z.object({
  category: z.string(),
  amount: z.number().nonnegative(),
  reason: z.string(),
  actualCost: z.number().optional().default(0),
});

export const BudgetSchema = z.object({
  currency: z.string().default('INR'),
  totalBudget: z.number().nonnegative(),
  allocations: z.array(BudgetAllocationItemSchema).default([]),
});

export const TimelineMilestoneSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional().default(''),
  dueDate: z.string(), // ISO-8601 or YYYY-MM-DD
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.string().optional().default('General'),
  completed: z.boolean().optional().default(false),
});

export const VendorChecklistSchema = z.object({
  id: z.string().optional(),
  category: z.string(),
  tasks: z.array(z.string()).default([]),
  questionsToAsk: z.array(z.string()).default([]),
  status: z.enum(['researching', 'quote_received', 'negotiating', 'confirmed']).default('researching'),
  notes: z.string().optional().default(''),
  quotedAmount: z.number().optional().default(0),
});

export const PersonalizedIdeaSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  estimatedCost: z.number().optional().default(0),
  reason: z.string().optional().default(''),
  isFavorite: z.boolean().optional().default(false),
});

export const RiskSchema = z.object({
  description: z.string(),
  mitigation: z.string(),
});

export const GuestSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Guest name is required'),
  email: z.string().email().optional().or(z.literal('')),
  rsvpStatus: z.enum(['attending', 'declined', 'pending']).default('pending'),
  dietaryNotes: z.string().optional().default(''),
  accessibilityNeeds: z.string().optional().default(''),
  tableOrGroup: z.string().optional().default(''),
});

export const EventPlanSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Event name is required'),
  eventType: z.enum([
    'wedding',
    'birthday',
    'anniversary',
    'community',
    'cultural',
    'corporate',
    'custom'
  ]),
  date: z.string(),
  location: z.string().optional().default(''),
  guestCount: z.number().int().positive().default(50),
  setting: z.enum(['indoor', 'outdoor', 'undecided']).default('undecided'),
  duration: z.string().optional().default('1 Day'),
  priorities: z.array(z.string()).default([]),
  atmosphereVision: z.string().optional().default(''),
  eventConcept: EventConceptSchema,
  budget: BudgetSchema,
  timeline: z.array(TimelineMilestoneSchema).default([]),
  vendorChecklist: z.array(VendorChecklistSchema).default([]),
  personalizedIdeas: z.array(PersonalizedIdeaSchema).default([]),
  risks: z.array(RiskSchema).default([]),
  nextActions: z.array(z.string()).default([]),
  guests: z.array(GuestSchema).optional().default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type EventPlan = z.infer<typeof EventPlanSchema>;
export type EventConcept = z.infer<typeof EventConceptSchema>;
export type BudgetAllocationItem = z.infer<typeof BudgetAllocationItemSchema>;
export type Budget = z.infer<typeof BudgetSchema>;
export type TimelineMilestone = z.infer<typeof TimelineMilestoneSchema>;
export type VendorChecklistItem = z.infer<typeof VendorChecklistSchema>;
export type PersonalizedIdea = z.infer<typeof PersonalizedIdeaSchema>;
export type Risk = z.infer<typeof RiskSchema>;
export type Guest = z.infer<typeof GuestSchema>;

// AI input schemas
export const EventWizardInputSchema = z.object({
  eventType: z.enum([
    'wedding',
    'birthday',
    'anniversary',
    'community',
    'cultural',
    'corporate',
    'custom'
  ]),
  eventName: z.string().min(1),
  date: z.string(),
  location: z.string().optional(),
  guestCount: z.number().min(1),
  setting: z.enum(['indoor', 'outdoor', 'undecided']).optional().default('undecided'),
  duration: z.string().optional(),
  budgetAmount: z.number().nonnegative(),
  currency: z.string().default('INR'),
  budgetFlexibility: z.string().optional(),
  stylePreference: z.string().optional(),
  colorPreference: z.string().optional(),
  foodPreference: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  priorities: z.array(z.string()).optional().default([]),
  atmosphereDescription: z.string().optional().default(''),
});

export type EventWizardInput = z.infer<typeof EventWizardInputSchema>;
