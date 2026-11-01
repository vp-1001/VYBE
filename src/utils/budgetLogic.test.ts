import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBudgetMetrics, formatCurrency, proposeDeterministicRebalance } from './budgetLogic';
import { BudgetItem } from '../types/event';

test('formatCurrency formats Indian Rupees with Indian numbering system', () => {
  assert.equal(formatCurrency(80000, 'INR'), '₹80,000');
  assert.equal(formatCurrency(150000, 'INR'), '₹1,50,000');
  assert.equal(formatCurrency(1500, 'USD'), '$1,500');
});

test('calculateBudgetMetrics accurately computes utilization, cost per guest, and category breakdown', () => {
  const items: BudgetItem[] = [
    { id: '1', category: 'Venue', name: 'Auditorium Hall', estimatedCost: 20000, actualCost: 18000 },
    { id: '2', category: 'Catering', name: 'Dinner Buffet', estimatedCost: 40000, actualCost: 38000 },
    { id: '3', category: 'Decorations', name: 'Stage Floral', estimatedCost: 15000, actualCost: 16000 },
  ];

  const totalBudget = 80000;
  const guestCount = 200;
  const metrics = calculateBudgetMetrics(items, totalBudget, guestCount);

  assert.equal(metrics.plannedTotal, 75000);
  assert.equal(metrics.actualTotal, 72000);
  assert.equal(metrics.remainingPlanned, 5000);
  assert.equal(metrics.costPerGuest, 375); // 75000 / 200
  assert.equal(metrics.isOverrun, false);
  assert.equal(metrics.overrunAmount, 0);
  assert.equal(metrics.categoryBreakdown.length, 3);
  assert.equal(metrics.categoryBreakdown[0].category, 'Catering');
});

test('calculateBudgetMetrics detects budget overrun correctly', () => {
  const items: BudgetItem[] = [
    { id: '1', category: 'Venue', name: 'Grand Palace', estimatedCost: 50000, actualCost: 0 },
    { id: '2', category: 'Catering', name: 'Royal Feast', estimatedCost: 40000, actualCost: 0 },
  ];
  const totalBudget = 80000;
  const metrics = calculateBudgetMetrics(items, totalBudget, 100);

  assert.equal(metrics.isOverrun, true);
  assert.equal(metrics.overrunAmount, 10000);
  assert.equal(metrics.utilizationRate, 112.5);
});

test('proposeDeterministicRebalance offsets cost increases without breaking total budget', () => {
  const items: BudgetItem[] = [
    { id: '1', category: 'Catering', name: 'Standard Food', estimatedCost: 30000, actualCost: 0, priority: 'must-have' },
    { id: '2', category: 'Decorations', name: 'Stage Decor', estimatedCost: 20000, actualCost: 0, priority: 'nice-to-have' },
    { id: '3', category: 'Miscellaneous', name: 'Favors & Print', estimatedCost: 10000, actualCost: 0, priority: 'optional' },
  ];
  const totalBudget = 60000;
  const proposal = proposeDeterministicRebalance(items, totalBudget, 'Catering', 5000);

  assert.equal(proposal.targetCategory, 'Catering');
  assert.equal(proposal.delta, 5000);
  // Checked that catering increased by 5000
  const catItem = proposal.adjustedItems.find(i => i.category === 'Catering');
  assert.ok(catItem);
  assert.equal(catItem.newEstimated, 35000);
  // Other flexible items were cut to offset
  assert.ok(proposal.adjustedItems.length > 1);
});
