import type { Metadata } from "next";
import { SITE_NAME, APP_NAME, APP_URL } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Method",
  description: `How ${SITE_NAME} authenticates watches: the six-check method used in every reference guide and in the ${APP_NAME} mobile app.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="relative z-10 max-w-prose mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-4">Method</div>
      <h1 className="font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em] mb-6">
        Six checks. <em className="italic text-accent">Every reference.</em>
      </h1>
      <p className="text-xl text-text-soft leading-relaxed mb-12">
        Modern counterfeit watches have closed the visual gap to genuine pieces. Photographs no longer reveal them. In-hand examination is now mandatory — and these are the six points where it begins.
      </p>

      <div className="prose-article">
        <h2>The six checks</h2>
        <p>Every reference guide on <strong>{SITE_NAME}</strong> is structured around the same six diagnostic checks. Each is examinable in under a minute, individually meaningful, and collectively conclusive. If three or more flag, the watch is almost certainly counterfeit.</p>

        <h3>1 — Dial</h3>
        <p>Printing crispness, applied indices, lacquer depth, and the alignment of small text. A counterfeit dial almost always reveals itself under a 10× loupe — feathering, off-centre placement, or wrong typography for the reference.</p>

        <h3>2 — Crown</h3>
        <p>The crown action, the engraving sharpness on the logo, and the gasket fit. Genuine crowns engage with a precise click sequence. Counterfeit crowns are usually slightly larger or smaller than spec and screw down with a different feel.</p>

        <h3>3 — Rehaut</h3>
        <p>The inner ring between the dial and crystal. On modern Rolex it carries laser-etched engraving — depth, font, and angle of the engraving are all diagnostic.</p>

        <h3>4 — Caseback</h3>
        <p>For most modern luxury watches, the caseback is solid and unengraved. Any logo, model name, or text on a Rolex caseback (post-1990) is an immediate fail.</p>

        <h3>5 — Movement</h3>
        <p>When accessible, the movement is conclusive. Genuine Geneva striping, perlage, and rotor finishing cannot be replicated by counterfeit movements at any price point. Caliber numbers should match the reference.</p>

        <h3>6 — Bracelet</h3>
        <p>End-link fit (no daylight against the case), clasp action, micro-adjustment clicks, and the bracelet code engraved between lugs. Counterfeit bracelets are the most common tell — the tolerances are wrong.</p>

        <h2>Why six</h2>
        <p>Six is the minimum number of diagnostic points where modern counterfeits still fail consistently. Fewer, and a single ambiguous result swings the verdict. More, and most casual buyers will skip checks they can&apos;t easily perform.</p>

        <h2>The app</h2>
        <p><a href={APP_URL}><strong>{APP_NAME}</strong></a> runs the same six checks on a photograph using GPT-4o vision. Sixty seconds, a confidence score, and a flagged list of any check that came back inconclusive.</p>
      </div>
    </article>
  );
}
