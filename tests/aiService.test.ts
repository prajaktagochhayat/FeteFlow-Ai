import { describe, it, expect } from 'vitest';
import { clientAiService } from '../src/services/aiService';
import { EventWizardInput, EventPlan } from '../src/types';

describe('ClientEventPlanningService (In-Browser GenAI Orchestrator)', () => {
  const sampleInput: EventWizardInput = {
    eventType: 'wedding',
    eventName: 'Pooja & Rohan Grand Wedding',
    date: '2026-11-20',
    location: 'Jaipur Palace, Rajasthan',
    guestCount: 200,
    setting: 'indoor',
    duration: '2 Days',
    budgetAmount: 1200000,
    currency: 'INR',
    budgetFlexibility: 'Moderate',
    stylePreference: 'Royal Rajputana Glamour',
    colorPreference: 'Emerald & Gold',
    foodPreference: 'Traditional Rajasthani & Continental',
    accessibilityNeeds: 'Wheelchair access required',
    priorities: ['Venue & Architecture', 'Catering & Dining', 'Photography & Cinema'],
    atmosphereDescription: 'Warm, regal, candlelit banquet',
  };

  it('correctly reports AI provider status', () => {
    const status = clientAiService.getStatus();
    expect(status).toHaveProperty('isConfigured');
    expect(status).toHaveProperty('model');
    expect(status).toHaveProperty('provider');
    expect(['gemini', 'fallback']).toContain(status.provider);
  });

  it('generates a complete, structured celebration plan with valid allocations', async () => {
    const result = await clientAiService.generateFullEventPlan(sampleInput);
    expect(result).toBeDefined();
    expect(result.plan).toBeDefined();
    expect(result.plan.name).toBe(sampleInput.eventName);
    expect(result.plan.eventType).toBe(sampleInput.eventType);

    // Concept & theme
    expect(result.plan.eventConcept).toBeDefined();
    expect(result.plan.eventConcept.title).toBeTruthy();
    expect(result.plan.eventConcept.colorPalette.length).toBeGreaterThanOrEqual(3);

    // Budget integrity
    expect(result.plan.budget.totalBudget).toBe(1200000);
    expect(result.plan.budget.allocations.length).toBeGreaterThanOrEqual(4);
    const sumAllocated = result.plan.budget.allocations.reduce((sum, a) => sum + a.amount, 0);
    expect(sumAllocated).toBeGreaterThan(0);

    // Milestones & checklists
    expect(result.plan.timeline.length).toBeGreaterThanOrEqual(4);
    expect(result.plan.vendorChecklist.length).toBeGreaterThanOrEqual(3);
    expect(result.plan.personalizedIdeas.length).toBeGreaterThanOrEqual(2);
  });

  it('optimizes and reallocates budget based on user instruction while preserving total ceiling', async () => {
    const { plan } = await clientAiService.generateFullEventPlan(sampleInput);
    const result = await clientAiService.optimizeBudget(plan, 'Reallocate 100000 from decor to photography');
    
    expect(result).toBeDefined();
    expect(result.newAllocations.length).toBeGreaterThan(0);
    expect(result.explanation).toBeTruthy();

    const newTotal = result.newAllocations.reduce((sum, a) => sum + a.amount, 0);
    expect(Math.abs(newTotal - plan.budget.totalBudget)).toBeLessThanOrEqual(plan.budget.totalBudget * 0.05);
  });

  it('diagnoses timeline bottlenecks and generates recovery actions', async () => {
    const { plan } = await clientAiService.generateFullEventPlan(sampleInput);
    const overdue = plan.timeline.slice(0, 2);
    const result = await clientAiService.generateTimelineRecovery(plan, overdue);

    expect(result).toBeDefined();
    expect(result.recoveryActions.length).toBeGreaterThan(0);
    expect(result.updatedTimeline.length).toBe(plan.timeline.length);
  });

  it('generates vendor briefs with probing questions and price ranges', async () => {
    const { plan } = await clientAiService.generateFullEventPlan(sampleInput);
    const result = await clientAiService.generateVendorBrief(plan, 'Catering');

    expect(result).toBeDefined();
    expect(result.briefMarkdown.toLowerCase()).toContain('catering');
    expect(result.questionsToAsk.length).toBeGreaterThan(0);
    expect(result.estimatedRange).toBeTruthy();
  });

  it('generates diverse multi-tone invitation copies', async () => {
    const { plan } = await clientAiService.generateFullEventPlan(sampleInput);
    const result = await clientAiService.generateInvitationCopy(plan);

    expect(result).toBeDefined();
    expect(result.formal).toBeTruthy();
    expect(result.playful).toBeTruthy();
    expect(result.elegant).toBeTruthy();
    expect(result.minimal).toBeTruthy();
  });
});
