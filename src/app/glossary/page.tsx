import type { Metadata } from "next";
import { GLOSSARY } from "@/lib/glossary";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const SITE_URL = process.env.SITE_URL ?? "https://catchfakes.com";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Watch authentication glossary — the terms that matter",
  description:
    "Plain-English definitions of the terms used in authentication guides: calibre, rehaut, cyclops, Chromalight, Cerachrom, end-links and more. Written for buyers.",
  alternates: { canonical: "/glossary" },
  openGraph: {
    title: "Watch authentication glossary",
    description:
      "Plain-English definitions of the terms used in authentication guides: calibre, rehaut, cyclops, Chromalight, Cerachrom, end-links and more.",
    type: "website",
    url: `${SITE_URL}/glossary`,
  },
};

export default function GlossaryPage() {
  const sorted = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));

  const defSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Watch authentication glossary",
    url: `${SITE_URL}/glossary`,
    hasDefinedTerm: sorted.map(t => ({
      "@type": "DefinedTerm",
      "@id": `${SITE_URL}/glossary#${t.slug}`,
      name: t.term,
      alternateName: t.aliases,
      description: t.definition,
      inDefinedTermSet: `${SITE_URL}/glossary`,
    })),
  };

  const letters = Array.from(new Set(sorted.map(t => t.term[0].toUpperCase()))).sort();

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(defSchema) }}
      />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Glossary" }]} />

      <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
        Glossary <span className="text-accent">of watch terms</span>
      </h1>
      <p className="text-lg text-muted max-w-prose mb-10">
        The vocabulary our authentication guides use. If a term in a reference
        guide reads opaque, it is almost certainly here.
      </p>

      <nav
        aria-label="Jump to letter"
        className="flex flex-wrap gap-2 mb-12 pb-6 border-b border-ink/10"
      >
        {letters.map(l => (
          <a
            key={l}
            href={`#letter-${l}`}
            className="w-8 h-8 flex items-center justify-center border border-ink/15 rounded-sm text-sm hover:border-accent hover:text-accent"
          >
            {l}
          </a>
        ))}
      </nav>

      <dl className="space-y-10">
        {letters.map(letter => {
          const inLetter = sorted.filter(t => t.term[0].toUpperCase() === letter);
          return (
            <section key={letter} id={`letter-${letter}`}>
              <h2 className="font-serif text-2xl text-accent mb-6 scroll-mt-6">
                {letter}
              </h2>
              <div className="space-y-8">
                {inLetter.map(t => (
                  <div key={t.slug} id={t.slug} className="scroll-mt-6">
                    <dt className="font-serif text-xl mb-1">
                      {t.term}
                      {t.aliases && t.aliases.length > 0 && (
                        <span className="font-sans text-sm text-muted ml-2 font-normal">
                          · also {t.aliases.join(", ")}
                        </span>
                      )}
                    </dt>
                    <dd className="text-ink/85 leading-relaxed">{t.definition}</dd>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </dl>
    </div>
  );
}
