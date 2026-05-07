import fs from "node:fs";
import path from "node:path";

export interface WatchEntry {
  slug: string;
  brand: string;
  model: string;
  refs: string[];
  priority: number;
}

let cached: WatchEntry[] | null = null;

export function getWatches(): WatchEntry[] {
  if (cached) return cached;
  const dataPath = path.join(process.cwd(), "data", "watches.json");
  cached = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as WatchEntry[];
  return cached;
}

export function findWatch(slug: string): WatchEntry | undefined {
  return getWatches().find(w => w.slug === slug);
}
