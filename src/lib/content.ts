import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkHtml from "remark-html";
import remarkGfm from "remark-gfm";

const CONTENT_DIR = path.join(process.cwd(), "content");

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

export interface Article {
  meta: ArticleFrontmatter;
  html: string;
  raw: string;
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
  const { data, content } = matter(raw);
  const processed = await remark().use(remarkGfm).use(remarkHtml).process(content);
  return {
    meta: data as ArticleFrontmatter,
    html: processed.toString(),
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
