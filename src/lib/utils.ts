import { CommitmentStatus } from "./types";

export function cn(...inputs: (string | false | null | undefined)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function statusColor(status: CommitmentStatus): string {
  switch (status) {
    case "waiting":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800";
    case "fulfilled":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
    case "cancelled":
      return "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700";
    default:
      return "bg-zinc-100 text-zinc-800";
  }
}

export function statusLabel(status: CommitmentStatus): string {
  switch (status) {
    case "waiting":
      return "Waiting";
    case "overdue":
      return "Overdue";
    case "fulfilled":
      return "Fulfilled";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

/** Try to parse casual deadline phrases into a date */
export function parseDeadline(phrase: string | null): string | null {
  if (!phrase) return null;
  const lower = phrase.toLowerCase().trim();
  const now = new Date();

  if (lower.includes("today")) {
    return now.toISOString().slice(0, 10);
  }
  if (lower.includes("tomorrow")) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }
  if (lower.includes("end of the week") || lower.includes("this weekend") || lower.includes("by weekend")) {
    const d = new Date(now);
    const day = d.getDay();
    const daysToSat = (6 - day + 7) % 7 || 7;
    d.setDate(d.getDate() + daysToSat);
    return d.toISOString().slice(0, 10);
  }
  if (lower.includes("couple of days") || lower.includes("a couple days") || lower.includes("2 days") || lower.includes("two days")) {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    return d.toISOString().slice(0, 10);
  }
  if (lower.includes("few days") || lower.includes("in a few days")) {
    const d = new Date(now);
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  }
  if (lower.includes("next week")) {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }

  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  for (let i = 0; i < days.length; i++) {
    if (lower.includes(days[i]) || lower.includes(`by ${days[i].slice(0, 3)}`)) {
      const d = new Date(now);
      const current = d.getDay();
      let diff = i - current;
      if (diff <= 0) diff += 7;
      d.setDate(d.getDate() + diff);
      return d.toISOString().slice(0, 10);
    }
  }

  const parsed = Date.parse(phrase);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString().slice(0, 10);
  }

  return null;
}

export function daysUntil(deadlineDate: string | null): number | null {
  if (!deadlineDate) return null;
  const target = new Date(deadlineDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
