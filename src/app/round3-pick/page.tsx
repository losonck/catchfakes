import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { getWatches } from "@/lib/watch-list";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Pexels picker — round 3",
  description: "Internal — pick from Pexels candidates for the 15 watches still on AI.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/round3-pick" },
};

interface PexelsCandidate {
  photo_id: string;
  photographer: string;
  page_url: string;
  thumb: string;
  thumb_url: string;
  full_url: string;
}

function loadPexels(): Record<string, { candidates: PexelsCandidate[] }> {
  const p = path.join(process.cwd(), "data", "round3-candidates.json");
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export default function Round3PickPage() {
  const watches = getWatches();
  const px = loadPexels();
  const slugs = Object.keys(px);
  const watchesInRound = watches.filter((w) => slugs.includes(w.slug));
  const watchesWithCands = watchesInRound.filter((w) => (px[w.slug]?.candidates ?? []).length > 0);
  const watchesWithoutCands = watchesInRound.filter((w) => !(px[w.slug]?.candidates ?? []).length);
  const totalCands = watchesWithCands.reduce(
    (sum, w) => sum + (px[w.slug]?.candidates?.length ?? 0),
    0,
  );

  return (
    <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="font-mono text-xs tracking-[0.16em] uppercase text-accent mb-3">
        Round 3 — Pexels
      </div>
      <h1 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] leading-tight tracking-tight mb-4">
        Last 15 watches. <em className="italic text-accent">Pick v1 + v2 per watch.</em>
      </h1>
      <p className="text-text-soft max-w-2xl mb-6 leading-relaxed">
        Pexels public search HTML, scraped (no API key). Pexels License — free for commercial use,
        no attribution required. {watchesWithCands.length} of {watchesInRound.length} watches have candidates
        ({totalCands} images total).
      </p>
      <p className="text-text-soft max-w-2xl mb-12 leading-relaxed text-sm">
        Send picks as: <code className="text-accent">slug=v1,v2</code> per line, where v1/v2 are
        0 (keep AI) or 1&ndash;5 (Pexels pick). Example:
        <br />
        <em>
          rolex-submariner=3,2
          <br />
          tudor-black-bay-58=1,4
          <br />
          patek-aquanaut=0,0 (means: not happy with any, keep current AI)
        </em>
      </p>

      {watchesWithoutCands.length > 0 && (
        <div className="mb-12 p-4 rounded-xl bg-bg-2 border border-rule">
          <div className="font-mono text-xs tracking-[0.14em] uppercase text-text-soft mb-2">
            Watches with no Pexels matches (stay on AI)
          </div>
          <p className="text-sm text-text-soft">
            {watchesWithoutCands.map((w) => w.brand + " " + w.model).join(" · ")}
          </p>
        </div>
      )}

      {watchesWithCands.map((w, i) => {
        const cands = px[w.slug].candidates;
        return (
          <div key={w.slug} className="border-t border-rule pt-8 mb-12">
            <div className="flex items-baseline gap-3 mb-1 flex-wrap">
              <span className="font-mono text-xl text-accent leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h2 className="font-serif text-2xl">
                {w.brand} {w.model}
              </h2>
              <span className="font-mono text-xs tracking-[0.14em] uppercase text-text-soft">
                {w.refs[0]} &middot; currently AI
              </span>
            </div>
            <div className="font-mono text-xs text-text-soft mb-4">
              <code>{w.slug}</code> &mdash; {cands.length} Pexels candidate
              {cands.length !== 1 ? "s" : ""}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Option 0: Keep AI */}
              <div>
                <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-accent mb-2">
                  0 &mdash; Keep AI
                </div>
                <figure className="rounded-xl overflow-hidden border border-rule bg-bg-2 aspect-[640/336]">
                  <img
                    src={`/articles/${w.slug}-v1.jpg?v=wm2`}
                    alt={`current ${w.slug}`}
                    width={640}
                    height={336}
                    className="w-full h-full object-cover block"
                    loading="lazy"
                  />
                </figure>
                <div className="text-[0.68rem] text-text-soft mt-1.5 font-mono">
                  Nano Banana v1
                </div>
              </div>

              {/* Also show current v2 for reference */}
              <div>
                <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-accent mb-2">
                  0&prime; &mdash; Current v2 (article hero)
                </div>
                <figure className="rounded-xl overflow-hidden border border-rule bg-bg-2 aspect-[640/336]">
                  <img
                    src={`/articles/${w.slug}-v2.jpg?v=wm2`}
                    alt={`current v2 ${w.slug}`}
                    width={640}
                    height={336}
                    className="w-full h-full object-cover block"
                    loading="lazy"
                  />
                </figure>
                <div className="text-[0.68rem] text-text-soft mt-1.5 font-mono">
                  Nano Banana v2
                </div>
              </div>

              {cands.map((c, n) => (
                <div key={c.photo_id}>
                  <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-accent mb-2">
                    {n + 1}
                  </div>
                  <figure className="rounded-xl overflow-hidden border border-rule bg-bg-2 aspect-[640/336]">
                    <a
                      href={c.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={c.thumb}
                        alt={`Pexels ${c.photo_id} by ${c.photographer}`}
                        width={640}
                        height={336}
                        className="w-full h-full object-cover block"
                        loading="lazy"
                      />
                    </a>
                  </figure>
                  <div className="text-[0.68rem] text-text-soft mt-1.5 leading-snug">
                    <span className="font-mono">id={c.photo_id}</span> &middot; Pexels License
                    <br />
                    by {c.photographer.length > 36 ? c.photographer.slice(0, 36) + "…" : c.photographer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-bg-2 to-bg-3 border border-accent/20">
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-3">
          Send picks
        </div>
        <h2 className="font-serif text-2xl mb-3">When done</h2>
        <p className="text-text-soft leading-relaxed text-sm">
          Paste your picks back as <code>slug=v1,v2</code> lines. I&apos;ll download the chosen
          full-size photos, crop to 1200&times;630, replace v1 + v2, update attribution metadata
          (Pexels License, no attribution required but credit is added), bump cache version,
          and ship to Cloudflare Pages.
        </p>
      </div>
    </div>
  );
}
