# DESIGN.md

<!-- impeccable:design-schema 1 -->

## Visual World

**Daylight workbench.** A parent and kid taking things apart at a bright kitchen table — curiosity as play in daylight. Warm paper ground (`paper`), white work cards (`card`), warm ink text (`ink`). Depth reads as warmth: layer stages run paper → apricot (`--stage-0…5`), so going deeper literally feels warmer. Hairline borders, one soft elevation shadow reserved for overlays, no gradients, no blur-as-decoration, no grain.

## Color Roles (Full palette — every accent has a job)

- `signal` (#FF4D00, fills/dots only) / `signaldeep` (#C74300, text + primary buttons): action and energy. Primary button is `signaldeep` with white text (4.96:1).
- `leaf` (#527A1F): materials and nature (material tags, "Made of" pills read ink; leaf marks material type).
- `pool` (#2F5FC0): reserved for elements and origins (element tags, origin lines at depth).
- Neutrals: `ink` 15–16:1, `soft` 7+:1, `mute` 5+:1 on both grounds — small mono labels stay legible.

## Type Roles (three faces, each necessary)

- **Instrument Serif** (display only): the voice — headlines, object names, celebration numbers. Never UI chrome.
- **Inter Tight** (interface): buttons, body, inputs. The workhorse.
- **JetBrains Mono** (data only): measurements, depth labels, stats, tags. If it isn't data, it isn't mono.

## Component Language

- Work cards: white, 1px `line` hairline, no shadow; hover warms to `tint` + brightens border. Rare finds earn a `signal` border.
- Overlays (share modal, index drawer, banners): white + hairline + one soft offset shadow; light scrims (`paper/85`, `ink/25`).
- Touch: every control ≥ 44px via `.tap` / `.tap-inline`; visual size set by type, not padding.
- Focus: 2px `signaldeep` outline, 2px offset, everywhere — the keyboard path mirrors hover.
- Motion: transform/opacity entrances only, gated behind `useReducedMotion`; reduced-motion swaps the celebration overlay for a static status banner; all pulse/shimmer dies under the reduced-motion guard.

## Copy Discipline

Short labels, no eyebrows that repeat the heading, no hint text where the control is obvious. AI output is terse by contract (descriptions ≤ 12 words, facts ≤ 15) to save tokens and respect small screens.
