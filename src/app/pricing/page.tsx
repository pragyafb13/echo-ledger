"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buyPass, getSession, premiumEndsAt } from "@/lib/auth";
import { PASSES, type PassKind, type Session } from "@/lib/types";

function formatUntil(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const CARDS: { kind: PassKind; featured?: boolean; points: string[] }[] = [
  {
    kind: "day",
    points: ["Unlimited extractions for 24 hours", "25 MB max file size", "Expires on its own", "Good for one heavy call day"],
  },
  {
    kind: "month",
    featured: true,
    points: ["Unlimited extractions for 30 days", "25 MB max file size", "Everything in Free", "Renew only if you still need it"],
  },
  {
    kind: "year",
    points: ["Unlimited extractions for 365 days", "25 MB max file size", "₹1,499 instead of ₹4,788", "Best if this is a daily habit"],
  },
];

export default function PricingPage() {
  const [session, setSessionState] = useState<Session | null>(null);
  const [ends, setEnds] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<PassKind | null>(null);

  useEffect(() => {
    const s = getSession();
    setSessionState(s);
    setEnds(s ? premiumEndsAt(s.email) : null);
  }, []);

  const handleBuy = async (kind: PassKind) => {
    setErr(null);
    setMsg(null);
    if (!session) {
      window.location.href = "/register";
      return;
    }
    setBusy(kind);
    try {
      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) {
        throw new Error("Could not load Razorpay checkout");
      }
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || "Could not start payment");

      const pass = PASSES[kind];
      await new Promise<void>((resolve, reject) => {
        const checkout = new window.Razorpay!({
          key: order.keyId,
          amount: order.amount,
          currency: "INR",
          name: "Echo Ledger",
          description: `${pass.label} premium`,
          order_id: order.orderId,
          prefill: { email: session.email, name: session.name },
          theme: { color: "#6366f1" },
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              const verifyRes = await fetch("/api/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  kind,
                }),
              });
              const verified = await verifyRes.json();
              if (!verifyRes.ok) throw new Error(verified.error || "Payment could not be verified");
              const { proUntil } = buyPass(session.email, kind);
              setSessionState({ ...session, plan: "pro", proUntil });
              setEnds(proUntil);
              setMsg(`${pass.label} unlocked until ${formatUntil(proUntil)}.`);
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          modal: { ondismiss: () => resolve() },
        });
        checkout.open();
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50/60 to-fuchsia-50 dark:from-zinc-950 dark:via-indigo-950/30 dark:to-zinc-950">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Link href="/" className="text-sm font-bold text-indigo-600">
          ← Echo Ledger
        </Link>
        <Link href="/app" className="text-xs font-semibold text-zinc-500 hover:text-zinc-800">
          Open app
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">Simple pricing</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Free to start. Premium is ₹49 for a day, ₹399 a month, or ₹1,499 a year. Pay with UPI, card, or netbanking.
          </p>
        </div>

        {msg && (
          <p className="mt-6 rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            {msg}
          </p>
        )}
        {err && (
          <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300">
            {err}
          </p>
        )}
        {ends && !msg && (
          <p className="mt-6 text-center text-xs font-semibold text-indigo-600">
            Premium active until {formatUntil(ends)}
          </p>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Free</h2>
            <p className="mt-1 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              ₹0
              <span className="text-sm font-medium text-zinc-400"> forever</span>
            </p>
            <ul className="mt-5 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>✓ 1 try without an account</li>
              <li>✓ 5 extractions / month after register</li>
              <li>✓ 1 MB max file size</li>
              <li>✓ Today view + tracker</li>
            </ul>
            <Link
              href="/register"
              className="mt-6 block rounded-2xl border border-indigo-200 py-2.5 text-center text-sm font-bold text-indigo-700 dark:border-indigo-700 dark:text-indigo-300"
            >
              Get started
            </Link>
          </div>

          {CARDS.map((card) => {
            const pass = PASSES[card.kind];
            return (
              <div
                key={card.kind}
                className={
                  card.featured
                    ? "rounded-3xl border-2 border-indigo-400 bg-gradient-to-br from-white to-indigo-50/50 p-5 shadow-lg dark:border-indigo-600 dark:from-zinc-900 dark:to-indigo-950/40"
                    : "rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/90"
                }
              >
                {card.featured && (
                  <div className="mb-1 inline-block rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Popular
                  </div>
                )}
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{pass.label}</h2>
                <p className="mt-1 text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                  ₹{pass.priceInr.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-zinc-400">{pass.blurb}</p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {card.points.map((point) => (
                    <li key={point}>✓ {point}</li>
                  ))}
                </ul>
                <button
                  onClick={() => handleBuy(card.kind)}
                  disabled={busy !== null}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 py-2.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] disabled:opacity-60"
                >
                  {busy === card.kind ? "Opening Razorpay…" : `Pay ₹${pass.priceInr.toLocaleString("en-IN")}`}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-[10px] text-zinc-400">
          Payments by Razorpay. Premium unlocks on this device after the payment is verified.
        </p>
      </main>
    </div>
  );
}
