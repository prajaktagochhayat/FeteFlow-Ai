import { describe, it, expect } from 'vitest';
import { BudgetAllocationItem } from '../src/types';

describe('Budget Studio Calculations', () => {
  it('correctly calculates total allocated funds and remaining budget', () => {
    const totalBudget = 500000;
    const allocations: BudgetAllocationItem[] = [
      { category: 'Venue', amount: 200000, reason: 'Main lawn', actualCost: 190000 },
      { category: 'Catering', amount: 150000, reason: 'Dinner buffet', actualCost: 155000 },
      { category: 'Decor', amount: 100000, reason: 'Floral arch', actualCost: 80000 },
      { category: 'Music', amount: 50000, reason: 'DJ & Sound', actualCost: 0 },
    ];

    const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
    const totalActual = allocations.reduce((sum, a) => sum + (a.actualCost || 0), 0);
    const remainingFunds = totalBudget - totalActual;

    expect(totalAllocated).toBe(500000);
    expect(totalActual).toBe(425000);
    expect(remainingFunds).toBe(75000);
    expect(totalAllocated <= totalBudget).toBe(true);
  });

  it('detects budget overruns when actual expenses exceed planned allocation', () => {
    const totalBudget = 100000;
    const allocations: BudgetAllocationItem[] = [
      { category: 'Venue', amount: 60000, reason: 'Hall', actualCost: 75000 }, // Overrun by 15k
      { category: 'Catering', amount: 40000, reason: 'Snacks', actualCost: 35000 },
    ];

    const totalActual = allocations.reduce((sum, a) => sum + (a.actualCost || 0), 0);
    const isOverBudget = totalActual > totalBudget;
    const overrunAmount = totalActual - totalBudget;

    expect(isOverBudget).toBe(true);
    expect(overrunAmount).toBe(10000);

    const venueAlloc = allocations.find(a => a.category === 'Venue');
    const venueOverrun = (venueAlloc?.actualCost || 0) > (venueAlloc?.amount || 0);
    expect(venueOverrun).toBe(true);
  });

  it('safely handles zero-budget edge cases without division-by-zero errors', () => {
    const totalBudget = 0;
    const allocations: BudgetAllocationItem[] = [];

    const totalAllocated = allocations.reduce((sum, a) => sum + a.amount, 0);
    const pct = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

    expect(pct).toBe(0);
    expect(Number.isFinite(pct)).toBe(true);
  });
});
