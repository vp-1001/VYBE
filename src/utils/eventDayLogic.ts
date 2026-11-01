import { EventScheduleItem } from '../types/event';

export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  // Wrap within 24h
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export interface ScheduleIncidentAdjustment {
  impactedItemIds: string[];
  proposedSchedule: EventScheduleItem[];
  affectedSummary: string[];
}

/**
 * Deterministically recalculates the run-of-show schedule when an incident or delay occurs.
 * If an item starting at or after `delayedAfterTime` is delayed by `delayMinutes`,
 * downstream items that would collide or depend on it are shifted forward by `delayMinutes`.
 */
export function recalculateScheduleForDelay(
  schedule: EventScheduleItem[],
  targetActivityKeyword: string,
  delayMinutes: number
): ScheduleIncidentAdjustment {
  const keyword = targetActivityKeyword.toLowerCase().trim();
  const searchTerms = [keyword];
  if (keyword.startsWith('photo')) {
    searchTerms.push('photo', 'photobooth', 'photograph');
  } else if (keyword.startsWith('cater') || keyword === 'food') {
    searchTerms.push('cater', 'buffet', 'dinner', 'lunch', 'food');
  } else if (keyword.startsWith('music') || keyword === 'band' || keyword === 'dj') {
    searchTerms.push('band', 'music', 'dj', 'performance');
  } else if (keyword.startsWith('decor') || keyword === 'stage') {
    searchTerms.push('stage', 'decor', 'setup');
  }

  // Find matching activity
  const matchedItemIndex = schedule.findIndex((item) => {
    const act = (item.activity || '').toLowerCase();
    const resp = (item.responsiblePersonName || '').toLowerCase();
    const notes = (item.notes || '').toLowerCase();
    return searchTerms.some((term) => act.includes(term) || resp.includes(term) || notes.includes(term));
  });

  if (matchedItemIndex === -1) {
    return {
      impactedItemIds: [],
      proposedSchedule: schedule,
      affectedSummary: [`No schedule item matching "${targetActivityKeyword}" was found.`],
    };
  }

  const matchedItem = schedule[matchedItemIndex];
  const matchedStartMinutes = timeToMinutes(matchedItem.startTime);

  const proposedSchedule: EventScheduleItem[] = [];
  const impactedItemIds: string[] = [];
  const affectedSummary: string[] = [];

  for (let i = 0; i < schedule.length; i++) {
    const item = schedule[i];
    const itemStartMinutes = timeToMinutes(item.startTime);
    const itemEndMinutes = timeToMinutes(item.endTime);
    const itemDuration = Math.max(15, itemEndMinutes - itemStartMinutes);

    // If it's the matched item or subsequent items scheduled at or after the matched item
    if (i >= matchedItemIndex || itemStartMinutes >= matchedStartMinutes) {
      impactedItemIds.push(item.id);
      const newStart = itemStartMinutes + delayMinutes;
      const newEnd = newStart + itemDuration;
      const originalStart = item.originalStartTime || item.startTime;

      proposedSchedule.push({
        ...item,
        startTime: minutesToTime(newStart),
        endTime: minutesToTime(newEnd),
        originalStartTime: originalStart,
        status: i === matchedItemIndex ? 'delayed' : item.status,
      });

      affectedSummary.push(
        `${item.activity}: shifted from ${item.startTime} to ${minutesToTime(newStart)} (+${delayMinutes}m)`
      );
    } else {
      proposedSchedule.push({ ...item });
    }
  }

  return {
    impactedItemIds,
    proposedSchedule,
    affectedSummary,
  };
}
