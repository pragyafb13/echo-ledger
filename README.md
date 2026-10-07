# Echo Ledger

**Never lose a promise again.**

Turn calls, voice notes, and chat into tracked commitments — who promised what, by when.

## Live

https://echo-ledger.vercel.app

## Product

| Surface | URL |
|---------|-----|
| Landing (founder story) | `/` |
| App (Today + capture) | `/app` |
| Register / Login | `/register` · `/login` |
| Pricing | `/pricing` |

### Free plan
- 5 extractions / month
- 1 MB max audio file
- Paste transcript
- Today view + manual add

### Pro (₹399/mo demo unlock)
- Unlimited extractions
- 25 MB files
- Same features + early access path

> Auth & usage are client-side (localStorage) for the MVP business layer. Migrate to Clerk/Supabase + Stripe when you're ready for real multi-device accounts.

## Stack

- Next.js 15 · Tailwind · Groq (free Whisper + LLM) · localStorage accounts

## Env

```
GROQ_API_KEY=gsk_...   # free: console.groq.com
```

## Local

```bash
npm install
npm run dev
```

## Founder note

Built because tracking who-said-what-by-when across job threads and calls was chaos. Echo Ledger is a commitment OS — not another meeting-notes dump.
