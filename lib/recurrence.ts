/**
 * Recurrence utilities for computing next_run_at from task recurrence config.
 *
 * Supported recurrence formats:
 *   { type: "interval", interval_ms: 86400000 }          — every N ms
 *   { type: "interval", interval_days: 7 }                — every N days
 *   { type: "daily", time: "09:00" }                      — daily at HH:MM UTC
 *   { type: "weekly", day: 1, time: "09:00" }             — weekly on day (0=Sun) at HH:MM UTC
 *   { type: "cron", expression: "0 9 * * 1" }             — simple cron (min hour dom month dow)
 */

export function computeNextRun(
  recurrence: Record<string, any> | null,
  fromDate: Date = new Date()
): Date | null {
  if (!recurrence || !recurrence.type) return null;

  const now = fromDate.getTime();

  switch (recurrence.type) {
    case "interval": {
      const ms =
        recurrence.interval_ms ??
        (recurrence.interval_days ? recurrence.interval_days * 86400000 : null) ??
        (recurrence.interval_hours ? recurrence.interval_hours * 3600000 : null);
      if (!ms || ms <= 0) return null;
      return new Date(now + ms);
    }

    case "daily": {
      const [hours, minutes] = (recurrence.time || "09:00").split(":").map(Number);
      const next = new Date(fromDate);
      next.setUTCHours(hours, minutes, 0, 0);
      if (next.getTime() <= now) next.setUTCDate(next.getUTCDate() + 1);
      return next;
    }

    case "weekly": {
      const targetDay = recurrence.day ?? 1; // 0=Sun, 1=Mon, etc.
      const [hours, minutes] = (recurrence.time || "09:00").split(":").map(Number);
      const next = new Date(fromDate);
      next.setUTCHours(hours, minutes, 0, 0);
      const currentDay = next.getUTCDay();
      let daysUntil = targetDay - currentDay;
      if (daysUntil < 0 || (daysUntil === 0 && next.getTime() <= now)) daysUntil += 7;
      next.setUTCDate(next.getUTCDate() + daysUntil);
      return next;
    }

    case "cron": {
      // Simple cron: minute hour day-of-month month day-of-week
      // Only supports basic patterns (not ranges or steps)
      return computeSimpleCron(recurrence.expression, fromDate);
    }

    default:
      return null;
  }
}

function computeSimpleCron(expression: string, fromDate: Date): Date | null {
  if (!expression) return null;

  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [minStr, hourStr, , , dowStr] = parts;

  const minute = minStr === "*" ? null : parseInt(minStr);
  const hour = hourStr === "*" ? null : parseInt(hourStr);
  const dow = dowStr === "*" ? null : parseInt(dowStr);

  // Build next occurrence (simplified: only supports specific minute/hour/dow)
  const next = new Date(fromDate);
  next.setUTCSeconds(0, 0);

  if (minute !== null) next.setUTCMinutes(minute);
  if (hour !== null) next.setUTCHours(hour);

  // If target time is in the past today, advance to tomorrow
  if (next.getTime() <= fromDate.getTime()) {
    next.setUTCDate(next.getUTCDate() + 1);
  }

  // If specific day-of-week, advance to that day
  if (dow !== null) {
    while (next.getUTCDay() !== dow) {
      next.setUTCDate(next.getUTCDate() + 1);
    }
  }

  return next;
}
