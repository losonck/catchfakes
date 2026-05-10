import type { Metadata } from "next";
import { getWatches } from "@/lib/watch-list";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Pick image variants",
  description: "Internal — pick v1 or v2 for each of the 40 watch hero images.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/image-pick" },
};

const STYLE_MAP: Record<string, string> = {
  "rolex-submariner":         "cinematic-cool",
  "rolex-gmt-master-ii":      "cinematic-cool",
  "rolex-explorer":           "cinematic-cool",
  "rolex-yachtmaster":        "cinematic-cool",
  "rolex-sea-dweller":        "cinematic-cool",
  "rolex-sky-dweller":        "cinematic-cool",
  "rolex-air-king":           "cinematic-cool",
  "omega-seamaster-300":      "cinematic-cool",
  "omega-aqua-terra":         "cinematic-cool",
  "tudor-pelagos":            "cinematic-cool",
  "tudor-black-bay-pro":      "cinematic-cool",
  "panerai-luminor":          "cinematic-cool",
  "bell-ross-br-03":          "cinematic-cool",
  "rolex-datejust":           "bright-studio",
  "cartier-santos":           "bright-studio",
  "cartier-tank":             "bright-studio",
  "iwc-portugieser":          "bright-studio",
  "omega-constellation":      "bright-studio",
  "patek-calatrava":          "bright-studio",
  "cartier-ballon-bleu":      "bright-studio",
  "jlc-reverso":              "bright-studio",
  "audemars-piguet-royal-oak":"architectural",
  "patek-nautilus":           "architectural",
  "grand-seiko-snowflake":    "architectural",
  "vacheron-overseas":        "architectural",
  "richard-mille-rm-011":     "architectural",
  "patek-aquanaut":           "architectural",
  "ap-royal-oak-offshore":    "architectural",
  "ap-code-1159":             "architectural",
  "hublot-big-bang":          "architectural",
  "rolex-daytona":            "daylight-lifestyle",
  "omega-speedmaster":        "daylight-lifestyle",
  "tudor-black-bay-58":       "daylight-lifestyle",
  "breitling-navitimer":      "daylight-lifestyle",
  "tag-heuer-monaco":         "daylight-lifestyle",
  "rolex-submariner-vintage": "daylight-lifestyle",
  "omega-speedmaster-pre-moon":"daylight-lifestyle",
  "vacheron-222":             "daylight-lifestyle",
  "heuer-carrera-vintage":    "daylight-lifestyle",
  "zenith-el-primero":        "daylight-lifestyle",
};

export default function ImagePickPage() {
  const watches = getWatches();

  return (
    <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="font-mono text-xs tracking-[0.16em] uppercase text-accent mb-3">Internal — pick variants</div>
      <h1 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] leading-tight tracking-tight mb-4">
        40 watches. <em className="italic text-accent">v1 or v2.</em>
      </h1>
      <p className="text-text-soft max-w-2xl mb-12 leading-relaxed">
        Compare each pair. Send me your picks as text — easiest format:
        a list of <code className="text-accent">slug=v1</code> or <code className="text-accent">slug=v2</code>.
        Or just say <em>&quot;default to v1, except: [list of slugs to use v2]&quot;</em> — whatever&apos;s fastest on your phone.
      </p>

      <div className="grid gap-12">
        {watches.map((w, i) => (
          <div key={w.slug} className="border-t border-rule pt-6">
            <div className="flex items-baseline gap-3 mb-1 flex-wrap">
              <span className="font-mono text-2xl text-accent leading-none">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="font-serif text-2xl">{w.brand} {w.model}</h2>
              <span className="font-mono text-xs tracking-[0.14em] uppercase text-text-soft">
                {w.refs[0]} · {STYLE_MAP[w.slug] ?? "?"}
              </span>
            </div>
            <div className="font-mono text-xs text-text-soft mb-4">
              <code>{w.slug}</code>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {(["v1", "v2"] as const).map(v => (
                <div key={v}>
                  <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-accent mb-2">
                    {v.toUpperCase()}
                  </div>
                  <figure className="rounded-2xl overflow-hidden border border-rule bg-bg-2 aspect-[1200/630]">
                    <img
                      src={`/articles/${w.slug}-${v}.jpg?v=batch`}
                      alt={`${w.brand} ${w.model} ${v}`}
                      width={1200}
                      height={630}
                      className="w-full h-full object-contain block"
                      loading="lazy"
                    />
                  </figure>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-bg-2 to-bg-3 border border-accent/20">
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-3">When you&apos;re done</div>
        <h2 className="font-serif text-2xl mb-3">Send me your picks</h2>
        <p className="text-text-soft leading-relaxed">
          Once I have your picks, I rename the chosen file (e.g. <code>rolex-submariner-v1.jpg</code> → <code>rolex-submariner.jpg</code>),
          delete the loser, and push. Live across the site in ~60s.
        </p>
      </div>
    </div>
  );
}
