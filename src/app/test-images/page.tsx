import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Nano Banana test images",
  description: "Internal preview of Nano Banana (Gemini 2.5 Flash Image) test generations.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/test-images" },
};

const TESTS = [
  {
    slug: "rolex-submariner",
    name: "Rolex Submariner",
    style: "cinematic-cool",
    v1Note: "Low 3/4 angle, cool blue rim, navy gradient",
    v2Note: "Dial-up 30°, cool gradient backdrop, soft side shadow",
  },
  {
    slug: "cartier-tank",
    name: "Cartier Tank",
    style: "bright-studio",
    v1Note: "Top-down flat-lay on white seamless",
    v2Note: "Floating 3/4 angled product shot on white",
  },
  {
    slug: "audemars-piguet-royal-oak",
    name: "Audemars Piguet Royal Oak",
    style: "architectural",
    v1Note: "Flat on raw concrete, soft directional light",
    v2Note: "Honed grey marble slab with overhead light",
  },
  {
    slug: "omega-speedmaster",
    name: "Omega Speedmaster",
    style: "daylight-lifestyle",
    v1Note: "Aged leather notebook + espresso, window light from left",
    v2Note: "Watchmaker's bench with brass loupe, window light upper-right",
  },
];

export default function TestImagesPage() {
  return (
    <div className="relative z-10 max-w-content mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="font-mono text-xs tracking-[0.16em] uppercase text-accent mb-3">Nano Banana — quality test</div>
      <h1 className="font-serif text-[clamp(2.2rem,5vw,3.5rem)] leading-tight tracking-tight mb-4">
        4 watches. 2 variants each.<br /><em className="italic text-accent">Approve to run the full 80.</em>
      </h1>
      <p className="text-text-soft max-w-2xl mb-12 leading-relaxed">
        Generated via Gemini 2.5 Flash Image API at $0.039/image. Compare v1 vs v2 per watch.
        If quality is solid → say <em>&quot;go full batch&quot;</em> and I&apos;ll generate all 80 (~$3, ~10 min).
        If anything looks bad → tell me which and I&apos;ll tune the prompts.
      </p>

      <div className="grid gap-12">
        {TESTS.map(t => (
          <div key={t.slug} className="border-t border-rule pt-8">
            <div className="flex items-baseline gap-3 mb-1 flex-wrap">
              <h2 className="font-serif text-3xl">{t.name}</h2>
              <span className="font-mono text-xs tracking-[0.14em] uppercase text-text-soft">style: {t.style}</span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {(["v1", "v2"] as const).map(v => (
                <div key={v}>
                  <div className="font-mono text-[0.7rem] tracking-[0.16em] uppercase text-accent mb-2">
                    {v.toUpperCase()} — {v === "v1" ? t.v1Note : t.v2Note}
                  </div>
                  <figure className="rounded-2xl overflow-hidden border border-rule bg-bg-2">
                    <img
                      src={`/articles-test/${t.slug}-${v}.jpg`}
                      alt={`${t.name} ${v}`}
                      width={1200}
                      height={630}
                      className="w-full h-auto block"
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
        <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-3">Decision</div>
        <h2 className="font-serif text-2xl mb-3">Pick a path</h2>
        <ul className="text-text-soft leading-relaxed space-y-2">
          <li>✅ <strong className="text-text">&quot;Go full batch&quot;</strong> — generate all 80 (~$3, ~10 min), wire into site, replace gpt-image-1 versions</li>
          <li>🔧 <strong className="text-text">&quot;Adjust prompts for [style/watch]&quot;</strong> — I tune and regen the test set</li>
          <li>↩️ <strong className="text-text">&quot;Stick with current images&quot;</strong> — keep gpt-image-1 versions, move on</li>
        </ul>
      </div>
    </div>
  );
}
