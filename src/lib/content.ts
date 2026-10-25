import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

const CONTENT_DIR = path.join(process.cwd(), "content");

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

export interface FaqItem {
  question: string;
  answer: string;
}

export function extractFaq(raw: string): FaqItem[] {
  const lines = raw.split(/\r?\n/);
  const faqs: FaqItem[] = [];
  let inFaq = false;
  let current: FaqItem | null = null;
  const answerBuf: string[] = [];

  const flush = () => {
    if (current) {
      const answer = answerBuf.join("\n").trim();
      if (answer) faqs.push({ question: current.question, answer });
    }
    current = null;
    answerBuf.length = 0;
  };

  for (const line of lines) {
    if (/^##\s+FAQ\s*$/i.test(line)) { inFaq = true; continue; }
    if (!inFaq) continue;
    if (/^##\s+/.test(line) && !/^##\s+FAQ/i.test(line)) {
      flush();
      inFaq = false;
      continue;
    }
    const q = line.match(/^###\s+(.+?)\s*$/);
    if (q) {
      flush();
      current = { question: q[1], answer: "" };
      continue;
    }
    if (current) answerBuf.push(line);
  }
  flush();
  return faqs;
}

export async function getRelatedArticles(
  slug: string,
  limit = 4,
): Promise<ArticleFrontmatter[]> {
  const all = await listArticles();
  const self = all.find(a => a.slug === slug);
  if (!self) return all.slice(0, limit);
  const sameBrand = all.filter(a => a.slug !== slug && a.brand === self.brand);
  const others = all.filter(a => a.slug !== slug && a.brand !== self.brand);
  return [...sameBrand, ...others].slice(0, limit);
}
