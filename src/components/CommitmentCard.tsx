"use client";

import { Commitment, CommitmentStatus } from "@/lib/types";
import { cn, statusColor, statusLabel, daysUntil } from "@/lib/utils";
import { useState } from "react";

interface Props {
  item: Commitment;
  onUpdate: (id: string, status: CommitmentStatus) => void;
  onDelete: (id: string) => void;
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
function IconMore({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  );
}

function accentClass(status: CommitmentStatus) {
  switch (status) {
    case "overdue":
      return "bg-red-500";
    case "fulfilled":
      return "bg-emerald-500";
    case "cancelled":
      return "bg-zinc-400";
    default:
      return "bg-indigo-500";
  }
}

export function CommitmentCard({ item, onUpdate, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const days = daysUntil(item.deadlineDate);

  let urgencyHint = "";
  if ((item.status === "waiting" || item.status === "overdue") && days !== null) {
    if (days < 0) urgencyHint = `${Math.abs(days)}d overdue`;
    else if (days === 0) urgencyHint = "Due today";
    else if (days === 1) urgencyHint = "Due tomorrow";
    else urgencyHint = `${days}d left`;
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:bg-zinc-900 dark:border-zinc-800",
        item.status === "overdue" && "border-red-200 dark:border-red-900/60",
        item.status === "fulfilled" && "opacity-75"
      )}
    >
      <div className={cn("absolute left-0 top-0 h-full w-1", accentClass(item.status))} />

      <div className="flex items-start justify-between gap-3 p-4 pl-5">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {item.person}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                statusColor(item.status)
              )}
            >
              {statusLabel(item.status)}
            </span>
            {urgencyHint && (
              <span
                className={cn(
                  "text-[11px] font-semibold tabular-nums",
                  days !== null && days < 0
                    ? "text-red-600 dark:text-red-400"
                    : days === 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-zinc-500 dark:text-zinc-400"
                )}
              >
                {urgencyHint}
              </span>
            )}
          </div>

          <p className="mt-1.5 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
            {item.commitment}
          </p>

          {item.deadline && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <IconClock className="h-3.5 w-3.5 shrink-0" />
              <span>{item.deadline}</span>
              {item.deadlineDate && (
                <span className="text-zinc-400 dark:text-zinc-500">· {item.deadlineDate}</span>
              )}
            </p>
          )}

          {item.context && (
            <p className="mt-1 text-xs leading-snug text-zinc-400 dark:text-zinc-500">
              {item.context}
            </p>
          )}
        </div>

        <div className="relative flex shrink-0 items-center gap-0.5">
          {(item.status === "waiting" || item.status === "overdue") && (
            <>
              <button
                onClick={() => onUpdate(item.id, "fulfilled")}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                title="Mark fulfilled"
              >
                <IconCheck className="h-4 w-4" />
              </button>
              <button
                onClick={() => onUpdate(item.id, "cancelled")}
                className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                title="Cancel"
              >
                <IconX className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <IconMore className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
                <button
                  onClick={() => {
                    onUpdate(item.id, "waiting");
                    setMenuOpen(false);
                  }}
                  className="block w-full px-3.5 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Mark waiting
                </button>
                <button
                  onClick={() => {
                    onUpdate(item.id, "overdue");
                    setMenuOpen(false);
                  }}
                  className="block w-full px-3.5 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Mark overdue
                </button>
                <div className="my-1 border-t border-zinc-100 dark:border-zinc-800" />
                <button
                  onClick={() => {
                    onDelete(item.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-2 text-[11px] text-zinc-400 dark:border-zinc-800/80">
        <span className="truncate">{item.source}</span>
        <span className="shrink-0 tabular-nums">
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
