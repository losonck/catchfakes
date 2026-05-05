import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticle, listSlugs } from "@/lib/content";
import { ArticleSchema } from "@/components/ArticleSchema";

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
  return {
    title: article.meta.title,
    description: article.meta.description,
    alternates: { canonical: `/fake-watch-guide/${slug}` },
    openGraph: {
      title: article.meta.title,
      description: article.meta.description,
      type: "article",
      publishedTime: article.meta.publishedAt,
      modifiedTime: article.meta.updatedAt,
    },
  };
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <ArticleSchema meta={article.meta} />

      <div className="text-sm text-muted mb-3">
        {article.meta.brand} · {article.meta.refs.join(", ")} · {article.meta.readingMinutes} min read
      </div>
      <h1 className="font-serif text-3xl md:text-4xl leading-tight mb-6">
        {article.meta.title}
      </h1>

      <div className="prose-watch" dangerouslySetInnerHTML={{ __html: article.html }} />
    </article>
  );
}
