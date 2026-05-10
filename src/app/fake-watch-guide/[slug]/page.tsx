import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, listSlugs, articleImagePath, getPhotoAttribution } from "@/lib/content";
import { ArticleSchema } from "@/components/ArticleSchema";
import { extractFaq, SITE_URL, SITE_NAME, APP_PAGE_URL, APP_NAME } from "@/lib/seo";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await listSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  const url = `${SITE_URL}/fake-watch-guide/${slug}`;
  return {
    title: article.meta.title,
    description: article.meta.description,
    alternates: { canonical: `/fake-watch-guide/${slug}` },
    openGraph: {
      type: "article",
      title: article.meta.title,
      description: article.meta.description,
      url,
      siteName: SITE_NAME,
      publishedTime: article.meta.publishedAt,
      modifiedTime: article.meta.updatedAt,
      authors: [SITE_URL],
      tags: [
        article.meta.brand,
        article.meta.model,
        ...article.meta.refs,
        "watch authentication",
        `fake ${article.meta.brand}`,
      ],
      images: [{ url: articleImagePath(slug), width: 1200, height: 630, alt: article.meta.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.meta.title,
      description: article.meta.description,
      images: [articleImagePath(slug)],
    },
    keywords: [
      `fake ${article.meta.brand} ${article.meta.model}`,
      `real or fake ${article.meta.model}`,
      `${article.meta.brand} ${article.meta.model} authentication`,
      `spot a fake ${article.meta.brand}`,
      ...article.meta.refs.map(r => `${article.meta.brand} ${r}`),
    ],
  };
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const faq = extractFaq(article.raw);

  return (
    <>
      <ArticleSchema meta={article.meta} faq={faq} />
      <article className="relative z-10 max-w-prose mx-auto px-4 sm:px-6 py-16 sm:py-20">
        {/* Breadcrumb (semantic + visible) */}
        <nav aria-label="Breadcrumb" className="font-mono text-xs tracking-[0.14em] uppercase text-text-soft mb-6">
          <Link href="/" className="hover:text-accent">Home</Link>
          <span className="mx-2 text-text-soft/50">/</span>
          <span className="text-accent">{article.meta.brand}</span>
        </nav>

        <header className="mb-12">
          <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-4">
            Authentication Guide · {article.meta.brand} · {article.meta.refs.join(", ")}
          </div>
          <h1 className="font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em] mb-6">
            {article.meta.title}
          </h1>
          <p className="text-xl text-text-soft leading-relaxed mb-8">{article.meta.description}</p>
          <figure className="-mx-4 sm:-mx-6 mb-8">
            <div className="rounded-2xl overflow-hidden border border-rule">
              <img
                src={articleImagePath(slug)}
                alt={`${article.meta.brand} ${article.meta.model}`}
                width={1200}
                height={630}
                className="w-full h-auto block"
                fetchPriority="high"
              />
            </div>
            {(() => {
              const attr = getPhotoAttribution(slug);
              if (!attr) return null;
              return (
                <figcaption className="mt-2 px-4 sm:px-6 font-mono text-[0.7rem] tracking-wider text-text-soft">
                  Photo: {attr.photographer} · {attr.license}
                  {attr.source_page && (
                    <> · <a href={attr.source_page} target="_blank" rel="noopener" className="text-accent hover:underline">source</a></>
                  )}
                </figcaption>
              );
            })()}
          </figure>
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs tracking-wider uppercase text-text-soft pt-6 border-t border-rule">
            <span>By <span className="text-text">{SITE_NAME} Authentication Desk</span></span>
            <span>{article.meta.readingMinutes} min read</span>
            <time dateTime={article.meta.updatedAt}>
              Updated {new Date(article.meta.updatedAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
            </time>
          </div>
        </header>

        <div
          className="prose-article"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        {/* App CTA — also helps internal linking signal */}
        <aside className="mt-16 p-8 rounded-2xl bg-gradient-to-br from-bg-2 to-bg-3 border border-accent/20">
          <div className="font-mono text-xs tracking-[0.14em] uppercase text-accent mb-3">Run these checks automatically</div>
          <h2 className="font-serif text-3xl mb-3 leading-tight">
            Want a second opinion in <em className="italic text-accent">sixty seconds?</em>
          </h2>
          <p className="text-text-soft mb-6 leading-relaxed">
            <strong className="text-text">{APP_NAME}</strong> scans a photo and runs the same six checks — dial, crown, rehaut, caseback, movement, bracelet — and flags anything off.
          </p>
          <a
            href={APP_PAGE_URL}
            className="inline-flex bg-accent-gradient text-ink font-semibold px-5 py-3 rounded-full shadow-glow hover:shadow-glow-strong hover:-translate-y-0.5 transition-all"
          >
            Get {APP_NAME} →
          </a>
        </aside>

        {/* Internal linking — boosts SEO + AI crawl coverage */}
        <RelatedArticles currentSlug={slug} />
      </article>
    </>
  );
}

async function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const { listArticles } = await import("@/lib/content");
  const all = await listArticles();
  const related = all.filter(a => a.slug !== currentSlug).slice(0, 4);
  if (related.length === 0) return null;
  return (
    <nav aria-label="Related guides" className="mt-16 pt-12 border-t border-rule">
      <h2 className="font-mono text-xs tracking-[0.16em] uppercase text-text-soft mb-6">More authentication guides</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {related.map(a => (
          <Link
            key={a.slug}
            href={`/fake-watch-guide/${a.slug}`}
            className="group block p-5 rounded-xl bg-bg-2 border border-rule hover:border-accent/30 transition-colors"
          >
            <div className="font-mono text-[0.65rem] tracking-[0.14em] uppercase text-accent mb-2">
              {a.brand}
            </div>
            <div className="font-serif text-xl leading-tight mb-2">{a.model}</div>
            <div className="font-mono text-[0.7rem] tracking-wider uppercase text-text-soft">
              {a.readingMinutes} min · {a.refs[0]} <span className="text-accent group-hover:translate-x-1 inline-block transition-transform">→</span>
            </div>
          </Link>
        ))}
      </div>
    </nav>
  );
}
