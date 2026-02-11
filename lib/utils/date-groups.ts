/**
 * Utility for grouping items by date categories
 */

import {
  isToday,
  isYesterday,
  isWithinInterval,
  subDays,
  startOfDay,
} from "date-fns";

export type DateGroup =
  | "Today"
  | "Yesterday"
  | "Last 7 Days"
  | "Last 30 Days"
  | "Older";

interface Dated {
  updatedAt: string;
}

/**
 * Get the date group category for a given date
 */
export function getDateGroup(date: Date): DateGroup {
  const now = new Date();

  if (isToday(date)) {
    return "Today";
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  // Last 7 days (excluding today and yesterday)
  const sevenDaysAgo = startOfDay(subDays(now, 7));
  const twoDaysAgo = startOfDay(subDays(now, 2));
  if (
    isWithinInterval(date, {
      start: sevenDaysAgo,
      end: twoDaysAgo,
    })
  ) {
    return "Last 7 Days";
  }

  // Last 30 days (excluding last 7 days)
  const thirtyDaysAgo = startOfDay(subDays(now, 30));
  if (
    isWithinInterval(date, {
      start: thirtyDaysAgo,
      end: sevenDaysAgo,
    })
  ) {
    return "Last 30 Days";
  }

  return "Older";
}

/**
 * Group an array of dated items by date categories
 * Items must have an `updatedAt` field with an ISO date string
 */
export function groupByDate<T extends Dated>(
  items: T[]
): Map<DateGroup, T[]> {
  const groups = new Map<DateGroup, T[]>();
  const groupOrder: DateGroup[] = [
    "Today",
    "Yesterday",
    "Last 7 Days",
    "Last 30 Days",
    "Older",
  ];

  // Initialize empty arrays for each group
  for (const group of groupOrder) {
    groups.set(group, []);
  }

  // Sort items into groups
  for (const item of items) {
    const date = new Date(item.updatedAt);
    const group = getDateGroup(date);
    groups.get(group)!.push(item);
  }

  // Remove empty groups and return
  const result = new Map<DateGroup, T[]>();
  for (const group of groupOrder) {
    const items = groups.get(group)!;
    if (items.length > 0) {
      result.set(group, items);
    }
  }

  return result;
}
