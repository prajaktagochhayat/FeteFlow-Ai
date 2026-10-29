import { describe, it, expect } from 'vitest';
import { ApiService } from '../src/services/api';
import { EventWizardInput } from '../src/types';

describe('ApiService (Hybrid Cloud & In-Browser Intelligence Layer)', () => {
  const wizardInput: EventWizardInput = {
    eventType: 'anniversary',
    eventName: 'Golden Jubilee Gala',
    date: '2026-12-10',
    location: 'Bangalore Glasshouse',
    guestCount: 120,
    setting: 'indoor',
    duration: '1 Day',
    budgetAmount: 600000,
    currency: 'INR',
    priorities: ['Catering', 'Ambiance'],
  };

  it('provides a health status endpoint with connected AI model metadata', async () => {
    const health = await ApiService.getHealth();
    expect(health).toBeDefined();
    expect(health.status).toBe('ok');
    expect(health.ai).toBeDefined();
    expect(health.ai.model).toBeTruthy();
  });

  it('generates an event plan via ApiService with fallback resiliency', async () => {
    const result = await ApiService.generatePlan(wizardInput);
    expect(result).toBeDefined();
    expect(result.plan).toBeDefined();
    expect(result.plan.name).toBe(wizardInput.eventName);
    expect(result.plan.budget.totalBudget).toBe(600000);
  });

  it('retrieves default application settings safely', async () => {
    const settings = await ApiService.getSettings();
    expect(settings).toBeDefined();
    expect(settings.defaultCurrency).toBe('INR');
    expect(settings.geminiModel).toBeTruthy();
  });
});
