# What Is It Made Of?

Type any physical thing. AI takes it apart layer by layer. How deep can you go?

A recursive teardown explorer: search an object, tap a component to decompose it further — parts become materials, materials become origins — down to depth 6 where you reach bedrock. Built as a shared curiosity game for parents and kids.

## Features

- Natural-language search normalized to physical objects (non-physical input rejected with guidance)
- Structured one-layer-per-request decomposition (5–8 parts), recursive diving with breadcrumbs and collapsible ancestors
- Rare finds, depth celebrations, personal collection and stats (localStorage, no login)
- Shareable threads via deep links (`?dive=a/b/c`) and copyable thread cards
- Curated fallback knowledge base + graceful degradation when live AI is unavailable or over quota

## Getting Started

```bash
npm install
cp .env.example .env.local   # then add your GEMINI_API_KEY (and optionally GROQ_API_KEY as failover)
npm run dev
```

Open `http://localhost:3000`.

## Usage

1. Type an object ("iPhone", "croissant", "Tank") and hit search.
2. Tap any component card to take it apart one layer deeper.
3. Use the breadcrumb to jump back up; `Random` / `Surprise me` for a new thread.
4. `Share` copies the thread link; `Index` shows your souvenir stats.

## Tech Stack

Next.js 15 (App Router) · React 19 · Tailwind CSS · framer-motion · zod · Gemini API (server-side routes only — the key never reaches the browser)

## Known Limitations

- Live decomposition needs `GEMINI_API_KEY`; without it (or when its quota is spent) the app tries `GROQ_API_KEY` if set, then serves curated fallback content.
- API is rate-limited to 20 req/min per IP.
- No accounts or database — history lives in the browser's localStorage.
- Dark-only visual identity, English-only UI.
