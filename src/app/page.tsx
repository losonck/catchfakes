import Link from "next/link";
import { listArticles } from "@/lib/content";
import { WATCHES } from "@/lib/watch-list";

export const dynamic = "force-static";

export default async function HomePage() {
  const articles = await listArticles();
  const published = new Set(articles.map(a => a.slug));
  const upcoming = WATCHES.filter(w => !published.has(w.slug)).slice(0, 8);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <section className="mb-16">
        <h1 className="font-serif text-4xl md:text-5xl leading-tight mb-4">
          Real or fake? <span className="text-accent">Know in minutes.</span>
        </h1>
        <p className="text-lg text-muted max-w-prose">
          Reference-by-reference authentication guides written for buyers — what to look at,
          what to compare, and what every faker still gets wrong.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-2xl mb-6">Authentication guides</h2>
        {articles.length === 0 ? (
          <p className="text-muted">No articles published yet — run <code>pnpm generate &lt;slug&gt;</code> to create one.</p>
        ) : (
          <ul className="divide-y divide-ink/10">
            {articles.map(a => (
              <li key={a.slug} className="py-5">
                <Link href={`/fake-watch-guide/${a.slug}`} className="block group">
                  <div className="font-serif text-xl group-hover:text-accent">{a.title}</div>
                  <div className="text-sm text-muted mt-1">
                    {a.brand} · {a.refs.join(", ")} · {a.readingMinutes} min read
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {upcoming.length > 0 && (
        <section className="mt-16">
          <h2 className="font-serif text-2xl mb-4">Coming soon</h2>
          <div className="flex flex-wrap gap-2">
            {upcoming.map(w => (
              <span key={w.slug} className="text-sm px-3 py-1 border border-ink/15 rounded-full text-muted">
                {w.brand} {w.model}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
