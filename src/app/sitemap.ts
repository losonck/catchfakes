import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/content";

const SITE_URL = process.env.SITE_URL ?? "https://catchfakes.com";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await listArticles();
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    ...articles.map(a => ({
      url: `${SITE_URL}/fake-watch-guide/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
