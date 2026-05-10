import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { getWatches } from "@/lib/watch-list";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Wikimedia photo picker",
  description: "Internal — pick a real Wikimedia Commons photo per watch, or keep Nano Banana.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/wikimedia-pick" },
};

interface Candidate {
  title: string;
  url: string;
  width: number;
  height: number;
  photographer: string;
  license: string;
  license_url: string;
  source_page: string;
  thumb: string;
}

interface CandidatesData {
  [slug: string]: { candidates: Candidate[] };
}

function loadCandidates(): CandidatesData {
  const p = path.join(process.cwd(), "data", "wikimedia-candidates.json");
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export default function WikimediaPickPage() {
  const watches = getWatches();
  const data = loadCandidates();

  const watchesWithCands = watches.filter(w => (data[w.slug]?.candidates ?? []).length > 0);
  const watchesWithoutCands = watches.filter(w => !data[w.slug]?.candidates?.length);

  return (
    <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="font-mono text-xs tracking-[0.16em] uppercase text-accent mb-3">Internal — Wikimedia picker</div>
      <h1 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] leading-tight tracking-tight mb-4">
        Pick real photos. <em className="italic text-accent">Or keep AI.</em>
      </h1>
      <p className="text-text-soft max-w-2xl mb-6 leading-relaxed">
        For each watch with Wikimedia matches: pick a number (1–5) for the Wikimedia photo,
        or <strong className="text-text">0</strong> to keep the current Nano Banana AI version.
      </p>
      <p className="text-text-soft max-w-2xl mb-12 leading-relaxed text-sm">
        <strong className="text-text">Send your picks like this:</strong> <code className="text-accent">rolex-submariner=2, omega-speedmaster=1, cartier-tank=0, ...</code>
        <br />
        Or default+exception: <em>&quot;default=0 (keep AI), except: rolex-submariner=2, ...&quot;</em>
      </p>

      <div className="mb-12 p-4 rounded-xl bg-bg-2 border border-rule">
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-text-soft mb-2">Stats</div>
        <p className="text-sm text-text">
          {watchesWithCands.length} watches have Wikimedia candidates · {watchesWithoutCands.length} have none (auto-stay on Nano Banana)
        </p>
      </div>

      {watchesWithCands.map((w, i) => {
        const cands = data[w.slug].candidates;
        return (
          <div key={w.slug} className="border-t border-rule pt-8 mb-12">
            <div className="flex items-baseline gap-3 mb-1 flex-wrap">
              <span className="font-mono text-xl text-accent leading-none">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-serif text-2xl">{w.brand} {w.model}</h2>
              <span className="font-mono text-xs tracking-[0.14em] uppercase text-text-soft">{w.refs[0]}</span>
            </div>
            <div className="font-mono text-xs text-text-soft mb-4">
              <code>{w.slug}</code> — {cands.length} Wikimedia candidate{cands.length !== 1 ? "s" : ""}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Option 0: Keep Nano Banana */}
              <div>
                <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-accent mb-2">
                  0 — Keep AI
                </div>
                <figure className="rounded-xl overflow-hidden border border-rule bg-bg-2 aspect-[640/336]">
                  <img
                    src={`/articles/${w.slug}-v1.jpg`}
                    alt={`Nano Banana ${w.slug}`}
                    width={640}
                    height={336}
                    className="w-full h-full object-cover block"
                    loading="lazy"
                  />
                </figure>
                <div className="text-[0.68rem] text-text-soft mt-1.5 font-mono">Nano Banana v1</div>
              </div>

              {cands.map((c, n) => (
                <div key={n}>
                  <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-accent mb-2">
                    {n + 1} — Wikimedia
                  </div>
                  <figure className="rounded-xl overflow-hidden border border-rule bg-bg-2 aspect-[640/336]">
                    <a href={c.source_page} target="_blank" rel="noopener" className="block">
                      <img
                        src={c.thumb}
                        alt={c.title}
                        width={640}
                        height={336}
                        className="w-full h-full object-cover block"
                        loading="lazy"
                      />
                    </a>
                  </figure>
                  <div className="text-[0.68rem] text-text-soft mt-1.5 leading-snug">
                    <span className="font-mono">{c.width}×{c.height}</span> · {c.license}
                    <br />
                    by {c.photographer.length > 40 ? c.photographer.slice(0, 40) + "…" : c.photographer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {watchesWithoutCands.length > 0 && (
        <div className="border-t border-rule pt-8 mt-12">
          <h2 className="font-serif text-2xl mb-3">No Wikimedia candidates — staying on AI</h2>
          <ul className="text-sm text-text-soft space-y-1 font-mono">
            {watchesWithoutCands.map(w => (
              <li key={w.slug}><code>{w.slug}</code> · {w.brand} {w.model}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-bg-2 to-bg-3 border border-accent/20">
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-3">When you&apos;re done</div>
        <h2 className="font-serif text-2xl mb-3">Send picks</h2>
        <p className="text-text-soft leading-relaxed text-sm">
          I&apos;ll download the chosen full-size Wikimedia photos, crop to 1200×630, replace the v1 + v2 files,
          and add per-article photo attribution to the article hero.
        </p>
      </div>
    </div>
  );
}
