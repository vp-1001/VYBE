import test from 'node:test';
import assert from 'node:assert/strict';
import { detectDependencyCycle, findImpactedDownstreamTasks, calculateCriticalPath } from './timelineLogic';
import { TaskItem } from '../types/event';

test('detectDependencyCycle detects direct circular dependency', () => {
  const tasks: TaskItem[] = [
    { id: 't1', title: 'Confirm Venue', category: 'Venue', dueDate: '2026-11-10', priority: 'high', status: 'pending', dependencies: ['t2'] },
    { id: 't2', title: 'Confirm Catering', category: 'Food', dueDate: '2026-11-12', priority: 'high', status: 'pending', dependencies: ['t1'] },
  ];

  const result = detectDependencyCycle(tasks);
  assert.equal(result.hasCycle, true);
  assert.ok(result.message?.includes('Circular dependency detected'));
});

test('detectDependencyCycle allows valid DAG without cycles', () => {
  const tasks: TaskItem[] = [
    { id: 't1', title: 'Confirm Date', category: 'Planning', dueDate: '2026-11-01', priority: 'high', status: 'completed', dependencies: [] },
    { id: 't2', title: 'Book Venue', category: 'Venue', dueDate: '2026-11-05', priority: 'high', status: 'pending', dependencies: ['t1'] },
    { id: 't3', title: 'Arrange Catering', category: 'Food', dueDate: '2026-11-10', priority: 'medium', status: 'pending', dependencies: ['t2'] },
  ];

  const result = detectDependencyCycle(tasks);
  assert.equal(result.hasCycle, false);
});

test('findImpactedDownstreamTasks cascades delays to dependent tasks only', () => {
  const tasks: TaskItem[] = [
    { id: 't1', title: 'Confirm Venue', category: 'Venue', dueDate: '2026-11-10', priority: 'high', status: 'pending', dependencies: [] },
    { id: 't2', title: 'Finalize Floor Plan', category: 'Decor', dueDate: '2026-11-12', priority: 'medium', status: 'pending', dependencies: ['t1'] },
    { id: 't3', title: 'Order Stage Backdrop', category: 'Decor', dueDate: '2026-11-15', priority: 'medium', status: 'pending', dependencies: ['t2'] },
    { id: 't4', title: 'Independent Social Media Post', category: 'Marketing', dueDate: '2026-11-10', priority: 'low', status: 'pending', dependencies: [] },
  ];

  const impacted = findImpactedDownstreamTasks(tasks, 't1', 2);
  assert.equal(impacted.impactedTaskIds.length, 2);
  assert.ok(impacted.impactedTaskIds.includes('t2'));
  assert.ok(impacted.impactedTaskIds.includes('t3'));
  assert.ok(!impacted.impactedTaskIds.includes('t4'));
});

test('calculateCriticalPath identifies longest dependency chains', () => {
  const tasks: TaskItem[] = [
    { id: 't1', title: 'Book Venue', category: 'Venue', dueDate: '2026-11-01', priority: 'high', status: 'pending', dependencies: [], estimatedDurationHours: 16 },
    { id: 't2', title: 'Stage Setup', category: 'Decor', dueDate: '2026-11-03', priority: 'high', status: 'pending', dependencies: ['t1'], estimatedDurationHours: 24 },
    { id: 't3', title: 'Soundcheck', category: 'AV', dueDate: '2026-11-04', priority: 'urgent', status: 'pending', dependencies: ['t2'], estimatedDurationHours: 8 },
    { id: 't4', title: 'Buy Snacks', category: 'Misc', dueDate: '2026-11-02', priority: 'low', status: 'pending', dependencies: [], estimatedDurationHours: 2 },
  ];

  const { criticalTaskIds } = calculateCriticalPath(tasks);
  assert.ok(criticalTaskIds.has('t3'));
});
