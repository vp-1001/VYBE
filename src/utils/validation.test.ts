import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAndRepairEventPlan } from './validation';

test('validateAndRepairEventPlan accepts valid complete event plan', () => {
  const input = {
    title: 'Spring Fest 2027',
    totalBudget: 100000,
    guestCount: 300,
    budget: [
      { id: 'b1', category: 'Venue', name: 'Grand Hall', estimatedCost: 40000, actualCost: 0 },
      { id: 'b2', category: 'Catering', name: 'Buffet', estimatedCost: 60000, actualCost: 0 },
    ],
    tasks: [
      { id: 't1', title: 'Book Hall', category: 'Venue', dueDate: '2026-11-10', priority: 'high', status: 'pending', dependencies: [] },
    ],
    theme: {
      name: 'Spring Bloom',
      colors: ['#FFB997', '#8B5CF6', '#FAF8F5'],
    },
  };

  const res = validateAndRepairEventPlan(input);
  assert.equal(res.isValid, true);
  assert.equal(res.data?.title, 'Spring Fest 2027');
  assert.equal(res.data?.totalBudget, 100000);
  assert.equal(res.data?.budget.length, 2);
});

test('validateAndRepairEventPlan detects budget overrun and deterministically rescales to limit', () => {
  const overrunningInput = {
    title: 'Overbudget Gala',
    totalBudget: 50000,
    guestCount: 100,
    budget: [
      { id: 'b1', category: 'Venue', name: 'Expensive Hall', estimatedCost: 40000 },
      { id: 'b2', category: 'Catering', name: 'Caviar Feast', estimatedCost: 40000 },
    ],
  };

  const res = validateAndRepairEventPlan(overrunningInput);
  assert.equal(res.isValid, true);
  assert.equal(res.repaired, true);
  // Sum must be <= totalBudget (50000)
  const sum = res.data!.budget.reduce((a, b) => a + b.estimatedCost, 0);
  assert.ok(sum <= 50000);
  assert.ok(res.errors.some(e => e.includes('exceeded total limit')));
});

test('validateAndRepairEventPlan catches and removes circular dependencies in tasks', () => {
  const cyclicInput = {
    title: 'Cycle Plan',
    totalBudget: 50000,
    tasks: [
      { id: 't1', title: 'Task A', dependencies: ['t2'] },
      { id: 't2', title: 'Task B', dependencies: ['t1'] },
    ],
  };

  const res = validateAndRepairEventPlan(cyclicInput);
  assert.equal(res.isValid, true);
  assert.equal(res.repaired, true);
  assert.ok(res.errors.some(e => e.includes('circular dependency')));
});

test('validateAndRepairEventPlan rejects non-object inputs safely without crashing', () => {
  assert.equal(validateAndRepairEventPlan(null).isValid, false);
  assert.equal(validateAndRepairEventPlan('invalid string').isValid, false);
  assert.equal(validateAndRepairEventPlan(undefined).isValid, false);
});
