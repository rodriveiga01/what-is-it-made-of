"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useDecompose, type Layer } from "@/hooks/useDecompose";
import {
  loadProgress,
  saveProgress,
  recordThread,
  type Progress,
} from "@/lib/store";
import type { DecompComponent } from "@/lib/schema";

/* ---------------- constants ---------------- */

const STARTERS = ["Tank", "iPhone", "Pencil", "Espresso Machine", "Motorcycle", "Battery"];
const RANDOM_POOL = [
  "Tank", "Pencil", "Ballpoint Pen", "Paper Shredder", "Smartphone", "Motorcycle",
  "Airliner", "Lithium-Ion Battery", "Espresso Machine", "Mechanical Keyboard",
  "Electric Motor", "Bicycle", "Toaster", "Wristwatch", "Headphones", "Camera",
  "Refrigerator", "Sneaker", "Nuclear Reactor", "Diesel Engine", "Guitar", "Microwave",
];
const ALSO = ["Toilet", "Camera", "Sneaker", "Guitar", "Toaster", "Headphones"];
const MAX_DEPTH = 6;

const DEPTH_NAMES = ["OBJECT", "COMPONENTS", "PARTS + MATERIALS", "MATERIALS", "MOLECULES", "ATOMS", "BEDROCK"];
const SCALES = ["1 m", "10 cm", "1 cm", "1 mm", "1 µm", "1 nm", "atoms"];
const LOADING_LINES = [
  "Taking it apart...",
  "Sorting materials...",
  "Tracing origins...",
];

const depthName = (d: number) => DEPTH_NAMES[Math.min(d, DEPTH_NAMES.length - 1)];

/* ---------------- tiny icon set ---------------- */

function Glyph({ kind }: { kind: string }) {
  const common = "w-5 h-5 shrink-0";
  switch (kind) {
    case "gear":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" />
        </svg>
      );
    case "motor":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="4" y="7" width="13" height="10" rx="2" />
          <path d="M17 10h2.5v4H17M7 10v4M7 13.5h6" />
        </svg>
      );
    case "blade":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M4 20L14 10M14 10l-2-6 6 2-4 4zM14 10l4 4" />
        </svg>
      );
    case "circuit":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="7" y="7" width="10" height="10" rx="1.5" />
          <path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3" />
        </svg>
      );
    case "wire":
    case "coil":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M4 16c2-6 4-6 6 0s4 6 6 0 3-4 4-2" />
        </svg>
      );
    case "sensor":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="1.6" />
          <path d="M8.5 8.5a5 5 0 000 7M15.5 8.5a5 5 0 010 7M6 6a8.5 8.5 0 000 12M18 6a8.5 8.5 0 010 12" />
        </svg>
      );
    case "power":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="7" y="3" width="10" height="18" rx="2" />
          <path d="M11 7h2v4H9l4 6h-2" />
        </svg>
      );
    case "gem":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M7 4h10l4 6-9 10L3 10l4-6zM3 10h18M12 20L9 10l3-6 3 6-3 10" />
        </svg>
      );
    case "glass":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M6 3h12l-2 8v6l-4 4-4-4v-6L6 3zM8.5 14h7" />
        </svg>
      );
    case "wood":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M4 17c3-1 4-8 7-8s3 5 6 4 3-4 3-4M4 20h16" />
        </svg>
      );
    case "liquid":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z" />
        </svg>
      );
    case "tube":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M4 8h16v8H4zM7 8v8M17 8v8" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={common} fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M4 12h16M12 4v16" />
        </svg>
      );
  }
}

/* ---------------- small atoms ---------------- */

function TypeTag({ t }: { t: DecompComponent["type"] }) {
  const map: Record<string, string> = {
    assembly: "text-ink border-line-strong",
    component: "text-soft border-line",
    material: "text-leaf border-leaf/35",
    element: "text-pool border-pool/30",
  };
  return (
    <span className={`font-mono-l text-[10px] uppercase tracking-[0.12em] border rounded-xs px-1.5 py-0.5 ${map[t] ?? map.component}`}>
      {t}
    </span>
  );
}

function RarityDot({ r }: { r: DecompComponent["rarity"] }) {
  if (r === "common") return null;
  return (
    <span
      className={`font-mono-l text-[10px] uppercase tracking-[0.12em] ${
        r === "rare" ? "text-signaldeep" : "text-soft"
      }`}
    >
      {r === "rare" ? "● rare find" : "○ uncommon"}
    </span>
  );
}

/* ---------------- main app ---------------- */

export default function Page() {
  const { fetchLayer } = useDecompose();
  const [input, setInput] = useState("");
  const [homeError, setHomeError] = useState<string | null>(null);
  const [exploreError, setExploreError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [path, setPath] = useState<string[]>([]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [pending, setPending] = useState<{ target: string } | null>(null);
  const [loadingLine, setLoadingLine] = useState(0);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [celebration, setCelebration] = useState<{ title: string; sub: string; depth: number } | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [indexOpen, setIndexOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const bootRef = useRef(false);
  /* Hover-intent prefetch timers: avoids firing a request (and burning the
   * API rate-limit) for every card the cursor merely passes over. */
  const prefetchTimers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  /* prefers-reduced-motion: entrances become instant, overlays static —
   * state changes still render, motion just doesn't animate them. */
  const reduceMotion = useReducedMotion();
  const instant = (d: number) => (reduceMotion ? 0 : d);

  const queuePrefetch = useCallback(
    (name: string, ancestry: string[]) => {
      const key = `${ancestry.join(">")}>${name}`.toLowerCase();
      if (prefetchTimers.current.has(key)) return;
      const id = setTimeout(() => {
        prefetchTimers.current.delete(key);
        // Token-free by contract: the server serves cache/curated/instant
        // content for prefetch and never calls a live provider.
        fetchLayer(name, ancestry, { prefetch: true }).catch(() => {});
      }, 350);
      prefetchTimers.current.set(key, id);
    },
    [fetchLayer],
  );

  const cancelPrefetch = useCallback((name: string, ancestry: string[]) => {
    const key = `${ancestry.join(">")}>${name}`.toLowerCase();
    const id = prefetchTimers.current.get(key);
    if (id) {
      clearTimeout(id);
      prefetchTimers.current.delete(key);
    }
  }, []);

  const depth = path.length - 1;
  const exploring = path.length > 0;

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  /* rotating loading copy */
  useEffect(() => {
    if (!pending && !searching) return;
    setLoadingLine(0);
    const id = setInterval(() => setLoadingLine((l) => (l + 1) % LOADING_LINES.length), 1300);
    return () => clearInterval(id);
  }, [pending, searching]);

  /* celebration auto-dismiss */
  useEffect(() => {
    if (!celebration) return;
    const id = setTimeout(() => setCelebration(null), 2600);
    return () => clearTimeout(id);
  }, [celebration]);

  /* ESC closes overlays */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShareOpen(false);
        setIndexOpen(false);
        setCelebration(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Dialog focus management: move focus in on open, trap Tab inside,
   * restore focus to the invoker on close. One hook per overlay. */
  const lastInvoker = useRef<HTMLElement | null>(null);
  const shareDialogRef = useRef<HTMLDivElement | null>(null);
  const indexDialogRef = useRef<HTMLDivElement | null>(null);
  const celebDialogRef = useRef<HTMLDivElement | null>(null);

  const useDialogFocus = (open: boolean, ref: React.RefObject<HTMLDivElement | null>) => {
    useEffect(() => {
      if (!open) return;
      lastInvoker.current = document.activeElement as HTMLElement | null;
      const node = ref.current;
      // Focus heading first (tabIndex -1), fall back to container.
      const target =
        node?.querySelector<HTMLElement>("[data-dialog-title]") ?? node;
      target?.focus();
      return () => {
        lastInvoker.current?.focus?.();
        lastInvoker.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);
  };
  useDialogFocus(shareOpen && exploring, shareDialogRef);
  useDialogFocus(indexOpen, indexDialogRef);
  useDialogFocus(celebration !== null && !reduceMotion, celebDialogRef);

  const trapTab = useCallback((e: React.KeyboardEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    if (e.key !== "Tab" || !ref.current) return;
    const items = ref.current.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])',
    );
    const list = [...items].filter((el) => !el.hasAttribute("disabled"));
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const maybeCelebrate = useCallback(
    (newDepth: number, newBest: boolean, p: Progress) => {
      const next = { ...p, celebrated: { ...p.celebrated } };
      let c: { title: string; sub: string; depth: number } | null = null;
      if (newDepth >= 4 && !next.celebrated.d4) {
        next.celebrated.d4 = true;
        next.celebrated.d2 = true;
        c = { title: `Depth ${newDepth}`, sub: "Smaller than a cell now.", depth: newDepth };
      } else if (newDepth >= 2 && !next.celebrated.d2) {
        next.celebrated.d2 = true;
        c = { title: "You went deeper", sub: "Past the surface, into what it's made of.", depth: newDepth };
      } else if (newBest && newDepth >= 2) {
        c = { title: "New personal depth", sub: `${newDepth} layers deep.`, depth: newDepth };
      }
      if (c) setCelebration(c);
      return next;
    },
    [],
  );

  const startSearch = useCallback(
    async (raw: string) => {
      const q = raw.trim();
      if (!q || searching) return;
      setHomeError(null);
      setExploreError(null);
      setSearching(true);
      setSearchQuery(q);
      try {
        const layer = await fetchLayer(q, []);
        if (layer.failed) {
          const msg = layer.failMessage || "We couldn't take this one apart. Try another object.";
          // Surface the error wherever the user currently is.
          setHomeError(msg);
          setExploreError(msg);
          return;
        }
        setLayers([layer]);
        setPath([layer.normalizedName]);
        setInput("");
        setExploreError(null);
        setProgress((p) => {
          if (!p) return p;
          const { next, newBest } = recordThread(p, [layer.normalizedName], []);
          const celebrated = maybeCelebrate(0, newBest, next);
          saveProgress(celebrated);
          return celebrated;
        });
        window.history.replaceState(null, "", window.location.pathname);
      } finally {
        setSearching(false);
        setSearchQuery("");
      }
    },
    [fetchLayer, maybeCelebrate, searching],
  );

  const dive = useCallback(
    async (comp: DecompComponent, fromIdx: number) => {
      if (pending) return;
      const ancestry = path.slice(0, fromIdx + 1);
      if (ancestry.length >= MAX_DEPTH + 1) return;
      // truncate to branch point
      setLayers((prev) => prev.slice(0, fromIdx + 1));
      setPath((prev) => prev.slice(0, fromIdx + 1));
      setPending({ target: comp.name });
      try {
        const layer = await fetchLayer(comp.name, ancestry);
        if (layer.failed) {
          setLayers((prev) => [...prev, { ...layer, parentDescription: comp.description }]);
          setPath((prev) => [...prev, comp.name]);
          return;
        }
        // attach parent description by rebuilding ancestry correctly
        const full: Layer = { ...layer, ancestry, parentDescription: comp.description };
        setLayers((prev) => [...prev, full]);
        const fullPath = [...ancestry, layer.normalizedName];
        setPath(fullPath);
        setProgress((p) => {
          if (!p) return p;
          const rareIds = comp.rarity === "rare" ? [fullPath.join(">").toLowerCase()] : [];
          const { next, newBest } = recordThread(p, fullPath, rareIds);
          const celebrated = maybeCelebrate(fullPath.length - 1, newBest, next);
          saveProgress(celebrated);
          return celebrated;
        });
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?dive=${encodeURIComponent(fullPath.join("/"))}`,
        );
      } finally {
        setPending(null);
      }
    },
    [fetchLayer, maybeCelebrate, path, pending],
  );

  const retryTop = useCallback(async () => {
    const top = layers[layers.length - 1];
    if (!top || pending) return;
    setPending({ target: top.query });
    try {
      // Failed layers are never cached client-side, so a single re-request
      // is a genuine fresh attempt (server cache only holds successes).
      const fresh = await fetchLayer(top.query, top.ancestry);
      if (!fresh.failed) {
        setLayers((prev) => [...prev.slice(0, -1), { ...fresh, parentDescription: top.parentDescription }]);
        setPath((prev) => [...prev.slice(0, -1), fresh.normalizedName]);
      } else {
        setExploreError(fresh.failMessage || "Retry failed — the instrument slipped again.");
      }
    } finally {
      setPending(null);
    }
  }, [fetchLayer, layers, pending]);

  const jumpTo = useCallback(
    (i: number) => {
      if (pending) return;
      setLayers((prev) => prev.slice(0, i + 1));
      setPath((prev) => {
        const next = prev.slice(0, i + 1);
        window.history.replaceState(
          null,
          "",
          next.length > 1
            ? `${window.location.pathname}?dive=${encodeURIComponent(next.join("/"))}`
            : window.location.pathname,
        );
        return next;
      });
    },
    [pending],
  );

  const goHome = useCallback(() => {
    setPath([]);
    setLayers([]);
    setPending(null);
    setHomeError(null);
    setExploreError(null);
    setSearchQuery("");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const surprise = useCallback(() => {
    const pick = RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)];
    if (exploring) {
      goHome();
      setTimeout(() => startSearch(pick), 60);
    } else {
      startSearch(pick);
    }
  }, [exploring, goHome, startSearch]);

  /* boot: restore shared dive link */
  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const diveParam = params.get("dive");
    if (!diveParam) return;
    const names = diveParam.split("/").map((s) => decodeURIComponent(s.trim())).filter(Boolean).slice(0, MAX_DEPTH + 1);
    if (names.length === 0) return;
    (async () => {
      setSearching(true);
      try {
        const acc: Layer[] = [];
        const accPath: string[] = [];
        for (const name of names) {
          const layer = await fetchLayer(name, [...accPath]);
          if (layer.failed) break;
          const parentComp = acc.length
            ? acc[acc.length - 1].components.find(
                (x) => x.name.toLowerCase() === layer.normalizedName.toLowerCase() || x.name.toLowerCase() === name.toLowerCase(),
              )
            : undefined;
          acc.push(parentComp ? { ...layer, ancestry: [...accPath], parentDescription: parentComp.description } : { ...layer, ancestry: [...accPath] });
          accPath.push(layer.normalizedName);
        }
        if (acc.length) {
          setLayers(acc);
          setPath(accPath);
        } else {
          setHomeError("That shared thread couldn't be rebuilt. Try taking something apart fresh.");
        }
      } finally {
        setSearching(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shareUrl = useMemo(() => {
    if (!exploring || typeof window === "undefined") return "";
    return `${window.location.origin}${window.location.pathname}?dive=${encodeURIComponent(path.join("/"))}`;
  }, [exploring, path]);

  const copyShare = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }, []);

  const threadText = useMemo(() => {
    if (!exploring) return "";
    return `WHAT IS IT MADE OF?\nI took apart ${path[0]} ${depth} layer${depth === 1 ? "" : "s"} deep:\n\n${path.join(" → ")}\n\nCan you go deeper?\n${shareUrl}`;
  }, [exploring, path, depth, shareUrl]);

  const stats = useMemo(() => {
    if (!progress) return null;
    const realm = (() => {
      const d = progress.discoveries;
      const keys = Object.keys(d);
      if (!keys.length) return "—";
      const small = keys.filter((k) => /carbon|lithium|silicon|copper|iron|atom|element|quartz|cellulose|glucose/.test(k)).length;
      return small / keys.length > 0.4 ? "the invisible (molecules + atoms)" : "the tangible (parts + machines)";
    })();
    return {
      objects: progress.totalObjects,
      specimens: Object.keys(progress.discoveries).length,
      rares: progress.rareFinds.length,
      deepest: progress.deepest,
      deepestThread: progress.deepestThread,
      realm,
    };
  }, [progress]);

  return (
    <div className="min-h-screen">
      {/* ---------- top bar ---------- */}
      <header className="flex items-center justify-between px-5 md:px-8 py-4 max-w-[1280px] mx-auto">
        <button onClick={goHome} className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.14em] text-ink hover:text-signaldeep transition-colors">
          WIIMO <span className="text-signal">●</span>
        </button>
        <div className="flex items-center gap-5">
          {stats && stats.objects > 0 && (
            <span className="font-mono-l text-[11px] uppercase tracking-[0.14em] text-mute hidden sm:inline">
              {stats.objects} objects · {stats.specimens} specimens
            </span>
          )}
          <button onClick={surprise} className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.14em] text-soft hover:text-ink transition-colors">
            Random
          </button>
          <button onClick={() => setIndexOpen(true)} className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.14em] text-soft hover:text-ink transition-colors">
            Index
          </button>
        </div>
      </header>

      {!exploring ? (
        /* ================= HOME ================= */
        <main className="max-w-[1280px] mx-auto px-5 md:px-8">
          <div className="min-h-[72vh] flex flex-col items-center justify-center text-center">
            <h1 className="font-serif-d leading-[0.95] tracking-[-0.02em] text-ink" style={{ fontSize: "clamp(48px, 8vw, 110px)" }}>
              <span className="text-soft">What do you want to</span>
              <br />
              <em>take apart?</em>
            </h1>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                startSearch(input);
              }}
              className="search-underline w-full max-w-[640px] mt-10 flex items-center gap-3 pb-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Try "iPhone" or "croissant"...'
                aria-label="What do you want to take apart?"
                autoFocus
                enterKeyHint="search"
                className="flex-1 bg-transparent font-serif-d italic text-2xl placeholder:text-mute text-ink"
              />
              <button
                type="submit"
                aria-label="Take apart"
                className="tap font-mono-l text-xl text-soft hover:text-signaldeep transition-colors px-2"
              >
                →
              </button>
            </form>

            {searching && (
              <p className="font-mono-l text-[11px] uppercase tracking-[0.18em] text-soft mt-6 animate-pulse">
                {LOADING_LINES[loadingLine]}
              </p>
            )}
            {homeError && (
              <div className="mt-6 max-w-[520px] hairline rounded-md bg-card px-5 py-4">
                <p className="text-[15px] text-ink">{homeError}</p>
                <div className="flex gap-4 mt-3 justify-center">
                  <button onClick={() => startSearch(input || "Toaster")} className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.14em] text-signaldeep">
                    Try again
                  </button>
                  <button onClick={surprise} className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.14em] text-soft">
                    Surprise me
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {STARTERS.map((s, i) => (
                <button
                  key={s}
                  onClick={() => startSearch(s)}
                  className="tap-inline font-mono-l text-[12px] text-soft hover:text-ink transition-colors"
                >
                  <span className="text-mute mr-1">0{i + 1}</span> {s}
                </button>
              ))}
            </div>

            {progress && progress.recent.length > 0 && (
              <div className="mt-10 w-full max-w-[640px]">
                <p className="font-mono-l text-[11px] uppercase tracking-[0.18em] text-mute mb-3 text-left">
                  Recent
                </p>
                <div className="flex gap-2 overflow-x-auto scroll-thin pb-2">
                  {progress.recent.map((r) => (
                    <button
                      key={r}
                      onClick={() => startSearch(r)}
                      className="hairline rounded-md bg-card hover:bg-tint transition-colors px-4 py-2.5 font-serif-d text-lg whitespace-nowrap min-h-[44px] inline-flex items-center"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* how it works */}
          <div className="grid md:grid-cols-3 gap-px bg-line-faint border border-line-faint rounded-lg overflow-hidden mb-16">
            {[
              ["01 / Search", "Name anything physical."],
              ["02 / Open", "Tap a part to take it apart."],
              ["03 / Go deeper", "Parts become materials. How far down?"],
            ].map(([t, d]) => (
              <div key={t} className="bg-paper px-6 py-6 text-left">
                <p className="font-mono-l text-[11px] uppercase tracking-[0.16em] text-signaldeep mb-2">{t}</p>
                <p className="text-[15px] text-soft leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </main>
      ) : (
        /* ================= EXPLORE ================= */
        <main className="max-w-[1280px] mx-auto px-4 md:px-8 pb-24">
          {/* breadcrumb — solid bg (no backdrop-blur) to avoid a backdrop-filter composite on every scroll frame */}
          <div className="sticky top-0 z-30 bg-paper py-3 border-b border-line-faint">
            <div className="flex items-center gap-2 overflow-x-auto scroll-thin">
              <button onClick={goHome} className="tap font-mono-l text-[11px] text-soft hover:text-ink shrink-0 px-1" aria-label="Back to search">
                ‹ ALL
              </button>
              {path.map((p, i) => (
                <span key={`${p}-${i}`} className="flex items-center gap-2 shrink-0">
                  <span className="font-mono-l text-[11px] text-mute">/</span>
                  <button
                    onClick={() => jumpTo(i)}
                    className={`tap-inline px-1 font-mono-l text-[11px] uppercase tracking-[0.12em] transition-colors ${
                      i === path.length - 1 ? "text-ink" : "text-soft hover:text-ink"
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
              <div className="flex-1" />
              <button onClick={() => setShareOpen(true)} className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.12em] text-soft hover:text-ink shrink-0">
                Share
              </button>
            </div>
          </div>

          {/* depth header */}
          <div className="flex items-center gap-4 mt-6 mb-2">
            <span className="font-mono-l text-[11px] uppercase tracking-[0.18em] text-signaldeep">
              Depth {depth} · {depthName(depth)}
            </span>
            <div className="flex gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${i <= depth ? (i === depth ? "bg-signal" : "bg-ink") : "bg-ghost"}`}
                />
              ))}
            </div>
            <span className="font-mono-l text-[11px] text-mute ml-auto">scale ≈ {SCALES[Math.min(depth, SCALES.length - 1)]}</span>
          </div>

          {searching && (
            <div className="hairline rounded-md bg-card px-5 py-3 mt-2 flex items-center gap-3" role="status">
              <span className="w-1.5 h-1.5 rounded-full bg-signal animate-pulse shrink-0" />
              <p className="font-mono-l text-[11px] uppercase tracking-[0.16em] text-soft animate-pulse">
                Taking apart {searchQuery || "…"} — {LOADING_LINES[loadingLine]}
              </p>
            </div>
          )}
          {exploreError && !searching && (
            <div className="hairline rounded-md bg-card px-5 py-4 mt-2 flex flex-wrap items-center gap-3">
              <p className="text-[14px] text-ink flex-1 min-w-[200px]">{exploreError}</p>
              <button onClick={surprise} className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.14em] text-signaldeep">
                Surprise me
              </button>
              <button onClick={() => setExploreError(null)} className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.14em] text-mute">
                Dismiss
              </button>
            </div>
          )}

          {/* stacked layers */}
          <div className="flex flex-col gap-6 mt-4">
            {layers.map((layer, i) => {
              const isCurrent = i === layers.length - 1 && !pending;
              const layerDepth = i;
              if (!isCurrent) {
                /* collapsed ancestor: compact chip row */
                return (
                  <section key={`${layer.normalizedName}-${i}`} className="opacity-70">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono-l text-[10px] text-mute uppercase tracking-[0.16em]">L{i}</span>
                      <button onClick={() => jumpTo(i)} className="tap-inline font-serif-d text-2xl text-ink/90 hover:text-ink text-left">
                        {layer.normalizedName}
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2 overflow-x-auto scroll-thin pb-1">
                      {layer.components.map((comp) => (
                        <button
                          key={comp.name}
                          onClick={() => {
                            jumpTo(i);
                            setTimeout(() => dive(comp, i), 60);
                          }}
                          className="tap-inline hairline rounded-sm bg-card px-3 text-[13px] text-soft hover:text-ink hover:border-line-bright whitespace-nowrap transition-colors"
                        >
                          {comp.name} →
                        </button>
                      ))}
                    </div>
                  </section>
                );
              }
              /* current layer hero + cards */
              return (
                <motion.section
                  key={`${layer.normalizedName}-${i}-open`}
                  initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: instant(0.5), ease: [0.22, 1, 0.36, 1] }}
                >
                  {layer.failed ? (
                    <div className="hairline rounded-lg bg-card px-6 py-10 text-center dotgrid">
                      <p className="font-serif-d text-3xl mb-2">{layer.failMessage || "We couldn't pry this open."}</p>
                      <p className="text-soft text-[15px]">Nothing is lost — your thread is intact.</p>
                      <div className="flex gap-5 justify-center mt-5">
                        <button onClick={retryTop} className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.14em] text-signaldeep">
                          Retry
                        </button>
                        <button onClick={() => jumpTo(Math.max(0, layers.length - 2))} className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.14em] text-soft">
                          Go up one level
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`hairline rounded-lg px-6 md:px-10 py-8 md:py-10 dotgrid stage-${Math.min(layerDepth, 5)}`}>
                        <p className="font-mono-l text-[11px] uppercase tracking-[0.18em] text-soft">
                          Layer {layerDepth} — {depthName(layerDepth)}
                        </p>
                        <h2 className="font-serif-d text-ink leading-[0.95] mt-2" style={{ fontSize: "clamp(40px, 6vw, 72px)" }}>
                          {layer.normalizedName}
                        </h2>
                        {layer.parentDescription && (
                          <p className="font-serif-d italic text-xl text-soft mt-3 max-w-[640px]">
                            “{layer.parentDescription}”
                          </p>
                        )}
                        <p className="text-soft text-[16px] leading-relaxed mt-3 max-w-[640px]">{layer.summary}</p>
                        {layer.materials.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            <span className="font-mono-l text-[10px] uppercase tracking-[0.16em] text-soft py-1">Made of</span>
                            {layer.materials.map((m) => (
                              <span key={m} className="font-mono-l text-[11px] text-ink border border-line-strong rounded-full px-3 py-1">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {layerDepth >= MAX_DEPTH ? (
                        <div className="hairline rounded-lg bg-card px-6 py-8 mt-4 text-center">
                          <p className="font-mono-l text-[11px] uppercase tracking-[0.18em] text-leaf mb-2">Bedrock reached</p>
                          <p className="font-serif-d text-3xl">Down to atoms.</p>
                          <p className="text-soft mt-2 text-[15px] max-w-[520px] mx-auto">
                            {layer.materials.length > 0
                              ? `Everything here is ${layer.materials.join(", ")}.`
                              : "Nothing smaller left to open."}
                          </p>
                          <div className="flex gap-5 justify-center mt-5">
                            <button onClick={() => setShareOpen(true)} className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.14em] text-signaldeep">
                              Share this thread
                            </button>
                            <button onClick={() => jumpTo(0)} className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.14em] text-soft">
                              Back to surface
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p id="components-prompt" className="font-mono-l text-[11px] uppercase tracking-[0.18em] text-mute mt-8 mb-3">
                            Tap one to open it
                          </p>
                          <div role="group" aria-labelledby="components-prompt" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {layer.components.map((comp, ci) => (
                              <motion.button
                                key={comp.name}
                                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: reduceMotion ? 0 : Math.min(ci * 0.06, 0.36), duration: instant(0.35), ease: [0.22, 1, 0.36, 1] }}
                                onClick={() => dive(comp, i)}
                                onMouseEnter={() => queuePrefetch(comp.name, path.slice(0, i + 1))}
                                onMouseLeave={() => cancelPrefetch(comp.name, path.slice(0, i + 1))}
                                onFocus={() => queuePrefetch(comp.name, path.slice(0, i + 1))}
                                className={`group text-left rounded-md bg-card hover:bg-tint transition-colors p-5 flex flex-col gap-2 min-h-[150px] ${
                                  comp.rarity === "rare"
                                    ? "border border-signal/45"
                                    : "hairline hover:border-line-bright"
                                }`}
                              >
                                <div className="flex items-center justify-between text-soft group-hover:text-ink transition-colors">
                                  <Glyph kind={comp.iconHint} />
                                  <span className="font-mono-l text-[11px]">0{ci + 1}</span>
                                </div>
                                <span className="font-serif-d text-[22px] leading-tight text-ink">{comp.name}</span>
                                <span className="text-[13.5px] text-soft leading-snug flex-1">{comp.description}</span>
                                <span className="flex items-center justify-between mt-1">
                                  <TypeTag t={comp.type} />
                                  <RarityDot r={comp.rarity} />
                                </span>
                                <span className="font-mono-l text-[11px] uppercase tracking-[0.14em] text-mute group-hover:text-signaldeep transition-colors mt-1">
                                  {comp.isTerminal || comp.type === "element" ? "Trace origin →" : "Take apart →"}
                                </span>
                              </motion.button>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}
                </motion.section>
              );
            })}

            {/* pending layer */}
            <AnimatePresence>
              {pending && (
                <motion.section
                  key="pending"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hairline rounded-lg bg-card px-6 py-10 text-center"
                >
                  <p className="font-mono-l text-[11px] uppercase tracking-[0.2em] text-signaldeep">
                    Diving — {pending.target}
                  </p>
                  <p className="font-serif-d italic text-2xl text-soft mt-2 animate-pulse">
                    {LOADING_LINES[loadingLine]}
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-6">
                    {Array.from({ length: 6 }).map((_, k) => (
                      <div key={k} className="rounded-md bg-card p-5 min-h-[150px] flex flex-col gap-3">
                        <div className="skeleton h-5 w-16 rounded-xs" />
                        <div className="skeleton h-6 w-3/4 rounded-xs" />
                        <div className="skeleton h-4 w-full rounded-xs" />
                        <div className="skeleton h-4 w-2/3 rounded-xs" />
                      </div>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* also explore */}
          <div className="mt-14 border-t border-line-faint pt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="font-mono-l text-[11px] uppercase tracking-[0.14em] text-mute">Also</span>
            {ALSO.map((s) => (
              <button key={s} onClick={() => startSearch(s)} className="tap-inline font-mono-l text-[12px] text-soft hover:text-ink transition-colors">
                {s}
              </button>
            ))}
            <button onClick={surprise} className="tap-inline font-mono-l text-[12px] text-signaldeep ml-auto">
              Surprise me →
            </button>
          </div>
        </main>
      )}

      {/* ---------- celebration ---------- */}
      {/* Reduced-motion: static non-blocking status banner (no fullscreen overlay, no focus trap). */}
      {celebration && reduceMotion && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] hairline rounded-md bg-card px-5 py-4 flex items-center gap-4 w-[calc(100%-2.5rem)] max-w-[520px] shadow-[0_12px_32px_-12px_rgba(32,33,28,0.3)]"
        >
          <span className="font-serif-d text-4xl text-ink leading-none shrink-0">{celebration.depth}</span>
          <span className="flex-1 min-w-0">
            <span className="block font-mono-l text-[10px] uppercase tracking-[0.18em] text-signaldeep">
              Layers deep — {celebration.title}
            </span>
            <span className="block text-[14px] text-soft mt-1 leading-snug">{celebration.sub}</span>
          </span>
          <button
            onClick={() => setCelebration(null)}
            className="tap font-mono-l text-[12px] text-mute px-2 shrink-0"
            aria-label="Dismiss celebration"
          >
            ✕
          </button>
        </div>
      )}
      <AnimatePresence>
        {celebration && !reduceMotion && (
          <motion.div
            key="celebration"
            ref={celebDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="celebration-title"
            tabIndex={-1}
            onKeyDown={(e) => trapTab(e, celebDialogRef)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCelebration(null)}
            className="fixed inset-0 z-[60] bg-paper/85 backdrop-blur-sm flex items-center justify-center text-center px-6 cursor-pointer"
          >
            <div>
              <p className="font-serif-d text-ink leading-none" style={{ fontSize: "clamp(80px, 16vw, 180px)" }}>
                {celebration.depth}
              </p>
              <p className="font-mono-l text-[11px] uppercase tracking-[0.24em] text-signaldeep mt-1">Layers deep</p>
              <h2 id="celebration-title" data-dialog-title tabIndex={-1} className="font-serif-d italic text-2xl text-ink mt-4">{celebration.title}</h2>
              <p className="text-soft mt-1 max-w-[420px] mx-auto">{celebration.sub}</p>
              <button
                onClick={() => setCelebration(null)}
                className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.16em] text-soft hover:text-ink mt-4"
                aria-label="Dismiss celebration"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- share modal ---------- */}
      <AnimatePresence>
        {shareOpen && exploring && (
          <motion.div
            key="share"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShareOpen(false)}
            className="fixed inset-0 z-[60] bg-paper/85 backdrop-blur-sm flex items-center justify-center px-5"
          >
            <div
              ref={shareDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-title"
              tabIndex={-1}
              onKeyDown={(e) => trapTab(e, shareDialogRef)}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[560px] rounded-lg bg-card border border-line p-8 shadow-[0_1px_0_rgba(32,33,28,0.04),0_24px_48px_-16px_rgba(32,33,28,0.25)]"
            >
              <p className="font-mono-l text-[10px] uppercase tracking-[0.2em] text-mute">
                Depth {depth}
              </p>
              <h2 id="share-title" data-dialog-title tabIndex={-1} className="font-serif-d italic text-5xl mt-2">{path[path.length - 1]}</h2>
              <p className="text-soft mt-3 text-[15px] leading-relaxed">{path.join(" → ")}</p>
              <p className="font-mono-l text-[11px] text-mute mt-4 break-all">{shareUrl}</p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => copyShare(threadText)}
                  className="min-h-[44px] flex-1 bg-signaldeep text-white font-mono-l text-[12px] uppercase tracking-[0.12em] rounded-sm py-3 hover:bg-signal transition-colors"
                >
                  {copied ? "Copied" : "Copy thread"}
                </button>
                <button
                  onClick={() => copyShare(shareUrl)}
                  className="min-h-[44px] flex-1 border border-line-strong font-mono-l text-[12px] uppercase tracking-[0.12em] rounded-sm py-3 text-ink hover:border-ink transition-colors"
                >
                  Copy link
                </button>
                <button onClick={() => setShareOpen(false)} className="tap font-mono-l text-[12px] text-mute px-2" aria-label="Close share dialog">
                  ✕
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- index drawer ---------- */}
      <AnimatePresence>
        {indexOpen && (
          <motion.div
            key="index"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIndexOpen(false)}
            className="fixed inset-0 z-[60] bg-ink/25 backdrop-blur-sm"
          >
            <motion.div
              ref={indexDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="index-title"
              tabIndex={-1}
              onKeyDown={(e) => trapTab(e, indexDialogRef)}
              initial={reduceMotion ? false : { x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0 }}
              transition={{ duration: instant(0.3), ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-full max-w-[380px] bg-card border-l border-line p-7 overflow-y-auto shadow-[-16px_0_32px_-16px_rgba(32,33,28,0.2)]"
            >
              <div className="flex items-center justify-between">
                <button onClick={() => setIndexOpen(false)} className="tap text-soft hover:text-ink text-lg ml-auto" aria-label="Close curiosity index">✕</button>
              </div>
              <h2 id="index-title" data-dialog-title tabIndex={-1} className="font-serif-d italic text-3xl mt-2">Not a score. A souvenir.</h2>
              {stats ? (
                <>
                  <div className="grid grid-cols-2 gap-px bg-line border-line rounded-md overflow-hidden mt-6">
                    {[
                      ["Deepest dive", `${stats.deepest}`],
                      ["Objects opened", `${stats.objects}`],
                      ["Specimens", `${stats.specimens}`],
                      ["Rare finds", `${stats.rares}`],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-card p-4">
                        <p className="font-mono-l text-2xl text-ink">{v}</p>
                        <p className="font-mono-l text-[10px] uppercase tracking-[0.14em] text-mute mt-1">{k}</p>
                      </div>
                    ))}
                  </div>
                  {stats.deepestThread.length > 0 && (
                    <p className="text-[13.5px] text-soft mt-4 leading-relaxed">
                      Deepest: {stats.deepestThread.join(" → ")}
                    </p>
                  )}
                  <p className="text-[13.5px] text-soft mt-2 leading-relaxed">Your mind goes {stats.realm}.</p>
                  {progress && progress.recent.length > 0 && (
                    <>
                      <p className="font-mono-l text-[10px] uppercase tracking-[0.16em] text-mute mt-6 mb-2">Recent</p>
                      <div className="flex flex-col gap-1.5">
                        {progress.recent.map((r) => (
                          <button
                            key={r}
                            onClick={() => {
                              setIndexOpen(false);
                              startSearch(r);
                            }}
                            className="text-left font-serif-d text-lg text-soft hover:text-ink transition-colors tap-inline"
                          >
                            {r} →
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "my-cabinet.json";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="tap-inline font-mono-l text-[11px] uppercase tracking-[0.14em] text-soft hover:text-ink mt-6"
                  >
                    Download my cabinet (.json)
                  </button>
                </>
              ) : (
                <p className="text-soft mt-6">Every thing you take apart lives here.</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
