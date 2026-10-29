import { describe, it, expect } from 'vitest';
import { clientAiService } from '../../src/services/aiService';
import { EventPlan, EventWizardInput } from '../../src/types';

describe('End-to-End User Celebration Planning Journey Integration', () => {
  it('successfully transitions from Step 1 wizard input to fully populated celebration workspace', async () => {
    // 1. User inputs event criteria
    const input: EventWizardInput = {
      eventType: 'birthday',
      eventName: 'Aarav 30th Milestone Fiesta',
      date: '2026-11-25',
      location: 'Goa Beach Resort',
      guestCount: 60,
      setting: 'outdoor',
      duration: '1 Day',
      budgetAmount: 350000,
      currency: 'INR',
      budgetFlexibility: 'Flexible',
      stylePreference: 'Tropical Boho Sunset',
      colorPreference: 'Sunset Coral, Turquoise, Gold',
      foodPreference: 'Coastal Barbecue & Craft Cocktails',
      accessibilityNeeds: 'Level pathway from cabanas',
      priorities: ['Music & DJ', 'Beverages & Cocktails', 'Photography'],
      atmosphereDescription: 'Relaxed beach party transitioning into high-energy dancing under bistro lights',
    };

    // 2. AI Generates Complete Plan
    const { plan, provider } = await clientAiService.generateFullEventPlan(input);
    expect(plan).toBeDefined();
    expect(plan.name).toBe(input.eventName);
    expect(plan.budget.totalBudget).toBe(350000);
    expect(['gemini', 'fallback']).toContain(provider);

    // 3. User simulates adding guests
    const updatedPlan: EventPlan = {
      ...plan,
      guests: [
        { id: 'g1', name: 'Kabir Mehta', email: 'kabir@example.com', rsvpStatus: 'attending', dietaryNotes: 'Vegetarian' },
        { id: 'g2', name: 'Simran Roy', email: 'simran@example.com', rsvpStatus: 'attending', dietaryNotes: 'Vegan' },
        { id: 'g3', name: 'Zoya Khan', email: 'zoya@example.com', rsvpStatus: 'pending' },
      ],
    };
    expect(updatedPlan.guests?.length).toBe(3);
    expect((updatedPlan.guests || []).filter(g => g.rsvpStatus === 'attending').length).toBe(2);

    // 4. User simulates milestone completion
    const firstTask = updatedPlan.timeline[0];
    const completedTimeline = updatedPlan.timeline.map((t, idx) => idx === 0 ? { ...t, completed: true } : t);
    expect(completedTimeline[0].completed).toBe(true);

    // 5. User requests dynamic vendor brief
    const brief = await clientAiService.generateVendorBrief(updatedPlan, 'Music & Entertainment');
    expect(brief.briefMarkdown).toBeTruthy();
    expect(brief.questionsToAsk.length).toBeGreaterThan(0);

    // 6. User generates invitation copy
    const invites = await clientAiService.generateInvitationCopy(updatedPlan);
    expect(invites.playful).toBeTruthy();
    expect(invites.playful.length).toBeGreaterThan(20);
  });
});
