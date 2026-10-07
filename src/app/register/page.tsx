"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await register(email, name, password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.push("/app");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 px-4 dark:from-zinc-950 dark:via-indigo-950/30 dark:to-zinc-950">
      <div className="w-full max-w-sm rounded-3xl border border-white/60 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <Link href="/" className="text-xs font-semibold text-indigo-600">
          ← Echo Ledger
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold text-zinc-900 dark:text-zinc-50">
          Create account
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Free · 5 captures/month · 1 MB files
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-zinc-600">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="you@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-600">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Min 6 characters"
            />
          </div>
          {error && (
            <p className="text-xs font-semibold text-red-600">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 py-2.5 text-sm font-bold text-white shadow-md disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create free account"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
