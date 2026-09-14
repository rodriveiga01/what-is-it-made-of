type Entry = { value: unknown; expires: number };

const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();
const MAX = 300;
const TTL = 1000 * 60 * 60 * 24 * 30; // 30d

export function cacheGet<T>(key: string): T | null {
  const e = store.get(key);
  if (!e) return null;
  if (Date.now() > e.expires) {
    store.delete(key);
    return null;
  }
  // LRU touch
  store.delete(key);
  store.set(key, e);
  return e.value as T;
}

export function cacheSet(key: string, value: unknown): void {
  if (store.size >= MAX) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(key, { value, expires: Date.now() + TTL });
}

export async function dedup<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;
  const p = fn().finally(() => inflight.delete(key));
  inflight.set(key, p);
  return p;
}
