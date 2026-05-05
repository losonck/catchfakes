import watches from "../../data/watches.json";

export interface WatchEntry {
  slug: string;
  brand: string;
  model: string;
  refs: string[];
  priority: number;
}

export const WATCHES: WatchEntry[] = watches as WatchEntry[];

export function findWatch(slug: string): WatchEntry | undefined {
  return WATCHES.find(w => w.slug === slug);
}
