"use client";

import { useEffect, useState, useCallback } from "react";
import { Commitment, CommitmentStatus } from "@/lib/types";
import {
  loadCommitments,
  addCommitments,
  updateCommitment,
  deleteCommitment,
  clearAll,
} from "@/lib/storage";
import { UploadPanel } from "@/components/UploadPanel";
import { CommitmentCard } from "@/components/CommitmentCard";
import { cn, daysUntil } from "@/lib/utils";

type FilterKey = "all" | "waiting" | "overdue" | "fulfilled";

function IconBook({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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
function IconSparkles({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}
function IconAlert({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
function IconFilter({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

export default function Home() {
  const [items, setItems] = useState<Commitment[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(loadCommitments());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let changed = false;
    const next = items.map((c) => {
      if (c.status === "waiting" && c.deadlineDate) {
        const d = daysUntil(c.deadlineDate);
        if (d !== null && d < 0) {
          changed = true;
          return { ...c, status: "overdue" as CommitmentStatus };
        }
      }
      return c;
    });
    if (changed) {
      setItems(next);
      next.forEach((c) => {
        if (c.status === "overdue") updateCommitment(c.id, { status: "overdue" });
      });
    }
  }, [mounted]); // eslint-disable-line

  const handleProcessed = useCallback((newOnes: Commitment[]) => {
    const merged = addCommitments(newOnes);
    setItems(merged);
  }, []);

  const handleUpdate = useCallback((id: string, status: CommitmentStatus) => {
    const next = updateCommitment(id, { status });
    setItems(next);
  }, []);

  const handleDelete = useCallback((id: string) => {
    const next = deleteCommitment(id);
    setItems(next);
  }, []);

  const handleClear = () => {
    if (confirm("Clear all commitments? This cannot be undone.")) {
      clearAll();
      setItems([]);
    }
  };

  const filtered = items.filter((c) => {
    if (filter === "all") return true;
    return c.status === filter;
  });

  const counts = {
    all: items.length,
    waiting: items.filter((c) => c.status === "waiting").length,
    overdue: items.filter((c) => c.status === "overdue").length,
    fulfilled: items.filter((c) => c.status === "fulfilled").length,
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900">
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <IconBook className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Echo Ledger
              </h1>
              <p className="text-xs text-zinc-500">Commitments, tracked.</p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
            >
              <IconTrash className="h-3.5 w-3.5" />
              Clear all
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <section className="mb-10">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
              Turn voice into tracked promises
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Upload a call or voice memo. Echo Ledger extracts who committed to what — and by when.
            </p>
          </div>

          <UploadPanel onProcessed={handleProcessed} />

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <IconSparkles className="h-3.5 w-3.5" />
            Demo mode works without a key — set OPENAI_API_KEY for real Whisper + GPT extraction
          </p>
        </section>

        {items.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <IconFilter className="h-4 w-4 text-zinc-400" />
            {(
              [
                ["all", "All"],
                ["waiting", "Waiting"],
                ["overdue", "Overdue"],
                ["fulfilled", "Fulfilled"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  filter === key
                    ? "bg-indigo-600 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                )}
              >
                {label}
                <span className="ml-1.5 opacity-70">{counts[key]}</span>
              </button>
            ))}
          </div>
        )}

        <section className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 py-16 text-center dark:border-zinc-700">
              {items.length === 0 ? (
                <>
                  <IconAlert className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                  <p className="text-sm text-zinc-500">
                    No commitments yet. Upload a recording to get started.
                  </p>
                </>
              ) : (
                <p className="text-sm text-zinc-500">Nothing in this filter.</p>
              )}
            </div>
          ) : (
            filtered.map((item) => (
              <CommitmentCard
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          )}
        </section>
      </main>

      <footer className="border-t border-zinc-100 py-6 text-center text-xs text-zinc-400 dark:border-zinc-800">
        Echo Ledger · Keep every promise in sight
      </footer>
    </div>
  );
}
