import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Image style preview",
  description: "Internal preview of 5 image style directions for the catchfakes.com hero photography.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/image-styles" },
};

const STYLES = [
  {
    file: "1-cinematic-cool.jpg",
    name: "Cinematic Cool",
    watch: "Rolex Submariner",
    palette: "Cool blue rim light · navy gradient · steel and dark",
    mood: "Dramatic, premium-tech, modern luxury campaign",
    bestFor: "Sport divers, GMTs, modern steel sport watches",
  },
  {
    file: "2-high-contrast-fashion.jpg",
    name: "High-Contrast Fashion",
    watch: "Patek Nautilus",
    palette: "Pure white · single hard light · bold cast shadow",
    mood: "Editorial fashion, vivid contrast, GQ-style",
    bestFor: "Integrated bracelet sports luxury, blue-dial pieces",
  },
  {
    file: "3-bright-studio-catalog.jpg",
    name: "Bright Studio Catalog",
    watch: "Cartier Tank",
    palette: "Pure white seamless · soft top light · neutral",
    mood: "Catalogue clean, e-commerce premium, magazine product page",
    bestFor: "Dress watches, leather strap pieces, vintage-style",
  },
  {
    file: "4-minimalist-architectural.jpg",
    name: "Minimalist Architectural",
    watch: "Audemars Piguet Royal Oak",
    palette: "Concrete grey · cool neutrals · large negative space",
    mood: "Quiet, gallery-like, museum piece, restrained luxury",
    bestFor: "Architectural designs, AP / Lange / Vacheron, monochrome stories",
  },
  {
    file: "5-natural-daylight-lifestyle.jpg",
    name: "Natural Daylight Lifestyle",
    watch: "Omega Speedmaster",
    palette: "Soft window light · warm-neutral · brown leather",
    mood: "Lived-in luxury, editorial lifestyle, Hodinkee / Worn & Wound",
    bestFor: "Tool watches, chronographs, vintage references, lifestyle stories",
  },
];

export default function ImageStylesPage() {
  return (
    <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 py-16 sm:py-20">
      <div className="font-mono text-xs tracking-[0.16em] uppercase text-accent mb-3">Internal Preview</div>
      <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-tight tracking-tight mb-4">
        Five image directions.<br /><em className="italic text-accent">Pick one. Or mix.</em>
      </h1>
      <p className="text-lg text-text-soft max-w-2xl mb-12 leading-relaxed">
        Each shot uses a different mood/lighting prompt on a different watch. Compare for tone, contrast,
        and how each would look as a hero across 40 articles. Reply with a number — or describe a mix
        (e.g. <em>&quot;#1 for sport watches, #3 for dress watches, #5 for chronos&quot;</em>) and I&apos;ll regenerate the full set.
      </p>

      <div className="grid gap-12">
        {STYLES.map((s, i) => (
          <div key={s.file} className="border-t border-rule pt-8">
            <div className="flex items-baseline gap-4 mb-4 flex-wrap">
              <span className="font-mono text-3xl text-accent leading-none">{i + 1}</span>
              <h2 className="font-serif text-3xl">{s.name}</h2>
              <span className="font-mono text-xs tracking-[0.14em] uppercase text-text-soft">on {s.watch}</span>
            </div>

            <figure className="rounded-2xl overflow-hidden border border-rule mb-4 bg-bg-2">
              <img
                src={`/image-styles/${s.file}`}
                alt={`${s.name} — ${s.watch}`}
                width={1200}
                height={630}
                className="w-full h-auto block"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </figure>

            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-text-soft mb-1">Palette</div>
                <div className="text-text">{s.palette}</div>
              </div>
              <div>
                <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-text-soft mb-1">Mood</div>
                <div className="text-text">{s.mood}</div>
              </div>
              <div>
                <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-text-soft mb-1">Best for</div>
                <div className="text-text">{s.bestFor}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-bg-2 to-bg-3 border border-accent/20">
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-3">Next step</div>
        <h2 className="font-serif text-2xl mb-3">Reply with your pick</h2>
        <p className="text-text-soft leading-relaxed">
          Single number for &quot;use this style across all 40 articles&quot; · or mix-and-match by category.
          Once decided, regen of all 40 takes ~10 minutes and ~$2.
        </p>
      </div>
    </div>
  );
}
