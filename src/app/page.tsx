import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50/60 to-fuchsia-50 dark:from-zinc-950 dark:via-indigo-950/30 dark:to-zinc-950">
      <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-64 w-64 rounded-full bg-fuchsia-300/30 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-bold text-white">
            E
          </div>
          <span className="bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-sm font-bold text-transparent">
            Echo Ledger
          </span>
        </div>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/pricing" className="rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-white/60 dark:text-zinc-300">
            Pricing
          </Link>
          <Link href="/login" className="rounded-xl px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-white/60 dark:text-zinc-300">
            Log in
          </Link>
          <Link href="/app" className="rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-md">
            Open app
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-16">
        <section className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
            Commitment OS for everyday life
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              Never lose a promise
            </span>
            <br />
            <span className="text-zinc-900 dark:text-zinc-50">again</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Echo Ledger turns calls, voice notes, and chat into tracked commitments —
            who promised what, by when — so you follow up with clarity every morning.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.03]"
            >
              Start free — 5 captures/month
            </Link>
            <Link
              href="/app"
              className="rounded-2xl border border-indigo-200 bg-white/80 px-6 py-3 text-sm font-bold text-indigo-700 dark:border-indigo-700 dark:bg-zinc-900 dark:text-indigo-300"
            >
              Try without account
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            {
              title: "Capture",
              body: "Upload audio, record live, or paste a transcript. AI extracts only real commitments.",
              color: "from-indigo-500 to-violet-500",
            },
            {
              title: "Today view",
              body: "Wake up to overdue, due today, and waiting — your personal follow-up inbox.",
              color: "from-violet-500 to-fuchsia-500",
            },
            {
              title: "Follow through",
              body: "Mark done, cancel, or track until the deadline. Keep every promise in sight.",
              color: "from-fuchsia-500 to-rose-500",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70"
            >
              <div className={`mb-3 h-1.5 w-10 rounded-full bg-gradient-to-r ${f.color}`} />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-16 max-w-2xl rounded-3xl border border-indigo-100 bg-white/80 p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
            Built by a founder who lived the problem
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Job threads, sales follow-ups, family promises — tracking who said what by when
            across chats and calls was chaos. Echo Ledger is the calm ledger of commitments
            I needed every morning — not another dump of meeting notes.
          </p>
          <p className="mt-4 text-xs font-semibold text-violet-600 dark:text-violet-400">
            — Founder, Echo Ledger
          </p>
        </section>

        <section className="mx-auto mt-12 max-w-xl text-center">
          <p className="text-sm text-zinc-500">
            Free: 5 extractions / month · 1 MB files ·{" "}
            <Link href="/pricing" className="font-semibold text-indigo-600 hover:underline">
              See Pro
            </Link>
          </p>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/40 py-8 text-center text-[11px] text-zinc-400">
        <span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text font-medium text-transparent">
          Echo Ledger
        </span>
        {" · Keep every promise in sight"}
      </footer>
    </div>
  );
}
