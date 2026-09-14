# WHAT IS IT MADE OF? — Internal Research Doc (Phase 0)

## 1. Existing products
- **HowStuffWorks / ExplainThatStuff / How It's Made**: truthful, huge SEO, but static, ad-choked, paginated, passive. No recursion, no choice.
- **Wikipedia rabbit hole / Wikiracing**: original recursive exploration; blue-link itch is addictive. But links go sideways not downwards, walls of text, no decomposition logic.
- **Brilliant / Khanmigo**: gold-standard interactive learning (predict-then-reveal, Socratic), but closed curriculum, chat-box-as-product feels like school, no "type anything".
- **Infinite Craft / Little Alchemy**: closest competitor. 1-click combine, surprise, First Discovery badge = viral. But synthesis (up) not analysis (down), illogical/funny not truthful, no depth/explanation.
- **Obsidian Canvas / Graph tools**: externalized nodes = 2x longer exploration, but empty-canvas anxiety, power-user fiddly, desktop-only.
- **Collection games (Pokédex, Duolingo, Wiki Game daily)**: completionism + streaks + optimal-path score drive return. Not yet applied to real-world materials knowledge.

## 2. Strengths to borrow
- Infinite Craft: <2s feedback, always surprise, First Discovery fame
- Wiki blue-link itch: every noun looks clickable, no dead ends
- Brilliant predict-then-reveal; Khanmigo auto-diagram when text fails
- Obsidian branch/zoom; Prezi-style zoom-out map + breadcrumb trail
- Wikiracer daily shared route + optimal path; Pokédex "caught N" collection
- How It's Made visceral factory loop (6-sec process clip > text)

## 3. Weaknesses / boring
Long articles, pagination, ads, linear chat Q&A, curriculum gating, empty canvas, factory-sim complexity, quiz-as-loop, fake precision, generic "screen/battery/chip" lists with no numbers.

## 4. Magical
Typing ANYTHING ("grandma's dentures", "lightsaber", "boba tea") and it works; object shattering into orbiting chips; going 7 deep to atoms/stardust; rare find ("phone contains neodymium from Bayan Obo"); shareable weird tree.

## 5. Gap / differentiation
Nobody does **truthful recursive decomposition for arbitrary input with game feel**.
Thesis: own "decomposition" as verb — **down not sideways** (whole → parts → materials → molecules → atoms → origin). Compete on *exploration*, not answers. Every click must have 1 number + 1 why. Depth 3+ diverges to origin/process/story, never converges to same "plastic/atoms" dead-end.

## 6. Ideas TO incorporate (shipped in MVP)
1. Shatter/staggered reveal ("Taking it apart..." not "Loading...")
2. Disassembly Column: stacked layers + spatial cards + sticky hero + breadcrumb/minimap
3. Depth names (Object→Components→Materials→Molecules→Atoms→Origin) + scale bar
4. Exploration thread (tappable path, unique-path copy)
5. Cabinet of Curiosities (localStorage Pokédex, per-object % to trigger Zeigarnik)
6. Rare Finds (Deep Time / Human Touch / Scale, max 1/depth, gold hairline — no confetti)
7. Depth celebrations (quiet interstitials, "11% reach this deep")
8. Curiosity Index (souvenir stats, no leaderboard/XP)
9. Share thread card + deep link (?dive=a/b/c) with blurred unopened siblings
10. Origin transition at depth≥3 ("You're past ingredients, into origins")

## 7. Things explicitly NOT to copy / NOT build
1. HowStuffWorks pagination/ads/SEO bloat; textbook tone >2 sentences/node
2. Chat-box-as-product (no bubbles, no "Ask AI", no typing dots)
3. Infinite Craft randomness/false recipes — label speculation, ranges not fake precision
4. Obsidian empty canvas + manual layout — auto-layout by default
5. XP/coins/gems, confetti mascots, streak threats, leaderboards, locked depth, badge spam
6. No auth/DB, no free chat, no infinite atom recursion, no 3D/AR, no UGC/comments, no i18n/voice/image-upload, no admin CMS
7. No purple-blue gradients, glassmorphism-everywhere, rounded-3xl SaaS cards, Inter-only template look

## 8. Visual direction (2026 lab-at-night)
Tokens: --void #080908, --ink #0F100F, --panel #141513, --line-soft rgba(237,231,223,.08), --bone #EDE7DB, --faded #A8A39A, --signal #FF4D00 (single accent). Serif display (Instrument Serif) + Sans (Inter Tight) + Mono (JetBrains Mono, uppercase labels). Sharp radii (3/6/10/14), 1px hairlines, grain+vignette, transform/opacity-only motion, 750ms cinematic dive, reduced-motion fallback.

## 9. AI architecture
Server-only GEMINI_API_KEY, POST /api/decompose {query, path[], depth}. gemini-2.0-flash, responseMimeType application/json + responseSchema, temp 0.35, one layer (5-8 children) per request with full ancestry. Zod validation, dedup, denylist (process/molding...), 1 repair retry, safe fallback. Depth bias: D0-1 assemblies, D2-3 mix+materials, D4+ materials/elements+originHint. Terminal/element → provenance prompt (mine→ore→refined→element). Cache key v1:depth:root>...>target, server LRU + client localStorage + in-flight dedup. Rate-limit 20/min/IP.

## 10. MVP scope
Landing (1 question + search + starters), search normalize, recursive explore (cap depth 6), breadcrumbs+URL, loading/error/leaf states, history + collection + share, responsive mobile-first (cards → bottom sheet). Test: pencil, pen, shredder, smartphone, motorcycle, tank, airplane, battery, coffee machine, keyboard + weird inputs.
