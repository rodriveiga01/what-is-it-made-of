export type Progress = {
  threads: string[][];
  deepest: number;
  deepestThread: string[];
  discoveries: Record<string, number>;
  rareFinds: string[];
  totalObjects: number;
  firstSeen: string;
  lastVisit: string;
  celebrated: Record<string, boolean>;
  recent: string[];
};

const KEY = "wimof_v1";

const blank = (): Progress => ({
  threads: [],
  deepest: 0,
  deepestThread: [],
  discoveries: {},
  rareFinds: [],
  totalObjects: 0,
  firstSeen: new Date().toISOString().slice(0, 10),
  lastVisit: new Date().toISOString().slice(0, 10),
  celebrated: {},
  recent: [],
});

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return blank();
    const p = parsed as Partial<Progress>;
    // Guard against stale/corrupt shapes (e.g. recent as string) that would
    // crash render paths like progress.recent.map.
    if (!Array.isArray(p.recent) || !p.recent.every((r) => typeof r === "string")) return blank();
    if (typeof p.deepest !== "number" || !p.discoveries || typeof p.discoveries !== "object") return blank();
    return { ...blank(), ...p };
  } catch {
    return blank();
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* storage full — loop still works anonymous */
  }
}

/** Record a completed dive path; returns updated progress + whether new personal best. */
export function recordThread(p: Progress, path: string[], rareIds: string[]): { next: Progress; newBest: boolean } {
  const next: Progress = { ...p, discoveries: { ...p.discoveries }, celebrated: { ...p.celebrated } };
  next.lastVisit = new Date().toISOString().slice(0, 10);
  const depth = path.length - 1;
  const newBest = depth > next.deepest;
  if (newBest) {
    next.deepest = depth;
    next.deepestThread = [...path];
  }
  if (path.length > 0) {
    const root = path[0];
    if (!next.recent.includes(root)) {
      next.totalObjects += 1;
    }
    next.recent = [root, ...next.recent.filter((r) => r !== root)].slice(0, 12);
  }
  for (const name of path) {
    const k = name.toLowerCase();
    next.discoveries[k] = (next.discoveries[k] ?? 0) + 1;
  }
  for (const r of rareIds) {
    if (!next.rareFinds.includes(r)) next.rareFinds.push(r);
  }
  const sig = path.join(">");
  if (!next.threads.some((t) => t.join(">") === sig)) {
    next.threads = [...next.threads, [...path]].slice(-50);
  }
  return { next, newBest };
}

const LAYER_PREFIX = "wimof:layer:v3:";

export function layerCacheGet(key: string): unknown | null {
  try {
    const raw = localStorage.getItem(LAYER_PREFIX + key);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > 1000 * 60 * 60 * 24) return null; // 24h stale
    return data;
  } catch {
    return null;
  }
}

export function layerCacheSet(key: string, data: unknown): void {
  try {
    localStorage.setItem(LAYER_PREFIX + key, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    // QuotaExceeded: evict oldest layer keys
    try {
      const victims: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(LAYER_PREFIX)) victims.push(k);
      }
      victims.slice(0, 20).forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(LAYER_PREFIX + key, JSON.stringify({ ts: Date.now(), data }));
    } catch {
      /* give up silently */
    }
  }
}
