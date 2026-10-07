"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buyDayPass, getSession, premiumEndsAt } from "@/lib/auth";
import { DAY_PASS_PRICE_INR } from "@/lib/types";
import type { Session } from "@/lib/types";

function formatUntil(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PricingPage() {
  const [session, setSessionState] = useState<Session | null>(null);
  const [ends, setEnds] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const s = getSession();
    setSessionState(s);
    setEnds(s ? premiumEndsAt(s.email) : null);
  }, []);

  const handleDayPass = () => {
    if (!session) {
      window.location.href = "/register";
      return;
    }
    const { proUntil } = buyDayPass(session.email);
    setSessionState({ ...session, plan: "pro", proUntil });
    setEnds(proUntil);
    setMsg(`Day pass active until ${formatUntil(proUntil)}. Unlimited for 24 hours.`);
  };

  const active = session?.plan === "pro" && !!ends;

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
            Start free. Need a busy day? Premium is ₹{DAY_PASS_PRICE_INR} for 24 hours.
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
              <span className="text-sm font-medium text-zinc-400"> forever</span>
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
              Day pass
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Premium · 24 hours</h2>
            <p className="mt-1 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              ₹{DAY_PASS_PRICE_INR}
              <span className="text-sm font-medium text-zinc-400"> / 24 hrs</span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>✓ Unlimited extractions for 24 hours</li>
              <li>✓ 25 MB max file size</li>
              <li>✓ Everything in Free</li>
              <li>✓ Expires automatically — no monthly bill</li>
              <li>✓ Buy again any time you have a heavy call day</li>
            </ul>
            <button
              onClick={handleDayPass}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.02]"
            >
              {active ? "Extend another 24 hours" : `Get Premium · ₹${DAY_PASS_PRICE_INR}`}
            </button>
            <p className="mt-2 text-center text-[10px] text-zinc-400">
              {active
                ? `Active until ${formatUntil(ends!)}`
                : "Demo unlock in this browser. UPI / Razorpay checkout is next."}
            </p>
          </div>
        </div>

        <section className="mx-auto mt-10 max-w-xl rounded-3xl border border-white/70 bg-white/80 p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-50">Use it on your phone — free</h2>
          <p className="mt-2 text-xs leading-relaxed">
            Echo Ledger is a web app. On iPhone: Safari → Share → Add to Home Screen. On Android: Chrome → menu → Install app / Add to Home screen. That puts an icon on your phone with no store fee.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Google Play and the Apple App Store are not free to publish. Play is a one-time $25 developer account. Apple is $99 per year, and the app must be a native or wrapped build reviewed by Apple. I can’t list it there without those accounts.
          </p>
        </section>
      </main>
    </div>
  );
}
