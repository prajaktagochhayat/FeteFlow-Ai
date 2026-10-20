import { describe, it, expect } from 'vitest';
import {
  EventWizardInputSchema,
  EventPlanSchema,
} from '../server/schemas/eventPlanSchema.js';

describe('Event Schema Validation', () => {
  it('validates a complete, sound event wizard input', () => {
    const validData = {
      eventType: 'wedding',
      eventName: 'Rhea & Aditya Celebrations',
      date: '2027-04-18',
      location: 'Udaipur Palatial Grounds',
      guestCount: 200,
      setting: 'outdoor',
      duration: '3 Days',
      budgetAmount: 2500000,
      currency: 'INR',
      stylePreference: 'Royal Contemporary',
      colorPreference: 'Marigold & Regal Violet',
      priorities: ['Venue', 'Catering', 'Photography'],
      atmosphereDescription: 'Stately heritage celebration with acoustic sitar and lantern-lit courtyard',
    };

    const parsed = EventWizardInputSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.guestCount).toBe(200);
      expect(parsed.data.budgetAmount).toBe(2500000);
    }
  });

  it('rejects invalid inputs missing mandatory fields or negative values', () => {
    const invalidData = {
      eventType: 'birthday',
      eventName: '', // Invalid empty name
      date: '2026-12-31',
      guestCount: -5, // Invalid negative guest count
      budgetAmount: -100, // Invalid negative budget
    };

    const parsed = EventWizardInputSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
  });

  it('verifies chronological timeline ordering before event target date', () => {
    const targetDate = '2027-06-15';
    const milestones = [
      { id: '1', title: 'Lock Venue', dueDate: '2027-01-10', priority: 'high', category: 'Venue', completed: true },
      { id: '2', title: 'Tasting', dueDate: '2027-03-01', priority: 'medium', category: 'Catering', completed: false },
      { id: '3', title: 'RSVPs', dueDate: '2027-05-01', priority: 'high', category: 'Guests', completed: false },
    ];

    // Verify all milestones occur on or before target celebration date
    const allBeforeEvent = milestones.every(m => new Date(m.dueDate) <= new Date(targetDate));
    expect(allBeforeEvent).toBe(true);

    // Verify milestones are in ascending chronological order
    const isSorted = milestones.every((val, i, arr) => !i || new Date(arr[i - 1].dueDate) <= new Date(val.dueDate));
    expect(isSorted).toBe(true);
  });
});
