import { articleSchema, breadcrumbSchema, faqSchema, renderJsonLd, type ArticleMeta } from "@/lib/seo";

interface Props {
  meta: ArticleMeta;
  faq?: Array<{ q: string; a: string }>;
}

/** Emits Article + BreadcrumbList + (optional) FAQPage JSON-LD as one @graph blob. */
export function ArticleSchema({ meta, faq }: Props) {
  const nodes: object[] = [articleSchema(meta), breadcrumbSchema(meta)];
  if (faq && faq.length > 0) nodes.push(faqSchema(faq));
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: renderJsonLd(...nodes) }}
    />
  );
}
