/**
 * Generate one article: `pnpm generate <slug>`
 * e.g. `pnpm generate rolex-submariner`
 *
 * Writes content/<slug>.md with frontmatter + markdown body.
 * Idempotent — overwrites if file exists.
 */
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { openai, GPT_MODEL } from "../src/lib/openai";
import { findWatch } from "../src/lib/watch-list";

const APP_NAME = process.env.APP_NAME ?? "Watch Authenticator";
const APP_URL = process.env.APP_URL ?? "https://watchauthenticator.app";

const ArticleSchema = z.object({
  title: z.string().min(20).max(80),
  description: z.string().min(80).max(180),
  intro: z.string().min(200),
  sections: z.array(z.object({
    heading: z.string(),
    body_markdown: z.string().min(150),
  })).min(5).max(10),
  red_flags_quick_list: z.array(z.string().min(10)).min(5).max(12),
  faq: z.array(z.object({ q: z.string(), a: z.string() })).min(3).max(6),
  closing: z.string().min(80),
});

const SYSTEM = `You are an expert watch authenticator writing in-depth SEO articles for buyers.

Goals:
- Help readers actually identify counterfeits.
- Be specific to the brand/model/reference — never generic.
- Cite the physical details that experts check (dial printing, crown action, rehaut engraving, caseback, movement decoration, lume colour, bezel insert, bracelet end-link fit, weight, sound, etc).
- Tone: confident, specialist, no fluff. British/Irish English spelling.
- Length: 1,500–2,200 words.
- Strict JSON output — no markdown around JSON.

Article structure:
- title: SEO title under 70 chars, contains "fake" + brand + model
- description: 80-180 chars, meta description
- intro: 200+ words, hook + stakes (cost of getting fooled, scale of the counterfeit market for this model)
- sections: 5-10 sections covering specific authentication checks. Each heading is a real check (e.g. "The Cyclops Magnification", "Caseback Engravings", "Bracelet End-Links and Clasp"). body_markdown is detailed prose with specifics.
- red_flags_quick_list: 5-12 short scannable red flags
- faq: 3-6 Q&A pairs targeting search-intent questions
- closing: 80+ words, final advice + soft mention of getting a second opinion`;

const USER = (brand: string, model: string, refs: string[]) => `Write a complete authentication guide for the ${brand} ${model} (${refs.join(", ")}).

Be specific to THIS reference family. Mention real movement calibers, real bracelet codes, real bezel materials. If you are not certain about a specific micro-detail, describe the category instead of inventing a number.

Return strict JSON matching the schema you've been told. Do not include markdown fences.`;

function toMarkdown(slug: string, watch: { brand: string; model: string; refs: string[] }, a: z.infer<typeof ArticleSchema>): string {
  const now = new Date().toISOString();
  const words = (a.intro + a.sections.map(s => s.body_markdown).join(" ") + a.closing).split(/\s+/).length;
  const minutes = Math.max(4, Math.round(words / 220));

  const frontmatter = [
    "---",
    `slug: "${slug}"`,
    `brand: "${watch.brand}"`,
    `model: "${watch.model}"`,
    `refs: ${JSON.stringify(watch.refs)}`,
    `title: ${JSON.stringify(a.title)}`,
    `description: ${JSON.stringify(a.description)}`,
    `publishedAt: "${now}"`,
    `updatedAt: "${now}"`,
    `readingMinutes: ${minutes}`,
    "---",
    "",
  ].join("\n");

  const sections = a.sections.map(s => `## ${s.heading}\n\n${s.body_markdown}`).join("\n\n");
  const flags = a.red_flags_quick_list.map(f => `- ${f}`).join("\n");
  const faq = a.faq.map(({ q, a: ans }) => `### ${q}\n\n${ans}`).join("\n\n");

  return `${frontmatter}${a.intro}

${sections}

## Red Flags at a Glance

${flags}

## FAQ

${faq}

## Final Word

${a.closing}

---

> Want a second opinion in seconds? **${APP_NAME}** scans a photo and runs the same checks — dial, crown, rehaut, caseback, movement — flagging anything off. [Try it →](${APP_URL})
`;
}

async function generate(slug: string) {
  const watch = findWatch(slug);
  if (!watch) {
    console.error(`Unknown slug: ${slug}. Add it to data/watches.json first.`);
    process.exit(1);
  }

  console.log(`Generating: ${watch.brand} ${watch.model} (${watch.refs.join(", ")})`);

  const resp = await openai.chat.completions.create({
    model: GPT_MODEL,
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 4000,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: USER(watch.brand, watch.model, watch.refs) },
    ],
  });

  const raw = resp.choices[0].message.content;
  if (!raw) throw new Error("Empty response from GPT");
  const parsed = ArticleSchema.parse(JSON.parse(raw));
  const md = toMarkdown(slug, watch, parsed);

  const out = path.join(process.cwd(), "content", `${slug}.md`);
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, md, "utf-8");
  console.log(`Wrote ${out} (${md.length} chars)`);
}

const slug = process.argv[2];
if (!slug) {
  console.error("Usage: pnpm generate <slug>");
  process.exit(1);
}

generate(slug).catch(err => {
  console.error(err);
  process.exit(1);
});
