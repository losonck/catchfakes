import Link from "next/link";
import { listArticles, articleCardImagePath } from "@/lib/content";
import { getWatches } from "@/lib/watch-list";
import { APP_PAGE_URL } from "@/lib/seo";

export const dynamic = "force-static";

export default async function HomePage() {
  const articles = await listArticles();
  const published = new Set(articles.map(a => a.slug));
  const upcoming = getWatches().filter(w => !published.has(w.slug)).slice(0, 8);

  return (
    <>
      {/* Hero */}
      <section className="relative z-10 max-w-content mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-20 text-center">
        <div className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.1em] bg-bg-3 border border-rule px-3 py-2 rounded-full text-text-soft mb-8">
          <span className="text-signal text-[0.6rem]">●</span>
          {articles.length} reference guides live · powered by AI
        </div>
        <h1 className="font-serif font-normal text-[clamp(3.2rem,8vw,7rem)] leading-[1.0] tracking-[-0.02em] text-balance mb-8">
          Authenticate any watch.<br />
          <em className="italic bg-accent-gradient bg-clip-text text-transparent">In your pocket.</em>
        </h1>
        <p className="text-[clamp(1.15rem,1.7vw,1.35rem)] text-text-soft max-w-[620px] mx-auto leading-relaxed mb-10">
          Reference-grade authentication guides — and a mobile app that runs the same six checks on a photograph in under sixty seconds.
        </p>
        <div className="inline-flex flex-wrap gap-4 items-center justify-center">
          <a href="#guides" className="bg-accent-gradient text-ink font-semibold px-6 py-3.5 rounded-full shadow-glow hover:shadow-glow-strong hover:-translate-y-0.5 transition-all">
            Open the catalogue
          </a>
          <a href={APP_PAGE_URL} className="text-text-soft hover:text-text px-3 py-3.5 transition-colors">
            How it works →
          </a>
        </div>
      </section>

      {/* Hero device mockup */}
      <div className="relative z-10 max-w-[1080px] mx-auto px-4 sm:px-6 mt-8 sm:mt-16" style={{ perspective: "1500px" }}>
        <div className="relative aspect-[16/10] origin-bottom transition-transform duration-700 hover:[transform:rotateX(2deg)]" style={{ transform: "rotateX(8deg)" }}>
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border bg-gradient-to-b from-bg-3 to-bg-2"
            style={{ borderColor: "rgba(212,169,90,.2)", boxShadow: "0 60px 120px rgba(0,0,0,.6), inset 0 1px 0 rgba(212,169,90,.15)" }}
          >
            <div className="absolute inset-0 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-[280px_1fr] gap-4 sm:gap-8">
              <div className="bg-bg rounded-lg p-5 sm:p-6 flex flex-col gap-3">
                {[
                  ["DIAL", "PASS", "text-signal"],
                  ["CYCLOPS", "PASS", "text-signal"],
                  ["CASEBACK", "PASS", "text-signal"],
                  ["MOVEMENT", "CHECK", "text-accent"],
                  ["LUME", "PASS", "text-signal"],
                  ["BRACELET", "PASS", "text-signal"],
                ].map(([k, v, c]) => (
                  <div key={k} className="flex justify-between items-center font-mono text-[0.7rem] text-text-soft py-2 border-b border-rule">
                    <span>{k}</span>
                    <span className={c}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex-1 rounded-lg overflow-hidden relative bg-bg">
                  <img
                    src="/articles/rolex-submariner-v1.jpg?v=wm1"
                    alt="Watch under authentication"
                    width={1200}
                    height={630}
                    className="w-full h-full object-cover"
                    fetchPriority="high"
                  />
                  <div
                    className="absolute border-2 border-signal rounded-full pointer-events-none"
                    style={{
                      top: "32%", right: "28%", width: "14%", height: "14%",
                      boxShadow: "0 0 20px rgba(93,224,230,.5)",
                    }}
                  />
                </div>
                <div className="bg-bg border border-signal/30 rounded-lg p-4 font-mono text-sm text-signal flex justify-between items-center">
                  <span>AUTHENTICITY SCORE</span>
                  <span className="text-2xl text-text font-semibold">94<span className="text-text-soft text-[0.7em]">/100</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="relative z-10 max-w-content mx-auto mt-20 px-4 sm:px-6 py-8 border-y border-rule grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        {[
          [`${articles.length}`, "Reference guides"],
          ["12", "Brands covered"],
          ["6", "Checks per watch"],
          ["60s", "Average scan time"],
        ].map(([n, l]) => (
          <div key={l}>
            <div className="font-serif text-5xl text-accent leading-none mb-2">{n}</div>
            <div className="font-mono text-xs tracking-[0.12em] uppercase text-text-soft">{l}</div>
          </div>
        ))}
      </section>

      {/* Guides */}
      <section id="guides" className="relative z-10 max-w-content mx-auto px-4 sm:px-6 py-20 sm:py-28">
        <div className="text-center mb-16">
          <h2 className="font-serif text-[clamp(2.5rem,5vw,4rem)] leading-tight tracking-[-0.02em] mb-4">
            Every reference, <em className="italic bg-accent-gradient bg-clip-text text-transparent">deconstructed.</em>
          </h2>
          <p className="text-text-soft max-w-[540px] mx-auto">
            The dial. The crown. The rehaut. The caseback. The movement. The bracelet. Every point where modern fakes still betray themselves.
          </p>
        </div>

        {articles.length === 0 ? (
          <p className="text-center text-text-soft">No articles published yet.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map(a => (
              <Link
                key={a.slug}
                href={`/fake-watch-guide/${a.slug}`}
                className="group bg-gradient-to-b from-bg-2 to-bg border border-rule rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-accent/30 hover:shadow-2xl flex flex-col gap-3"
              >
                <div className="aspect-[16/10] rounded-xl mb-2 relative overflow-hidden bg-bg-2">
                  <img
                    src={articleCardImagePath(a.slug)}
                    alt={`${a.brand} ${a.model}`}
                    width={1200}
                    height={630}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="font-mono text-[0.7rem] tracking-[0.12em] uppercase text-accent">
                  {a.brand} · {a.refs[0]}
                </div>
                <h3 className="font-serif text-2xl leading-tight tracking-tight">{a.model}</h3>
                <p className="text-sm text-text-soft leading-relaxed line-clamp-2">{a.description}</p>
                <div className="mt-auto pt-3 border-t border-rule flex justify-between items-center font-mono text-[0.7rem] text-text-soft uppercase tracking-widest">
                  <span>{a.readingMinutes} min</span>
                  <span className="text-accent group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {upcoming.length > 0 && (
        <section className="relative z-10 max-w-content mx-auto px-4 sm:px-6 pb-20">
          <h2 className="font-mono text-xs tracking-[0.16em] uppercase text-text-soft mb-4">Coming soon</h2>
          <div className="flex flex-wrap gap-2">
            {upcoming.map(w => (
              <span key={w.slug} className="text-sm px-3 py-1 border border-rule rounded-full text-text-soft">
                {w.brand} {w.model}
              </span>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
