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
function IconInbox({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 dark:from-zinc-950 dark:via-indigo-950/40 dark:to-zinc-950">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50/60 to-fuchsia-50 dark:from-zinc-950 dark:via-indigo-950/30 dark:to-zinc-950">
      {/* Floating color blobs */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl animate-blob dark:bg-indigo-600/20" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-fuchsia-300/30 blur-3xl animate-blob animation-delay-2 dark:bg-fuchsia-600/15" />
      <div className="pointer-events-none absolute bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-300/30 blur-3xl animate-blob animation-delay-4 dark:bg-violet-600/15" />

      <header className="sticky top-0 z-20 border-b border-white/40 bg-white/60 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/70">
        <div className="relative mx-auto flex max-w-2xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-300/40 animate-gradient dark:shadow-indigo-900/40">
              <IconBook className="h-5 w-5" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-[15px] font-bold tracking-tight text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-fuchsia-300">
                Echo Ledger
              </h1>
              <p className="text-[11px] leading-none text-zinc-500">Commitments, tracked</p>
            </div>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <IconTrash className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </header>

      <main className="relative mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Hero */}
        <section className="mb-8 text-center animate-fade-in-up">
          <h2 className="text-2xl font-bold tracking-tight sm:text-[28px]">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-300 dark:via-violet-300 dark:to-fuchsia-300">
              Turn voice into
            </span>
            <br />
            <span className="text-zinc-900 dark:text-zinc-50">tracked promises</span>
          </h2>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            Upload a call or voice memo. Echo extracts who committed to what — and by when.
          </p>
        </section>

        {/* Upload */}
        <section className="mb-8 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <UploadPanel onProcessed={handleProcessed} />
          <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
            <IconSparkles className="h-3 w-3 text-violet-400" />
            Demo mode works without a key · set OPENAI_API_KEY for real extraction
          </p>
        </section>

        {/* Stats + filters */}
        {items.length > 0 && (
          <section className="mb-5 space-y-4 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  {
                    key: "waiting" as const,
                    label: "Waiting",
                    gradient: "from-amber-400 to-orange-500",
                    bg: "from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30",
                    ring: "ring-amber-200 dark:ring-amber-800",
                  },
                  {
                    key: "overdue" as const,
                    label: "Overdue",
                    gradient: "from-rose-400 to-red-500",
                    bg: "from-rose-50 to-red-50 dark:from-rose-950/40 dark:to-red-950/30",
                    ring: "ring-rose-200 dark:ring-rose-800",
                  },
                  {
                    key: "fulfilled" as const,
                    label: "Done",
                    gradient: "from-emerald-400 to-teal-500",
                    bg: "from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30",
                    ring: "ring-emerald-200 dark:ring-emerald-800",
                  },
                ] as const
              ).map(({ key, label, gradient, bg, ring }) => (
                <button
                  key={key}
                  onClick={() => setFilter(filter === key ? "all" : key)}
                  className={cn(
                    "rounded-2xl border border-white/60 bg-gradient-to-br p-3.5 text-center shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-md dark:border-zinc-800/60",
                    bg,
                    filter === key && `ring-2 ${ring} scale-[1.03]`
                  )}
                >
                  <div
                    className={cn(
                      "bg-gradient-to-r bg-clip-text text-2xl font-extrabold tabular-nums text-transparent",
                      gradient
                    )}
                  >
                    {counts[key]}
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    {label}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
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
                    "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-200",
                    filter === key
                      ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-md shadow-indigo-200/50 dark:shadow-none"
                      : "bg-white/80 text-zinc-500 hover:bg-white hover:text-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  )}
                >
                  {label}
                  <span className="ml-1 opacity-70">{counts[key]}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* List */}
        <section className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-indigo-200/60 bg-white/50 py-16 text-center backdrop-blur-sm dark:border-indigo-900/40 dark:bg-zinc-900/40 animate-fade-in">
              {items.length === 0 ? (
                <>
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-500 animate-float dark:from-indigo-950 dark:to-violet-950 dark:text-indigo-400">
                    <IconInbox className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                    No commitments yet
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Upload a recording above to get started
                  </p>
                </>
              ) : (
                <p className="text-sm text-zinc-500">Nothing in this filter.</p>
              )}
            </div>
          ) : (
            filtered.map((item, i) => (
              <div
                key={item.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(i * 50, 250)}ms` }}
              >
                <CommitmentCard
                  item={item}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              </div>
            ))
          )}
        </section>
      </main>

      <footer className="relative border-t border-white/40 py-8 text-center text-[11px] text-zinc-400 dark:border-zinc-900">
        <span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text font-medium text-transparent">
          Echo Ledger
        </span>
        {" · Keep every promise in sight"}
      </footer>
    </div>
  );
}
