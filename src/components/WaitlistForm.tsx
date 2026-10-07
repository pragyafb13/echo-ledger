"use client";

import { useState } from "react";

const WAITLIST_KEY = "echo-ledger-waitlist";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) {
      setError("Enter a valid email");
      return;
    }
    try {
      const existing = JSON.parse(localStorage.getItem(WAITLIST_KEY) || "[]") as string[];
      if (!existing.includes(trimmed)) {
        existing.push(trimmed);
        localStorage.setItem(WAITLIST_KEY, JSON.stringify(existing));
      }
      setDone(true);
      setError(null);
      setEmail("");
    } catch {
      setError("Could not save — try again");
    }
  };

  if (done) {
    return (
      <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        You're on the list. We'll reach out as Pro & reminders ship.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="flex-1 rounded-2xl border border-indigo-100 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      />
      <button
        type="submit"
        className="rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.02]"
      >
        Join waitlist
      </button>
      {error && <p className="w-full text-xs font-semibold text-red-600 sm:order-last">{error}</p>}
    </form>
  );
}
