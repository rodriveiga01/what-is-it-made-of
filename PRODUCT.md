# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Parents and kids exploring together in casual family moments — co-exploration, not solo study or classroom instruction. The adult operates or co-operates; the child supplies the "I wonder what's inside that?" curiosity.

## Product Purpose

"What Is It Made Of?" lets anyone type any physical thing and take it apart layer by layer: the AI breaks an object into meaningful components, each clickable, each decomposed further on demand — parts becoming materials, materials becoming origins. It exists to turn curiosity about the physical world into a shared exploration game. Success means a finished, impressive showcase piece that a family picks up instantly and a visitor wants to share.

## Positioning

Recursive teardown no one else owns: whole → parts → materials → molecules → atoms → origin, for arbitrary input, with game feel. Competing answers (chatbots, how-it's-made articles, wiki rabbit holes) explain sideways or in walls of text; this product explores downward, one tappable layer at a time, where the exploring itself is the fun.

## Operating Context

Living-room / kitchen-table use on desktop or phone, in short sessions: search an object, dive a few layers together, react to a surprising find, share the thread. No accounts, no onboarding, no curriculum — localStorage holds history and the personal collection. Sharing happens via deep links (`?dive=a/b/c`) and copied thread cards.

## Capabilities and Constraints

- Confirmed functionality: natural-language search normalized to physical objects; structured-AI decomposition one layer per request (5–8 parts); recursive diving to depth 6 with bedrock/origin transition; breadcrumbs and collapsible ancestors; rare finds; depth celebrations; personal collection and stats; shareable threads; curated fallback KB plus generative fallback when live AI is unavailable or over quota.
- Technical constraints: Gemini backend over server-side routes only (key never reaches the browser); structured JSON output validated by schema; 20 req/min/IP rate limit; non-physical input rejected with guidance; no login, no database.
- Terminology: object → components → materials → origin; "depth" counts layers below the root; "rare find" marks surprising origins/scales.
- Explicitly undecided: kid-safety/content-sensitivity review for AI output; whether the current dark adult-leaning visual identity fits the parents-&-kids audience (visual replacement explicitly allowed).

## Brand Commitments

Working name "WIIMO" with a lab-at-night voice (field notes, origin traces, quiet depth celebrations). Neither the name nor the current visual identity is locked — future work may rethink them. The only locked product facts are the recursive teardown loop, the Gemini backend, and instant no-login use.

## Evidence on Hand

- `RESEARCH.md`: Phase-0 market research (competitors, differentiation, ideas incorporated vs. rejected).
- `lib/fallback.ts`: hand-tuned curated teardown KB (pencil, tank, smartphone, motor, copper, etc.).
- Live product in this repo (Next.js 15 + Tailwind + framer-motion + zod); no testimonials, customers, benchmarks, or press — future work must not fabricate any.

## Product Principles

1. Exploring is the product — every click must promise a surprise, never a wall of text.
2. Truthful down, never sideways — decompose (parts → materials → origins), don't drift into trivia.
3. Instant for everyone — no accounts, no empty states, works on first tap for any age.
4. Curiosity over completion — souvenir stats and quiet celebrations, never XP, streaks, or locked depths.
5. Graceful under failure — a missed AI call degrades to curated content, never to an error wall.
