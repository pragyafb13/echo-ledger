"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSession, upgradeToPro } from "@/lib/auth";
import type { Session } from "@/lib/types";

export default function PricingPage() {
  const [session, setSessionState] = useState<Session | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    setSessionState(getSession());
  }, []);

  const handleUpgrade = () => {
    if (!session) {
      window.location.href = "/register";
      return;
    }
    upgradeToPro(session.email);
    setSessionState({ ...session, plan: "pro" });
    setMsg("You're on Pro! Unlimited extractions unlocked.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50/60 to-fuchsia-50 dark:from-zinc-950 dark:via-indigo-950/30 dark:to-zinc-950">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-sm font-bold text-indigo-600">
          ← Echo Ledger
        </Link>
        <Link href="/app" className="text-xs font-semibold text-zinc-500 hover:text-zinc-800">
          Open app
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Simple pricing
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Start free. Upgrade when commitments become daily habit.
          </p>
        </div>

        {msg && (
          <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {msg}
          </p>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Free</h2>
            <p className="mt-1 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              ₹0
              <span className="text-sm font-medium text-zinc-400">/mo</span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>✓ 5 extractions / month</li>
              <li>✓ 1 MB max file size</li>
              <li>✓ Paste transcript</li>
              <li>✓ Today view + tracker</li>
              <li>✓ Manual add commitment</li>
            </ul>
            <Link
              href="/register"
              className="mt-6 block rounded-2xl border border-indigo-200 py-2.5 text-center text-sm font-bold text-indigo-700 dark:border-indigo-700 dark:text-indigo-300"
            >
              Get started
            </Link>
          </div>

          <div className="rounded-3xl border-2 border-indigo-400 bg-gradient-to-br from-white to-indigo-50/50 p-6 shadow-lg dark:border-indigo-600 dark:from-zinc-900 dark:to-indigo-950/40">
            <div className="mb-1 inline-block rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Pro
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Pro</h2>
            <p className="mt-1 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              ₹399
              <span className="text-sm font-medium text-zinc-400">/mo</span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>✓ Unlimited extractions</li>
              <li>✓ 25 MB max file size</li>
              <li>✓ Everything in Free</li>
              <li>✓ Priority AI models</li>
              <li>✓ Early access to reminders</li>
            </ul>
            <button
              onClick={handleUpgrade}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.02]"
            >
              {session?.plan === "pro" ? "Already Pro" : "Upgrade to Pro"}
            </button>
            <p className="mt-2 text-center text-[10px] text-zinc-400">
              Demo billing — unlocks Pro in this browser. Stripe coming next.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
