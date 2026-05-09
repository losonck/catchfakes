import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME, APP_STORE_URL, SITE_NAME, SITE_URL, renderJsonLd } from "@/lib/seo";

export const dynamic = "force-static";

const PAGE_DESC = `${APP_NAME} — AI-powered watch authentication on iOS and Android. Scan a photo, run six diagnostic checks, get a confidence score in sixty seconds.`;

export const metadata: Metadata = {
  title: `${APP_NAME} — AI watch authentication app`,
  description: PAGE_DESC,
  alternates: { canonical: "/app" },
  openGraph: {
    type: "website",
    title: `${APP_NAME} — AI watch authentication app`,
    description: PAGE_DESC,
    url: `${SITE_URL}/app`,
    siteName: SITE_NAME,
  },
  twitter: { card: "summary_large_image", title: `${APP_NAME}`, description: PAGE_DESC },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "MobileApplication",
  name: APP_NAME,
  description: PAGE_DESC,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Android",
  url: APP_STORE_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free to download. In-app purchases for full authentication reports.",
  },
  publisher: { "@id": `${SITE_URL}/#organization` },
};

const features = [
  { k: "DIAL", t: "Dial printing", d: "Crispness, alignment, applied indices, and lacquer depth — analysed against the reference family." },
  { k: "CYCLOPS", t: "Cyclops magnification", d: "Genuine 2.5× vs counterfeit 1.8×. Measured directly from the photograph." },
  { k: "CASEBACK", t: "Caseback details", d: "Engravings (or absence), surface finish, and screw-down evidence — instant fail flags caught immediately." },
  { k: "MOVEMENT", t: "Movement", d: "When visible: caliber identification, finishing analysis, rotor decoration. Conclusive when accessible." },
  { k: "LUME", t: "Lume application", d: "Colour, intensity, and uniformity. Counterfeit Chromalight burns green; genuine glows blue." },
  { k: "BRACELET", t: "Bracelet & end-links", d: "Tolerance against the case, clasp action, micro-adjustment behaviour, and reference codes." },
];

export default function AppPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: renderJsonLd(softwareSchema) }} />

      {/* Hero */}
      <section className="relative z-10 max-w-content mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <div className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] bg-bg-3 border border-rule px-3 py-2 rounded-full text-text-soft mb-8">
          <span className="text-signal text-[0.6rem]">●</span>
          Available now on Google Play
        </div>
        <h1 className="font-serif font-normal text-[clamp(3rem,7vw,6rem)] leading-[1] tracking-[-0.02em] text-balance mb-6">
          {APP_NAME}.<br />
          <em className="italic bg-accent-gradient bg-clip-text text-transparent">Six checks. Sixty seconds.</em>
        </h1>
        <p className="text-[clamp(1.1rem,1.6vw,1.3rem)] text-text-soft max-w-[640px] mx-auto leading-relaxed mb-10">
          The same authentication method used in every <Link href="/" className="text-accent underline-offset-4 hover:underline">Catch Fakes guide</Link> — automated, in your pocket, on a photograph.
        </p>
        <div className="inline-flex flex-wrap gap-4 items-center justify-center">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener"
            className="bg-accent-gradient text-ink font-semibold px-6 py-3.5 rounded-full shadow-glow hover:shadow-glow-strong hover:-translate-y-0.5 transition-all"
          >
            Get on Google Play →
          </a>
          <span className="text-text-soft text-sm">iOS coming soon</span>
        </div>
      </section>

      {/* Hero device mockup — same component idea as homepage */}
      <div className="relative z-10 max-w-[1080px] mx-auto px-4 sm:px-6 mt-8 sm:mt-12" style={{ perspective: "1500px" }}>
        <div className="relative aspect-[16/10] origin-bottom transition-transform duration-700 hover:[transform:rotateX(2deg)]" style={{ transform: "rotateX(8deg)" }}>
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border bg-gradient-to-b from-bg-3 to-bg-2"
            style={{ borderColor: "rgba(212,169,90,.2)", boxShadow: "0 60px 120px rgba(0,0,0,.6), inset 0 1px 0 rgba(212,169,90,.15)" }}
          >
            <div className="absolute inset-0 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-[280px_1fr] gap-4 sm:gap-8">
              <div className="bg-bg rounded-lg p-5 sm:p-6 flex flex-col gap-3">
                {[
                  ["DIAL", "PASS", "text-signal"],
                  ["CYCLOPS", "PASS", "text-signal"],
                  ["CASEBACK", "PASS", "text-signal"],
                  ["MOVEMENT", "CHECK", "text-accent"],
                  ["LUME", "PASS", "text-signal"],
                  ["BRACELET", "PASS", "text-signal"],
                ].map(([k, v, c]) => (
                  <div key={k} className="flex justify-between items-center font-mono text-[0.7rem] text-text-soft py-2 border-b border-rule">
                    <span>{k}</span>
                    <span className={c}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <div
                  className="flex-1 rounded-lg overflow-hidden relative"
                  style={{ background: "radial-gradient(circle at 30% 30%, #4a4438, #14110d 70%), #0B0B0F" }}
                >
                  <div
                    className="absolute rounded-full"
                    style={{
                      inset: "25%",
                      background: "radial-gradient(circle at 35% 30%, #6a604f, #1c1916 70%)",
                      boxShadow: "0 30px 60px rgba(0,0,0,.6)",
                    }}
                  />
                  <div
                    className="absolute border-2 border-signal rounded-full"
                    style={{ top: "32%", right: "28%", width: "14%", height: "14%", boxShadow: "0 0 20px rgba(93,224,230,.5)" }}
                  />
                </div>
                <div className="bg-bg border border-signal/30 rounded-lg p-4 font-mono text-sm text-signal flex justify-between items-center">
                  <span>AUTHENTICITY SCORE</span>
                  <span className="text-2xl text-text font-semibold">94<span className="text-text-soft text-[0.7em]">/100</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <section className="relative z-10 max-w-content mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-16">
          <h2 className="font-serif text-[clamp(2.4rem,5vw,3.5rem)] leading-tight tracking-[-0.02em] mb-4">
            Six checks. <em className="italic bg-accent-gradient bg-clip-text text-transparent">Every reference.</em>
          </h2>
          <p className="text-text-soft max-w-[540px] mx-auto">
            The diagnostic method, automated. Run all six against a photograph and get a per-component verdict in under a minute.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <div key={f.k} className="bg-gradient-to-b from-bg-2 to-bg border border-rule rounded-2xl p-6 flex flex-col gap-3">
              <div className="font-mono text-[0.7rem] tracking-[0.16em] text-accent">CHECK · {f.k}</div>
              <h3 className="font-serif text-2xl leading-tight">{f.t}</h3>
              <p className="text-sm text-text-soft leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 max-w-content mx-auto px-4 sm:px-6 pb-24">
        <div className="rounded-3xl bg-gradient-to-br from-bg-2 to-bg-3 border border-accent/20 p-10 sm:p-16 text-center">
          <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-tight mb-4">
            Ready to <em className="italic text-accent">authenticate?</em>
          </h2>
          <p className="text-text-soft max-w-[480px] mx-auto mb-8">
            Free to download. In-app purchases unlock full authentication reports for any reference.
          </p>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener"
            className="inline-flex bg-accent-gradient text-ink font-semibold px-7 py-4 rounded-full shadow-glow hover:shadow-glow-strong hover:-translate-y-0.5 transition-all"
          >
            Get on Google Play →
          </a>
          <div className="mt-4 text-text-soft text-xs font-mono tracking-wider">iOS coming soon</div>
        </div>
      </section>
    </>
  );
}
