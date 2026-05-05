import type { ArticleFrontmatter } from "@/lib/content";

const SITE_URL = process.env.SITE_URL ?? "https://fakewatch.guide";

export function ArticleSchema({ meta }: { meta: ArticleFrontmatter }) {
  const json = {
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
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
