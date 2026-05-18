import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { marked } from "marked";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface PhotoAttribution {
  photographer: string;
  license: string;
  license_url?: string;
  source_page?: string;
}

let _attribution: Record<string, { v1?: PhotoAttribution; v2?: PhotoAttribution }> | null = null;

/** Returns photo attribution for a slug's article-hero variant (v2), or null if AI-generated. */
export function getPhotoAttribution(slug: string): PhotoAttribution | null {
  if (_attribution === null) {
    const p = path.join(process.cwd(), "data", "photo-attribution.json");
    try {
      _attribution = JSON.parse(fsSync.readFileSync(p, "utf-8"));
    } catch {
      _attribution = {};
    }
  }
  return _attribution?.[slug]?.v2 ?? null;
}

marked.setOptions({ gfm: true, breaks: false });

export interface ArticleFrontmatter {
  slug: string;
  brand: string;
  model: string;
  refs: string[];
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
}

/** Cache-busting suffix — bump when image batch is regenerated to force browsers to refetch. */
const IMG_VERSION = "wm3";

/** Hero image used on the article page itself + per-article OG image. */
export function articleImagePath(slug: string): string {
  return `/articles/${slug}-v2.jpg?v=${IMG_VERSION}`;
}

/** Smaller card image used on the homepage grid (visually distinct from the article hero). */
export function articleCardImagePath(slug: string): string {
  return `/articles/${slug}-v1.jpg?v=${IMG_VERSION}`;
}

export interface Article {
  meta: ArticleFrontmatter;
  html: string;
  raw: string;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const match = raw.match(FRONTMATTER_RE);
  if (!match) return { data: {}, content: raw };

  const [, head, body] = match;
  const data: Record<string, unknown> = {};

  for (const line of head.split(/\r?\n/)) {
    const eq = line.indexOf(":");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (!key) continue;

    if (val.startsWith("[") && val.endsWith("]")) {
      try { data[key] = JSON.parse(val); continue; } catch {}
    }
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (/^-?\d+(?:\.\d+)?$/.test(val)) {
      data[key] = Number(val);
    } else {
      data[key] = val;
    }
  }

  return { data, content: body };
}

export async function listSlugs(): Promise<string[]> {
  try {
    const files = await fs.readdir(CONTENT_DIR);
    return files.filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, ""));
  } catch {
    return [];
  }
}

export async function getArticle(slug: string): Promise<Article | null> {
  const file = path.join(CONTENT_DIR, `${slug}.md`);
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf-8");
  } catch {
    return null;
  }
  const { data, content } = parseFrontmatter(raw);
  const html = marked.parse(content) as string;
  return {
    meta: data as unknown as ArticleFrontmatter,
    html,
    raw: content,
  };
}

export async function listArticles(): Promise<ArticleFrontmatter[]> {
  const slugs = await listSlugs();
  const articles = await Promise.all(slugs.map(getArticle));
  return articles
    .filter((a): a is Article => a !== null)
    .map(a => a.meta)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
