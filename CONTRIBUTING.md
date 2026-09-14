# Contributing

Thanks for stopping by. Small, focused PRs beat big ones.

## Setup

```bash
npm install
cp .env.example .env.local   # add a GEMINI_API_KEY and/or GROQ_API_KEY
npm run dev                  # http://localhost:3000
```

Both keys have free tiers with no credit card (Google AI Studio, console.groq.com). One key is enough to develop.

## Before pushing

```bash
npm run verify   # typecheck + production build — must be green
```

## Where things live

- UI is one client component: `app/page.tsx` (home, explore, dialogs). Keep it that way unless you have a strong reason.
- API cascade: `app/api/decompose/route.ts` → `lib/gemini.ts` / `lib/groq.ts` → validated by `lib/schema.ts`.
- Tokens and theme: `app/globals.css` + `tailwind.config.ts`, documented in `DESIGN.md`.
- Product truth: `PRODUCT.md`. If your change alters behavior the product promises, update it in the same PR.

## Conventions

- **No canned content.** Never hard-code teardown data, fun facts, or copy the AI should generate. Providers can be swapped; invented content cannot.
- **Validate at the boundary.** All model output goes through `sanitizeResponse`. Coerce, don't crash.
- **Fail honestly.** New failure modes surface as retry states, never as plausible-looking filler.
- **Tokens cost money.** Keep prompts short, outputs capped, retries limited to failures that can heal. Hover paths must never spend tokens (see the `prefetch` flag).
- **Accessibility is a gate, not a feature.** Contrast ≥ 4.5:1, 44px targets, keyboard parity with hover, `prefers-reduced-motion` respected. Run through the checklist in `DESIGN.md` for UI changes.
- **Small diffs.** Match existing style; don't rewrite architecture to add a feature.

## Issues & PRs

- Bug reports: what you searched/dived, what you expected, what you saw, and any `[decompose]` lines from the dev terminal.
- PRs: describe the change, how you verified it (`verify` + manual path), and any product-truth impact.
