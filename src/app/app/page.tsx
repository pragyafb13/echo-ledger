"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Commitment, CommitmentStatus, Plan, Session } from "@/lib/types";
import {
  loadCommitments,
  addCommitments,
  updateCommitment,
  deleteCommitment,
  clearAll,
} from "@/lib/storage";
import {
  getSession,
  logout,
  getUsage,
  canExtract,
  recordExtraction,
  canUploadFile,
} from "@/lib/auth";
import { UploadPanel } from "@/components/UploadPanel";
import { CommitmentCard } from "@/components/CommitmentCard";
import { cn, daysUntil, parseDeadline } from "@/lib/utils";

type FilterKey = "today" | "all" | "waiting" | "overdue" | "fulfilled";

function isDueToday(c: Commitment) {
  if (!c.deadlineDate) return false;
  const d = daysUntil(c.deadlineDate);
  return d === 0;
}

export default function AppPage() {
  const [items, setItems] = useState<Commitment[]>([]);
  const [filter, setFilter] = useState<FilterKey>("today");
  const [mounted, setMounted] = useState(false);
  const [session, setSessionState] = useState<Session | null>(null);
  const [usage, setUsage] = useState({
    used: 0,
    limit: 5,
    remaining: 5,
    plan: "free" as Plan,
    maxFileBytes: 1024 * 1024,
  });
  const [showManual, setShowManual] = useState(false);
  const [manual, setManual] = useState({ person: "", commitment: "", deadline: "" });

  const refreshUsage = useCallback(() => {
    const s = getSession();
    setSessionState(s);
    setUsage(getUsage(s?.email ?? null));
  }, []);

  useEffect(() => {
    const s = getSession();
    setSessionState(s);
    setItems(loadCommitments(s?.email));
    setUsage(getUsage(s?.email ?? null));
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
        if (c.status === "overdue") {
          updateCommitment(c.id, { status: "overdue" }, session?.email);
        }
      });
    }
  }, [mounted]); // eslint-disable-line

  const handleProcessed = useCallback(
    (newOnes: Commitment[]) => {
      const email = getSession()?.email ?? null;
      const gate = canExtract(email);
      if (!gate.ok) {
        alert(gate.error);
        return;
      }
      recordExtraction(email);
      refreshUsage();
      const merged = addCommitments(newOnes, email);
      setItems(merged);
    },
    [refreshUsage]
  );

  const handleBeforeUpload = useCallback((sizeBytes: number): boolean => {
    const email = getSession()?.email ?? null;
    const fileGate = canUploadFile(email, sizeBytes);
    if (!fileGate.ok) {
      alert(fileGate.error);
      return false;
    }
    const extractGate = canExtract(email);
    if (!extractGate.ok) {
      alert(extractGate.error);
      return false;
    }
    return true;
  }, []);

  const handleUpdate = useCallback(
    (id: string, status: CommitmentStatus) => {
      const next = updateCommitment(id, { status }, session?.email);
      setItems(next);
    },
    [session?.email]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const next = deleteCommitment(id, session?.email);
      setItems(next);
    },
    [session?.email]
  );

  const handleClear = () => {
    if (confirm("Clear all commitments?")) {
      clearAll(session?.email);
      setItems([]);
    }
  };

  const handleManualAdd = () => {
    if (!manual.person.trim() || !manual.commitment.trim()) return;
    const now = new Date().toISOString();
    const deadlineDate = parseDeadline(manual.deadline || null);
    let status: CommitmentStatus = "waiting";
    if (deadlineDate) {
      const d = daysUntil(deadlineDate);
      if (d !== null && d < 0) status = "overdue";
    }
    const item: Commitment = {
      id: crypto.randomUUID(),
      person: manual.person.trim(),
      commitment: manual.commitment.trim(),
      deadline: manual.deadline.trim() || null,
      deadlineDate,
      context: "Added manually",
      source: "manual",
      status,
      createdAt: now,
      updatedAt: now,
    };
    const merged = addCommitments([item], session?.email);
    setItems(merged);
    setManual({ person: "", commitment: "", deadline: "" });
    setShowManual(false);
  };

  const handleLogout = () => {
    logout();
    setSessionState(null);
    setItems(loadCommitments(null));
    refreshUsage();
  };

  const filtered = items.filter((c) => {
    if (filter === "all") return true;
    if (filter === "today") {
      return c.status === "overdue" || isDueToday(c) || (c.status === "waiting" && !c.deadlineDate);
    }
    return c.status === filter;
  });

  const counts = {
    today: items.filter(
      (c) => c.status === "overdue" || isDueToday(c) || (c.status === "waiting" && !c.deadlineDate)
    ).length,
    all: items.length,
    waiting: items.filter((c) => c.status === "waiting").length,
    overdue: items.filter((c) => c.status === "overdue").length,
    fulfilled: items.filter((c) => c.status === "fulfilled").length,
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-fuchsia-50">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50/60 to-fuchsia-50 dark:from-zinc-950 dark:via-indigo-950/30 dark:to-zinc-950">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-fuchsia-300/30 blur-3xl" />

      <header className="sticky top-0 z-20 border-b border-white/40 bg-white/60 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/70">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-bold text-white"
            >
              E
            </Link>
            <div>
              <h1 className="text-[15px] font-bold text-zinc-900 dark:text-zinc-50">Echo Ledger</h1>
              <p className="text-[11px] text-zinc-500">
                {session ? session.name : "Guest"}
                {usage.plan === "pro" ? " · Pro" : ` · ${usage.remaining} left this month`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {usage.plan === "free" && (
              <Link
                href="/pricing"
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2.5 py-1 text-[10px] font-bold text-white"
              >
                Upgrade
              </Link>
            )}
            {session ? (
              <button
                onClick={handleLogout}
                className="rounded-xl px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-zinc-700"
              >
                Log out
              </button>
            ) : (
              <Link href="/login" className="rounded-xl px-2.5 py-1 text-xs font-semibold text-indigo-600">
                Log in
              </Link>
            )}
            {items.length > 0 && (
              <button
                onClick={handleClear}
                className="rounded-xl px-2 py-1 text-xs text-zinc-400 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <section className="mb-6 rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Good morning briefing</h2>
          <p className="mt-1 text-xs text-zinc-500">
            {counts.overdue > 0 && (
              <span className="font-semibold text-rose-600">{counts.overdue} overdue</span>
            )}
            {counts.overdue > 0 && counts.waiting > 0 && " · "}
            {counts.waiting > 0 && (
              <span className="font-semibold text-amber-600">{counts.waiting} waiting</span>
            )}
            {counts.overdue === 0 && counts.waiting === 0 && "All clear — no open commitments."}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-all"
              style={{
                width: `${usage.plan === "pro" ? 100 : Math.min(100, (usage.used / Math.max(usage.limit, 1)) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-1 text-[10px] text-zinc-400">
            {usage.plan === "pro"
              ? "Pro · unlimited extractions"
              : `${usage.used} / ${usage.limit} free extractions used this month`}
          </p>
        </section>

        <section className="mb-4">
          <UploadPanel onProcessed={handleProcessed} onBeforeUpload={handleBeforeUpload} />
        </section>

        <section className="mb-6">
          {!showManual ? (
            <button
              onClick={() => setShowManual(true)}
              className="w-full rounded-2xl border border-dashed border-indigo-200 py-3 text-xs font-semibold text-indigo-600 hover:bg-white/50 dark:border-indigo-800 dark:text-indigo-400"
            >
              + Add commitment manually
            </button>
          ) : (
            <div className="rounded-2xl border border-indigo-100 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-900/90">
              <p className="mb-3 text-xs font-bold text-zinc-700 dark:text-zinc-200">Manual entry</p>
              <div className="space-y-2">
                <input
                  placeholder="Person (e.g. Capt. Shakil)"
                  value={manual.person}
                  onChange={(e) => setManual({ ...manual, person: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                />
                <input
                  placeholder="What they promised"
                  value={manual.commitment}
                  onChange={(e) => setManual({ ...manual, commitment: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                />
                <input
                  placeholder="Deadline (e.g. by Saturday)"
                  value={manual.deadline}
                  onChange={(e) => setManual({ ...manual, deadline: e.target.value })}
                  className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleManualAdd}
                    className="flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 py-2 text-xs font-bold text-white"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowManual(false)}
                    className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {items.length > 0 && (
          <section className="mb-4 flex flex-wrap gap-1.5">
            {(
              [
                ["today", "Today"],
                ["all", "All"],
                ["waiting", "Waiting"],
                ["overdue", "Overdue"],
                ["fulfilled", "Done"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  filter === key
                    ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow"
                    : "bg-white/80 text-zinc-500 dark:bg-zinc-900/80 dark:text-zinc-400"
                )}
              >
                {label}
                <span className="ml-1 opacity-70">{counts[key]}</span>
              </button>
            ))}
          </section>
        )}

        <section className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-indigo-200/60 bg-white/50 py-14 text-center dark:border-indigo-900/40 dark:bg-zinc-900/40">
              <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                {items.length === 0 ? "No commitments yet" : "Nothing in this view"}
              </p>
              <p className="mt-1 text-xs text-zinc-400">Upload audio, paste text, or add manually</p>
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
    </div>
  );
}
