import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { getWatches } from "@/lib/watch-list";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Openverse picker — round 2",
  description: "Internal — pick from Openverse candidates for the 11 watches still on AI.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/openverse-pick" },
};

interface OpenverseCandidate {
  title: string;
  url: string;
  thumb: string;
  width?: number;
  height?: number;
  license: string;
  creator: string;
  source: string;
  source_page: string;
  attribution: string;
}

function loadOpenverse(): Record<string, { candidates: OpenverseCandidate[] }> {
  const p = path.join(process.cwd(), "data", "openverse-candidates.json");
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function loadAttribution(): Record<string, { v1?: { photographer: string } }> {
  const p = path.join(process.cwd(), "data", "photo-attribution.json");
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

export default function OpenversePickPage() {
  const watches = getWatches();
  const ov = loadOpenverse();
  const wikiAttr = loadAttribution();

  const watchesWithOv = watches.filter(w => (ov[w.slug]?.candidates ?? []).length > 0);
  const watchesWithoutOv = watches.filter(w =>
    !ov[w.slug]?.candidates?.length && !wikiAttr[w.slug]
  );

  return (
    <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="font-mono text-xs tracking-[0.16em] uppercase text-accent mb-3">Round 2 — Openverse</div>
      <h1 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] leading-tight tracking-tight mb-4">
        New candidates. <em className="italic text-accent">From Flickr CC + more.</em>
      </h1>
      <p className="text-text-soft max-w-2xl mb-6 leading-relaxed">
        Openverse aggregates Flickr CC + Wikimedia + Smithsonian + NASA + MET. Found {watchesWithOv.length} watches
        with new candidates. Many photos by &quot;Johnson Watch Co&quot; have a visible retailer LOGO — skip those (pick 0).
      </p>
      <p className="text-text-soft max-w-2xl mb-12 leading-relaxed text-sm">
        Send picks like: <code className="text-accent">slug=N</code> where N is 0 (keep current) or 1–5 (Openverse pick).
        Format: <em>&quot;hublot-big-bang=4, omega-aqua-terra=0, ...&quot;</em>
      </p>

      <div className="mb-12 p-4 rounded-xl bg-bg-2 border border-rule">
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-text-soft mb-2">Watches still without any real photo (will stay AI)</div>
        <p className="text-sm text-text-soft">
          {watchesWithoutOv.map(w => w.brand + " " + w.model).join(" · ") || "none — every watch has at least one option"}
        </p>
      </div>

      {watchesWithOv.map((w, i) => {
        const cands = ov[w.slug].candidates;
        const hasWiki = !!wikiAttr[w.slug];
        return (
          <div key={w.slug} className="border-t border-rule pt-8 mb-12">
            <div className="flex items-baseline gap-3 mb-1 flex-wrap">
              <span className="font-mono text-xl text-accent leading-none">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-serif text-2xl">{w.brand} {w.model}</h2>
              <span className="font-mono text-xs tracking-[0.14em] uppercase text-text-soft">
                {w.refs[0]} {hasWiki ? "· currently Wikimedia" : "· currently AI"}
              </span>
            </div>
            <div className="font-mono text-xs text-text-soft mb-4">
              <code>{w.slug}</code> — {cands.length} Openverse candidate{cands.length !== 1 ? "s" : ""}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Option 0: Keep current */}
              <div>
                <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-accent mb-2">
                  0 — Keep {hasWiki ? "Wikimedia" : "AI"}
                </div>
                <figure className="rounded-xl overflow-hidden border border-rule bg-bg-2 aspect-[640/336]">
                  <img
                    src={`/articles/${w.slug}-v1.jpg?v=wm1`}
                    alt={`current ${w.slug}`}
                    width={640}
                    height={336}
                    className="w-full h-full object-cover block"
                    loading="lazy"
                  />
                </figure>
                <div className="text-[0.68rem] text-text-soft mt-1.5 font-mono">{hasWiki ? "Wikimedia v1" : "Nano Banana v1"}</div>
              </div>

              {cands.map((c, n) => {
                const isJohnson = c.creator.toLowerCase().includes("johnson");
                return (
                  <div key={n}>
                    <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-accent mb-2">
                      {n + 1} {isJohnson && <span className="text-red-400">⚠ retailer logo</span>}
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
                      <span className="font-mono">{c.width}×{c.height}</span> · {c.license} · {c.source}
                      <br />
                      by {c.creator.length > 40 ? c.creator.slice(0, 40) + "…" : c.creator}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-bg-2 to-bg-3 border border-accent/20">
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-3">Send picks</div>
        <h2 className="font-serif text-2xl mb-3">When done</h2>
        <p className="text-text-soft leading-relaxed text-sm">
          I&apos;ll download the chosen full-size photo, crop to 1200×630, replace v1 + v2,
          and add CC attribution under the article hero. Live in ~60s.
        </p>
      </div>
    </div>
  );
}
