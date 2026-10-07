# Echo Ledger

**Turn voice into tracked promises.**

Upload a call recording or voice memo → Whisper transcribes it → GPT extracts structured commitments (person, promise, deadline) → you get a clean tracker with status, overdue detection, and one-click mark-done.

## Why it exists

Generic meeting-notes tools dump everything. Echo Ledger only cares about **who committed to what, by when** — the exact lens you need when following up on jobs, sales, freelancing, or family promises.

## Quick start

```bash
cd echo-ledger
cp .env.example .env.local
# paste your OpenAI key into .env.local (optional — demo mode works without it)

npm install
npm run dev
```

Open http://localhost:3000

### Demo mode
Without `OPENAI_API_KEY` the app uses a realistic sample transcript + extraction so you can try the full UI immediately.

### Real mode
With a key:
1. Whisper-1 transcribes any audio you upload or record
2. GPT-4o-mini extracts commitments as structured JSON

## Stack

- Next.js 16 (App Router)
- Tailwind CSS 4
- OpenAI Whisper + GPT-4o-mini
- LocalStorage for persistence (no backend DB needed for MVP)

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
