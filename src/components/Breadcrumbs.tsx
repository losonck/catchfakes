const SITE_URL = process.env.SITE_URL ?? "https://catchfakes.com";

export interface Crumb {
  name: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      ...(c.href ? { item: `${SITE_URL}${c.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav
        aria-label="Breadcrumb"
        className="text-sm text-muted mb-6 flex flex-wrap gap-1.5"
      >
        {items.map((c, i) => (
          <span key={`${c.name}-${i}`} className="flex items-center gap-1.5">
            {c.href && i < items.length - 1 ? (
              <a href={c.href} className="hover:text-accent">
                {c.name}
              </a>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined}>
                {c.name}
              </span>
            )}
            {i < items.length - 1 && <span aria-hidden>›</span>}
          </span>
        ))}
      </nav>
    </>
  );
}
