# Echo Ledger

**Turn voice into tracked promises.**

Upload a call recording or voice memo → Whisper transcribes it → GPT extracts structured commitments (who, what, by when) → you get a colorful tracker with status, overdue detection, and one-click mark-done.

## Why it exists

Generic meeting-notes tools dump everything. Echo Ledger only cares about **who committed to what, by when** — the exact lens you need when following up on jobs, sales, freelancing, or family promises.

## Live demo

Deployed on Vercel from this repo. Works in **demo mode** without an API key.

## Quick start (local)

```bash
git clone https://github.com/pragyafb13/echo-ledger.git
cd echo-ledger
cp .env.example .env.local
# optional: paste OPENAI_API_KEY into .env.local

npm install
npm run dev
```

Open http://localhost:3000

### Demo mode
Without `OPENAI_API_KEY` the app uses a realistic sample transcript + extraction so you can try the full UI immediately.

### Real mode
Add your key in `.env.local` (local) or Vercel → Project → Settings → Environment Variables:

```
OPENAI_API_KEY=sk-...
```

Then:
1. **Whisper-1** transcribes any audio you upload or record
2. **GPT-4o-mini** extracts commitments as structured JSON

## Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `pragyafb13/echo-ledger`
3. (Optional) Add `OPENAI_API_KEY` under Environment Variables
4. Click **Deploy**

Redeploy with **Use existing Build Cache** turned **off** after big dependency changes.

## Stack

- Next.js 16 (App Router)
- Tailwind CSS 3 + PostCSS
- OpenAI Whisper + GPT-4o-mini
- LocalStorage persistence (no DB for MVP)

## Features

- Drag-and-drop audio upload + live mic recording
- Automatic commitment extraction (person, promise, deadline, context)
- Casual deadline parsing (`by Saturday`, `end of the week`, `couple of days`…)
- Status tracking: Waiting · Overdue · Fulfilled · Cancelled
- Auto-flip to Overdue when a deadline passes
- Colorful gradient UI with motion

## Project structure

```
src/
  app/
    api/transcribe/route.ts   # Whisper
    api/extract/route.ts      # Commitment extraction
    page.tsx                  # Main UI
  components/
    UploadPanel.tsx           # Drag-drop + live record
    CommitmentCard.tsx        # Status, actions
  lib/
    types.ts
    storage.ts                # localStorage helpers
    utils.ts                  # deadline parsing, status colors
```

## Roadmap ideas

- Browser notifications when a deadline passes
- WhatsApp / email forward-in
- Multi-user / team ledgers
- Export to Notion / Linear

---

Built with the spirit of removing daily friction.
