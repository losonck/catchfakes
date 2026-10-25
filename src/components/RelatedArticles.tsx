import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/content";

export function RelatedArticles({ articles }: { articles: ArticleFrontmatter[] }) {
  if (articles.length === 0) return null;
  return (
    <aside className="mt-16 pt-10 border-t border-ink/10">
      <h2 className="font-serif text-2xl mb-6">Related guides</h2>
      <ul className="divide-y divide-ink/10">
        {articles.map(a => (
          <li key={a.slug} className="py-4">
            <Link
              href={`/fake-watch-guide/${a.slug}`}
              className="block group"
            >
              <div className="font-serif text-lg group-hover:text-accent">
                {a.title}
              </div>
              <div className="text-sm text-muted mt-1">
                {a.brand} · {a.refs.join(", ")} · {a.readingMinutes} min read
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
