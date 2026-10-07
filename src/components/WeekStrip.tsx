"use client";

import { Commitment } from "@/lib/types";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Build 7 days starting from today */
function weekDays() {
  const start = startOfToday();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

interface Props {
  items: Commitment[];
  onSelectDay?: (isoDate: string) => void;
  selectedDate?: string | null;
}

export function WeekStrip({ items, onSelectDay, selectedDate }: Props) {
  const days = weekDays();
  const todayKey = dateKey(startOfToday());

  const openItems = items.filter(
    (c) => c.status === "waiting" || c.status === "overdue"
  );

  const byDate = (iso: string) =>
    openItems.filter((c) => c.deadlineDate === iso);

  const overdueCount = openItems.filter((c) => c.status === "overdue").length;

  return (
    <section className="mb-6 rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">This week</h2>
        {overdueCount > 0 && (
          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
            {overdueCount} overdue
          </span>
        )}
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const key = dateKey(d);
          const due = byDate(key);
          const isToday = key === todayKey;
          const isSelected = selectedDate === key;
          const hasOverdue = due.some((c) => c.status === "overdue");
          const hasWaiting = due.some((c) => c.status === "waiting");

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDay?.(key)}
              className={cn(
                "flex flex-col items-center rounded-xl px-0.5 py-2 transition",
                isSelected
                  ? "bg-gradient-to-b from-indigo-500 to-fuchsia-500 text-white shadow-md"
                  : isToday
                  ? "bg-indigo-50 ring-1 ring-indigo-200 dark:bg-indigo-950/40 dark:ring-indigo-800"
                  : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase",
                  isSelected ? "text-white/80" : "text-zinc-400"
                )}
              >
                {DAY_LABELS[d.getDay()]}
              </span>
              <span
                className={cn(
                  "mt-0.5 text-sm font-bold tabular-nums",
                  isSelected
                    ? "text-white"
                    : isToday
                    ? "text-indigo-700 dark:text-indigo-300"
                    : "text-zinc-800 dark:text-zinc-100"
                )}
              >
                {d.getDate()}
              </span>

              {/* Dots for commitments */}
              <div className="mt-1.5 flex min-h-[6px] items-center justify-center gap-0.5">
                {due.length === 0 ? (
                  <span className="h-1 w-1 rounded-full bg-transparent" />
                ) : due.length <= 3 ? (
                  due.map((c) => (
                    <span
                      key={c.id}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isSelected
                          ? "bg-white"
                          : c.status === "overdue"
                          ? "bg-rose-500"
                          : "bg-amber-400"
                      )}
                    />
                  ))
                ) : (
                  <span
                    className={cn(
                      "rounded-full px-1 text-[9px] font-bold",
                      isSelected
                        ? "bg-white/20 text-white"
                        : hasOverdue
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {due.length}
                  </span>
                )}
              </div>

              {(hasOverdue || hasWaiting) && !isSelected && due.length > 0 && due.length <= 3 && (
                <span className="sr-only">{due.length} due</span>
              )}
            </button>
          );
        })}
      </div>

      {selectedDate && (
        <div className="mt-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <p className="mb-2 text-[11px] font-semibold text-zinc-500">
            {selectedDate === todayKey ? "Today" : selectedDate}
          </p>
          {byDate(selectedDate).length === 0 ? (
            <p className="text-xs text-zinc-400">No deadlines this day</p>
          ) : (
            <ul className="space-y-1.5">
              {byDate(selectedDate).map((c) => (
                <li
                  key={c.id}
                  className="flex items-start gap-2 rounded-lg bg-zinc-50 px-2.5 py-1.5 text-xs dark:bg-zinc-800/50"
                >
                  <span
                    className={cn(
                      "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                      c.status === "overdue" ? "bg-rose-500" : "bg-amber-400"
                    )}
                  />
                  <span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-100">
                      {c.person}
                    </span>
                    <span className="text-zinc-500"> — {c.commitment}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
