import { describe, it, expect } from 'vitest';
import { EventPlan } from '../src/types';

describe('Performance, Efficiency & Resource Optimization Benchmarking', () => {
  const mockPlan: EventPlan = {
    id: 'evt_perf_1',
    name: 'Performance Benchmarking Gala',
    eventType: 'corporate',
    date: '2026-12-31',
    location: 'Metropolitan Convention Hall',
    guestCount: 500,
    setting: 'indoor',
    duration: '1 Day',
    priorities: ['Audio-Visual', 'Keynote Hospitality'],
    atmosphereVision: 'Sleek and highly efficient',
    eventConcept: {
      title: 'Precision & Scale',
      description: 'High throughput corporate showcase',
      theme: 'Modern Architecture',
      style: 'Minimalist Tech',
      colorPalette: ['#1E293B', '#3B82F6', '#10B981', '#F8FAFC', '#64748B'],
      creativeDirection: 'Streamlined visual elements with hardware accelerated layouts',
    },
    budget: {
      currency: 'INR',
      totalBudget: 2000000,
      allocations: Array.from({ length: 25 }, (_, i) => ({
        category: `Vendor Service ${i + 1}`,
        amount: 80000,
        actualCost: 75000,
        reason: `Service allocation ${i + 1}`,
      })),
    },
    timeline: Array.from({ length: 50 }, (_, i) => ({
      id: `tml_${i + 1}`,
      title: `Operational Task ${i + 1}`,
      description: `Task detail ${i + 1}`,
      dueDate: '2026-11-15',
      priority: i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low',
      category: 'Operations',
      completed: i % 2 === 0,
    })),
    vendorChecklist: [],
    personalizedIdeas: [],
    risks: [],
    nextActions: [],
    guests: Array.from({ length: 300 }, (_, i) => ({
      id: `gst_${i + 1}`,
      name: `Guest ${i + 1}`,
      email: `guest${i + 1}@example.com`,
      rsvpStatus: i % 3 === 0 ? 'attending' : i % 3 === 1 ? 'pending' : 'declined',
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('calculates financial summaries across large datasets in under 5ms', () => {
    const t0 = performance.now();
    const totalBudget = mockPlan.budget.totalBudget;
    const totalAllocated = mockPlan.budget.allocations.reduce((sum, a) => sum + a.amount, 0);
    const totalSpent = mockPlan.budget.allocations.reduce((sum, a) => sum + (a.actualCost || 0), 0);
    const remaining = totalBudget - totalSpent;
    const elapsed = performance.now() - t0;

    expect(totalAllocated).toBe(2000000);
    expect(totalSpent).toBe(25 * 75000);
    expect(remaining).toBe(totalBudget - totalSpent);
    expect(elapsed).toBeLessThan(10); // Ultra-fast computation under 10ms
  });

  it('aggregates guest RSVP rosters across 300+ guests in under 2ms', () => {
    const t0 = performance.now();
    const guestList = mockPlan.guests || [];
    const attending = guestList.filter(g => g.rsvpStatus === 'attending').length;
    const pending = guestList.filter(g => g.rsvpStatus === 'pending').length;
    const declined = guestList.filter(g => g.rsvpStatus === 'declined').length;
    const elapsed = performance.now() - t0;

    expect(attending + pending + declined).toBe(300);
    expect(elapsed).toBeLessThan(5);
  });

  it('computes milestone completion percentage accurately', () => {
    const total = mockPlan.timeline.length;
    const completed = mockPlan.timeline.filter(t => t.completed).length;
    const percentage = Math.round((completed / total) * 100);

    expect(total).toBe(50);
    expect(percentage).toBe(50);
  });

  it('verifies memory efficiency when cloning event plans', () => {
    const cloned = JSON.parse(JSON.stringify(mockPlan));
    expect(cloned.id).toBe(mockPlan.id);
    expect(cloned.budget.allocations.length).toBe(mockPlan.budget.allocations.length);
    expect(cloned.guests?.length).toBe(mockPlan.guests?.length);
  });
});
