/**
 * Batch-generate articles for every watch in data/watches.json that doesn't already have one.
 * Respects priority (1 first), sleeps between calls, skips existing.
 *
 * pnpm batch          # generate all missing
 * pnpm batch --force  # regenerate all
 * pnpm batch --priority 1   # only priority 1
 */
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { WATCHES } from "../src/lib/watch-list";

const force = process.argv.includes("--force");
const priorityArg = process.argv.indexOf("--priority");
const priorityFilter = priorityArg !== -1 ? Number(process.argv[priorityArg + 1]) : null;

const SLEEP_MS = 4000;

async function exists(slug: string): Promise<boolean> {
  try {
    await fs.access(path.join(process.cwd(), "content", `${slug}.md`));
    return true;
  } catch {
    return false;
  }
}

function runGenerate(slug: string): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn("npx", ["tsx", "scripts/generate-article.ts", slug], {
      stdio: "inherit", shell: true,
    });
    child.on("exit", code => resolve(code ?? 1));
  });
}

async function main() {
  const queue = WATCHES
    .filter(w => priorityFilter === null || w.priority === priorityFilter)
    .sort((a, b) => a.priority - b.priority);

  console.log(`Queue: ${queue.length} watches`);
  let done = 0, skipped = 0, failed = 0;

  for (const w of queue) {
    if (!force && await exists(w.slug)) {
      console.log(`Skipping ${w.slug} (exists)`);
      skipped++;
      continue;
    }
    const code = await runGenerate(w.slug);
    if (code === 0) done++; else failed++;
    await new Promise(r => setTimeout(r, SLEEP_MS));
  }

  console.log(`\nDone. Generated: ${done} | Skipped: ${skipped} | Failed: ${failed}`);
}

main();
