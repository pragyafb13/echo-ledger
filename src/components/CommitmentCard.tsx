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
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

export function CommitmentCard({ item, onUpdate, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const days = daysUntil(item.deadlineDate);

  let urgencyHint = "";
  if (item.status === "waiting" && days !== null) {
    if (days < 0) urgencyHint = `${Math.abs(days)}d overdue`;
    else if (days === 0) urgencyHint = "Due today";
    else if (days === 1) urgencyHint = "Due tomorrow";
    else urgencyHint = `${days}d left`;
  }

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-zinc-900",
        item.status === "overdue" && "border-red-300 dark:border-red-800",
        item.status === "fulfilled" && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {item.person}
            </span>
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                statusColor(item.status)
              )}
            >
              {statusLabel(item.status)}
            </span>
            {urgencyHint && (
              <span
                className={cn(
                  "text-xs font-medium",
                  days !== null && days < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-600 dark:text-amber-400"
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
            <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <IconClock className="h-3.5 w-3.5" />
              {item.deadline}
              {item.deadlineDate && (
                <span className="text-zinc-400">({item.deadlineDate})</span>
              )}
            </p>
          )}

          {item.context && (
            <p className="mt-1 text-xs italic text-zinc-400 dark:text-zinc-500">
              {item.context}
            </p>
          )}
        </div>

        <div className="relative flex shrink-0 items-center gap-1">
          {(item.status === "waiting" || item.status === "overdue") && (
            <>
              <button
                onClick={() => onUpdate(item.id, "fulfilled")}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50"
                title="Mark fulfilled"
              >
                <IconCheck className="h-4 w-4" />
              </button>
              <button
                onClick={() => onUpdate(item.id, "cancelled")}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
                title="Cancel"
              >
                <IconX className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <IconMore className="h-4 w-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
              <button
                onClick={() => {
                  onUpdate(item.id, "waiting");
                  setMenuOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Mark waiting
              </button>
              <button
                onClick={() => {
                  onUpdate(item.id, "overdue");
                  setMenuOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Mark overdue
              </button>
              <button
                onClick={() => {
                  onDelete(item.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <IconTrash className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400">
        <span>From: {item.source}</span>
        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
