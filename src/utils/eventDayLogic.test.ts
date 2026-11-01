import test from 'node:test';
import assert from 'node:assert/strict';
import { timeToMinutes, minutesToTime, recalculateScheduleForDelay } from './eventDayLogic';
import { EventScheduleItem } from '../types/event';

test('timeToMinutes and minutesToTime convert correctly', () => {
  assert.equal(timeToMinutes('14:30'), 870);
  assert.equal(minutesToTime(870), '14:30');
  assert.equal(minutesToTime(timeToMinutes('09:15') + 45), '10:00');
});

test('recalculateScheduleForDelay shifts downstream items by specified delay', () => {
  const schedule: EventScheduleItem[] = [
    { id: 's1', startTime: '15:00', endTime: '16:00', activity: 'Venue Setup & Soundcheck', location: 'Main Hall', status: 'completed' },
    { id: 's2', startTime: '16:00', endTime: '17:00', activity: 'Photographer Golden Hour Session', location: 'Garden', status: 'scheduled' },
    { id: 's3', startTime: '17:00', endTime: '17:30', activity: 'Guest Welcome & Mocktails', location: 'Lobby', status: 'scheduled' },
    { id: 's4', startTime: '17:30', endTime: '19:30', activity: 'Cultural Performances & Awards', location: 'Stage', status: 'scheduled' },
  ];

  const result = recalculateScheduleForDelay(schedule, 'Photographer', 30);

  assert.equal(result.impactedItemIds.length, 3);
  // Venue setup before photographer remains unaffected
  assert.equal(result.proposedSchedule[0].startTime, '15:00');
  // Photographer shifted by 30 mins: 16:00 -> 16:30
  assert.equal(result.proposedSchedule[1].startTime, '16:30');
  assert.equal(result.proposedSchedule[1].endTime, '17:30');
  assert.equal(result.proposedSchedule[1].status, 'delayed');
  // Guest welcome shifted: 17:00 -> 17:30
  assert.equal(result.proposedSchedule[2].startTime, '17:30');
  // Cultural performances shifted: 17:30 -> 18:00
  assert.equal(result.proposedSchedule[3].startTime, '18:00');
});
