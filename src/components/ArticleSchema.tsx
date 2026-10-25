import type { ArticleFrontmatter, FaqItem } from "@/lib/content";

const SITE_URL = process.env.SITE_URL ?? "https://catchfakes.com";

export function ArticleSchema({
  meta,
  faqs,
}: {
  meta: ArticleFrontmatter;
  faqs?: FaqItem[];
}) {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt,
    author: { "@type": "Organization", name: "Fake Watch Guide" },
    publisher: {
      "@type": "Organization",
      name: "Fake Watch Guide",
      url: SITE_URL,
    },
    mainEntityOfPage: `${SITE_URL}/fake-watch-guide/${meta.slug}`,
    about: { "@type": "Product", brand: meta.brand, name: meta.model },
  };

  const faqSchema =
    faqs && faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(f => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
