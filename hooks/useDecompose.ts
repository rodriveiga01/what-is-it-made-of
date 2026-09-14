"use client";

import { useCallback, useRef } from "react";
import { safeLayer, type DecomposeResponse } from "@/lib/schema";
import { layerKey } from "@/lib/normalize";
import { layerCacheGet, layerCacheSet } from "@/lib/store";

export type Layer = DecomposeResponse & {
  query: string;
  ancestry: string[];
  parentDescription?: string;
  cached?: boolean;
  source?: string;
  failed?: boolean;
  failMessage?: string;
};

const inflight = new Map<string, Promise<Layer>>();

function keyOf(query: string, ancestry: string[]): string {
  return layerKey([...ancestry, query]);
}

export function useDecompose() {
  const cacheRef = useRef(new Map<string, Layer>());

  const fetchLayer = useCallback(async (query: string, ancestry: string[], opts?: { prefetch?: boolean }): Promise<Layer> => {
    const key = keyOf(query, ancestry);
    const mem = cacheRef.current.get(key);
    if (mem && !mem.failed) return mem;
    // Disk cache is untrusted (user-writable localStorage): re-validate
    // against the schema before rendering, drop silently if corrupt.
    const diskRaw = layerCacheGet(key) as unknown;
    if (diskRaw && typeof diskRaw === "object" && diskRaw !== null && !("failed" in (diskRaw as Record<string, unknown>))) {
      const valid = safeLayer(diskRaw);
      if (valid) {
        const layer = { ...valid, query, ancestry } as Layer;
        cacheRef.current.set(key, layer);
        return layer;
      }
    }
    const existing = inflight.get(key);
    if (existing) return existing;

    const p = (async (): Promise<Layer> => {
      const res = await fetch("/api/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, path: ancestry, prefetch: opts?.prefetch ?? false }),
        // Never hang the UI forever on a stalled network.
        signal: AbortSignal.timeout(20_000),
      });
      if (res.status === 422) {
        const j = await res.json().catch(() => ({}));
        const layer: Layer = {
          normalizedName: query,
          summary: "",
          components: [],
          materials: [],
          query,
          ancestry,
          failed: true,
          failMessage: j.message || "Not a physical thing.",
        };
        return layer;
      }
      if (res.status === 429) {
        const layer: Layer = {
          normalizedName: query,
          summary: "",
          components: [],
          materials: [],
          query,
          ancestry,
          failed: true,
          failMessage: "Too many teardowns at once — wait a few seconds and retry.",
        };
        return layer;
      }
      if (res.status === 503) {
        const j = await res.json().catch(() => ({} as { message?: string }));
        const layer: Layer = {
          normalizedName: query,
          summary: "",
          components: [],
          materials: [],
          query,
          ancestry,
          failed: true,
          failMessage: j.message || "The teardown engine is unreachable — wait a bit and retry.",
        };
        return layer;
      }
      if (!res.ok) throw new Error(`bad status ${res.status}`);
      const j = (await res.json()) as DecomposeResponse & { cached?: boolean; source?: string };
      const layer: Layer = { ...j, query, ancestry };
      // AI answers persist to memory + disk so repeats and back-navigation
      // cost nothing. Nothing else is ever persisted.
      if (layer.components.length >= 3) {
        cacheRef.current.set(key, layer);
        layerCacheSet(key, layer);
      }
      return layer;
    })();

    inflight.set(key, p);
    try {
      return await p;
    } catch {
      const layer: Layer = {
        normalizedName: query,
        summary: "",
        components: [],
        materials: [],
        query,
        ancestry,
        failed: true,
        failMessage: "We couldn't pry this one open.",
      };
      return layer;
    } finally {
      inflight.delete(key);
    }
  }, []);

  const primeLayer = useCallback((layer: Layer) => {
    cacheRef.current.set(keyOf(layer.query, layer.ancestry), layer);
  }, []);

  return { fetchLayer, primeLayer };
}
