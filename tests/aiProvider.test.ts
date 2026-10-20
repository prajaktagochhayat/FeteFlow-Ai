import { describe, it, expect } from 'vitest';
import { EventPlanningService } from '../server/services/aiProvider.js';
import { EventWizardInput, EventPlan } from '../server/schemas/eventPlanSchema.js';

describe('AI Planning Service & Engine', () => {
  const service = new EventPlanningService();

  it('correctly reports fallback status when no API key is provided', () => {
    service.refreshConfig('');
    const status = service.getStatus();
    expect(status.isConfigured).toBe(false);
    expect(status.provider).toBe('fallback');
  });

  it('generates a full structured celebration plan using deterministic fallback engine', async () => {
    service.refreshConfig('');
    const input: EventWizardInput = {
      eventType: 'wedding',
      eventName: 'Sahana & Dev Wedding',
      date: '2027-01-20',
      location: 'Bangalore Courtyard',
      guestCount: 120,
      setting: 'outdoor',
      budgetAmount: 1200000,
      currency: 'INR',
      stylePreference: 'Modern Romantic Chic',
      priorities: ['Venue & Architecture', 'Catering & Beverages'],
      atmosphereDescription: 'Warm twilight fairy-lit garden vows',
    };

    const { plan, provider } = await service.generateFullEventPlan(input);

    expect(provider).toBe('fallback');
    expect(plan.name).toBe('Sahana & Dev Wedding');
    expect(plan.eventConcept.title).toBeDefined();
    expect(plan.eventConcept.colorPalette.length).toBeGreaterThan(0);
    expect(plan.budget.totalBudget).toBe(1200000);
    expect(plan.timeline.length).toBeGreaterThan(0);
    expect(plan.vendorChecklist.length).toBeGreaterThan(0);
    expect(plan.personalizedIdeas.length).toBeGreaterThan(0);

    // Sum of allocations should match or closely approximate total budget
    const allocatedSum = plan.budget.allocations.reduce((sum, a) => sum + a.amount, 0);
    expect(Math.abs(allocatedSum - 1200000)).toBeLessThan(5000);
  });

  it('generates a structured vendor brief for a specific category', async () => {
    service.refreshConfig('');
    const mockPlan: EventPlan = {
      name: 'Pooja’s 25th Birthday',
      eventType: 'birthday',
      date: '2026-12-15',
      location: 'Local Hall',
      guestCount: 50,
      setting: 'indoor',
      duration: '4 Hours',
      priorities: ['Catering'],
      atmosphereVision: 'Vibrant party',
      eventConcept: {
        title: 'Neon Revelry',
        description: 'Vibrant party with mocktails and neon art',
        theme: 'Cyber Glow',
        style: 'Retro Party',
        colorPalette: ['#FF7C91', '#7655E8'],
        creativeDirection: 'Vibrant and energetic',
      },
      budget: {
        currency: 'INR',
        totalBudget: 200000,
        allocations: [{ category: 'Catering', amount: 80000, reason: 'Small plates', actualCost: 0 }],
      },
      timeline: [],
      vendorChecklist: [],
      personalizedIdeas: [],
      risks: [],
      nextActions: [],
      guests: [],
    };

    const brief = await service.generateVendorBrief(mockPlan, 'Catering');
    expect(brief.briefMarkdown).toContain('VENDOR REQUEST FOR PROPOSAL');
    expect(brief.briefMarkdown).toContain('Pooja’s 25th Birthday');
    expect(brief.questionsToAsk.length).toBeGreaterThan(0);
  });

  it('optimizes budget allocations in response to specific instructions', async () => {
    service.refreshConfig('');
    const mockPlan: EventPlan = {
      name: 'Community Fair',
      eventType: 'community',
      date: '2027-03-10',
      location: 'Community Park',
      guestCount: 200,
      setting: 'outdoor',
      duration: 'All Day',
      priorities: ['Park', 'Refreshments'],
      atmosphereVision: 'Neighborhood gathering',
      eventConcept: {
        title: 'Green Gathering',
        description: 'Neighborhood celebration',
        theme: 'Eco Unity',
        style: 'Rustic',
        colorPalette: ['#10B981'],
        creativeDirection: 'Natural and welcoming',
      },
      budget: {
        currency: 'INR',
        totalBudget: 100000,
        allocations: [
          { category: 'Floral & Decor', amount: 30000, reason: 'Plants & banners', actualCost: 0 },
          { category: 'Venue & Park', amount: 40000, reason: 'Permit & stage', actualCost: 0 },
          { category: 'Refreshments', amount: 30000, reason: 'Snacks', actualCost: 0 },
        ],
      },
      timeline: [],
      vendorChecklist: [],
      personalizedIdeas: [],
      risks: [],
      nextActions: [],
      guests: [],
    };

    const result = await service.optimizeBudget(mockPlan, 'Reduce decor by 15%');
    expect(result.newAllocations.length).toBe(3);
    expect(result.explanation).toBeDefined();

    const decor = result.newAllocations.find(a => a.category.includes('Decor'));
    expect(decor?.amount).toBeLessThan(30000);
  });
});
