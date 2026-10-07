import Link from "next/link";
import { WaitlistForm } from "@/components/WaitlistForm";
import { FOUNDER_PHOTO } from "@/lib/founder";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50/60 to-fuchsia-50 dark:from-zinc-950 dark:via-indigo-950/30 dark:to-zinc-950">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-fuchsia-300/30 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="pointer-events-none absolute bottom-40 left-1/3 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
            E
          </div>
          <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-sm font-bold text-transparent">
            Echo Ledger
          </span>
        </div>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/pricing" className="hidden rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-white/60 sm:inline dark:text-zinc-300">
            Pricing
          </Link>
          <Link href="/login" className="rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-white/60 dark:text-zinc-300">
            Log in
          </Link>
          <Link href="/app" className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition hover:scale-105 hover:shadow-lg">
            Open app
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6 sm:pt-16">
        <section className="mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-600 shadow-sm dark:border-violet-800 dark:bg-zinc-900/70 dark:text-violet-400">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            Now live · Premium ₹49 / 24 hrs
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Never lose a promise
            </span>
            <br />
            <span className="text-zinc-900 dark:text-zinc-50">made on a call</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Echo Ledger turns calls, voice notes, and chat into tracked commitments —
            <strong className="font-semibold text-zinc-800 dark:text-zinc-200"> who promised what, by when</strong> —
            so you follow up with clarity every morning.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.03] hover:shadow-xl"
            >
              Start free — 5 captures/month
            </Link>
            <Link
              href="/pricing"
              className="rounded-2xl border border-indigo-200 bg-white/80 px-6 py-3 text-sm font-bold text-indigo-700 transition hover:bg-white dark:border-indigo-700 dark:bg-zinc-900 dark:text-indigo-300"
            >
              Premium ₹49 for 24 hours
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-zinc-400">
            No monthly bill · Day pass expires on its own · Add to home screen on iPhone or Android
          </p>
        </section>

        <section className="mx-auto mt-20 max-w-4xl">
          <h2 className="text-center text-lg font-bold text-zinc-900 dark:text-zinc-50">How it works</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { step: "1", title: "Capture", body: "Upload a call, record a voice memo, or paste a transcript / chat." },
              { step: "2", title: "Extract", body: "AI pulls only real commitments — person, promise, deadline." },
              { step: "3", title: "Follow through", body: "Today view + week strip. Mark done, track overdue, stay clear." },
            ].map((s) => (
              <div key={s.step} className="group rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-xs font-bold text-white shadow-md shadow-indigo-500/30 transition group-hover:scale-110">{s.step}</div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-4xl">
          <h2 className="text-center text-lg font-bold text-zinc-900 dark:text-zinc-50">Built for people who chase follow-ups</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              { title: "Job seekers", body: "HR said they'll confirm by Friday. Don't let it slip." },
              { title: "Freelancers & sales", body: "Client commits, you track — without a heavy CRM." },
              { title: "Founders", body: "Partner promises, vendor deadlines, one calm list." },
              { title: "Anyone juggling people", body: "Family, team, or friends — promises stay visible." },
            ].map((x) => (
              <div key={x.title} className="rounded-2xl border border-indigo-100/80 bg-white/60 px-4 py-3 transition hover:border-indigo-200 hover:bg-white/90 dark:border-zinc-800 dark:bg-zinc-900/60">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{x.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{x.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-3xl border border-indigo-100 bg-white/90 shadow-lg shadow-indigo-500/5 dark:border-zinc-800 dark:bg-zinc-900/90">
          <div className="grid sm:grid-cols-[200px_1fr]">
            <div className="relative min-h-[260px] bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 sm:min-h-full">
              <img src={FOUNDER_PHOTO} alt="Pragya Rajpurohit" className="absolute inset-0 h-full w-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/5" />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">From the founder</p>
              <h2 className="mt-1 text-xl font-bold text-zinc-900 dark:text-zinc-50">Pragya Rajpurohit</h2>
              <p className="mt-0.5 text-xs text-zinc-500">Founder, Echo Ledger</p>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                <p>I built Echo Ledger because too many important promises disappear the moment a call ends.</p>
                <p>In meetings, client calls, and team stand-ups we say things like “I’ll send that by Friday” or “I’ll follow up next week.” Then the recording sits in a folder, the chat moves on, and the commitment quietly fades.</p>
                <p>I wanted a simple habit: drop the voice note or paste the transcript, and instantly see who committed to what — and by when. No complicated CRM. Just a clear ledger of promises you can actually keep track of.</p>
                <p>Echo Ledger is for professionals who live on calls and still want to show up for the people who matter. I’m building it in public so it stays useful, honest, and human.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-lg text-center">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Want reminders first?</h2>
          <p className="mt-2 text-sm text-zinc-500">Join the waitlist for email nudges, calendar export, and team ledgers.</p>
          <div className="mt-5"><WaitlistForm /></div>
        </section>

        <section className="mx-auto mt-16 max-w-xl rounded-3xl border border-white/60 bg-white/70 p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Simple pricing</p>
          <p className="mt-2 text-xs text-zinc-500">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Free</span> — 5 extractions/mo · 1 MB
            {" · "}
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Premium ₹49 / 24 hours</span> — unlimited · 25 MB
          </p>
          <Link href="/pricing" className="mt-4 inline-block text-xs font-bold text-indigo-600 transition hover:underline">See full pricing →</Link>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/40 py-8 text-center text-[11px] text-zinc-400">
        <span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text font-medium text-transparent">Echo Ledger</span>
        {" · Built by Pragya Rajpurohit · "}
        <Link href="/app" className="hover:text-indigo-500">Open app</Link>
      </footer>
    </div>
  );
}
