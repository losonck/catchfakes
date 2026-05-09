/**
 * JSON-LD helpers. Centralised so all pages emit consistent schema
 * for traditional search and AI/LLM crawlers.
 */
export const SITE_URL = process.env.SITE_URL ?? "https://catchfakes.com";
export const SITE_NAME = "Catch Fakes";
export const SITE_DESCRIPTION =
  "Reference-grade watch authentication guides. Real or fake — six checks per reference, written by authenticators for buyers.";
export const APP_URL = process.env.APP_URL ?? "https://watchauthenticator.app";
export const APP_NAME = process.env.APP_NAME ?? "Watch Authenticator";

export interface ArticleMeta {
  slug: string;
  brand: string;
  model: string;
  refs: string[];
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
}

export const orgSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  sameAs: [APP_URL],
});

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en",
});

export const articleSchema = (m: ArticleMeta) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${SITE_URL}/fake-watch-guide/${m.slug}#article`,
  headline: m.title,
  description: m.description,
  datePublished: m.publishedAt,
  dateModified: m.updatedAt,
  inLanguage: "en",
  isAccessibleForFree: true,
  author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  publisher: { "@id": `${SITE_URL}/#organization` },
  mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/fake-watch-guide/${m.slug}` },
  about: {
    "@type": "Product",
    brand: { "@type": "Brand", name: m.brand },
    name: `${m.brand} ${m.model}`,
    model: m.model,
    sku: m.refs.join(", "),
  },
  keywords: [
    `fake ${m.brand} ${m.model}`,
    `real or fake ${m.model}`,
    `${m.brand} ${m.model} authentication`,
    `spot a fake ${m.brand}`,
    ...m.refs.map(r => `${m.brand} ${r} authentication`),
  ].join(", "),
});

export const breadcrumbSchema = (m: ArticleMeta) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Authentication Guides", item: `${SITE_URL}/#guides` },
    { "@type": "ListItem", position: 3, name: `${m.brand} ${m.model}`, item: `${SITE_URL}/fake-watch-guide/${m.slug}` },
  ],
});

/** Extract simple Q&A pairs from markdown body for FAQ schema.
 *  Matches "## FAQ" section followed by "### Question?" / "answer paragraph". */
export function extractFaq(markdown: string): Array<{ q: string; a: string }> {
  const faqMatch = markdown.match(/##\s*FAQ\s*\r?\n([\s\S]*?)(?=\r?\n##\s|\r?\n---|\r?\n>|$)/i);
  if (!faqMatch) return [];
  const body = faqMatch[1];
  const items: Array<{ q: string; a: string }> = [];
  const re = /###\s+(.+?)\r?\n+([\s\S]*?)(?=\r?\n###\s|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const q = m[1].trim();
    const a = m[2].replace(/\r?\n+/g, " ").trim();
    if (q && a) items.push({ q, a });
  }
  return items;
}

export const faqSchema = (qa: Array<{ q: string; a: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: qa.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
});

/** Render an array of JSON-LD objects as a single script string. */
export function renderJsonLd(...nodes: object[]): string {
  return JSON.stringify(nodes.length === 1 ? nodes[0] : { "@context": "https://schema.org", "@graph": nodes });
}
