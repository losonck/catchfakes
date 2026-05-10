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
/** Internal CTA target on catchfakes.com — never hardcode an external URL into article markdown. */
const APP_PAGE_URL = process.env.APP_PAGE_URL ?? "/app";

const ArticleSchema = z.object({
  title: z.string().min(20).max(80),
  description: z.string().min(80).max(180),
  intro: z.string().min(200),
  sections: z.array(z.object({
    heading: z.string(),
    body_markdown: z.string().min(150),
  })).min(5).max(10),
  red_flags_quick_list: z.array(z.string().min(10)).min(5).max(12),
  faq: z.array(
    z.object({
      q: z.string().optional(),
      a: z.string().optional(),
      question: z.string().optional(),
      answer: z.string().optional(),
    }).transform(v => ({
      q: v.q ?? v.question ?? "",
      a: v.a ?? v.answer ?? "",
    })).refine(v => v.q.length > 0 && v.a.length > 0, "FAQ entry needs question + answer")
  ).min(3).max(6),
  closing: z.string().min(80),
});

const SYSTEM = `You are an expert watch authenticator writing in-depth SEO articles for buyers in 2026.

GOALS
- Help readers actually identify counterfeits.
- Be specific to the brand/model/reference — never generic.
- Cite the physical details that experts check.
- Tone: confident, specialist, no fluff. British/Irish English spelling.
- Length: 1,500–2,200 words.
- Strict JSON output — no markdown around JSON.

FACTS DISCIPLINE — CRITICAL
- If you are not 95%+ certain of a specific fact, do NOT include it. Say "consult the model's official datasheet" instead of inventing.
- For each reference, the caliber/movement number MUST match THAT specific reference. Many references in the same family use DIFFERENT calibers (e.g. Rolex 116500LN uses 4130 but the newer 126500LN uses 4131; the Pelagos 25600 uses MT5612 but the Pelagos 39 (25407N) uses MT5400). Always check year-of-release vs caliber generation.
- DO NOT invent or guess bracelet codes. Only cite a bracelet code if it is widely-published and unambiguous (e.g. Rolex Sub 116610LN's 97200). If unsure, omit the code entirely or say "the bracelet has a code stamped inside the clasp; check it matches the model's published code from manufacturer service literature."
- Caseback: be precise about whether a specific reference has a SOLID caseback or DISPLAY/SAPPHIRE caseback. Many sport watches in the same family vary on this — verify per reference.
- Brand-specific details: a Tudor Black Bay 58 79030N/B uses the Tudor SHIELD logo (not the rose). A Patek Nautilus 5711/1A was discontinued in 2021. Always note major discontinuations or model-year transitions where they affect what a buyer sees.
- For 2026 buyers, the dominant counterfeit threat is the "super-clone" (high-quality Guangzhou/Shenzhen replicas with matching weight, ETA-derived movements, ceramic bezels). Mention this context in the intro for the highest-counterfeited models. The diagnostic that still works is fine micro-detail (printing depth, applied-index alignment, rehaut engraving depth, bracelet tolerance) — NOT weight, NOT "almost inaudible tick", NOT vague "feel".

FORBIDDEN CLICHÉS — do not use these (super-clones match them now)
- "substantial weight" / "feels solid on the wrist"
- "almost inaudible tick"
- "smooth, sweeping second hand" (as a fake-detection check; quartz vs mechanical is a different topic)
- "lightweight = fake" (modern fakes match weight to within 5%)

ARTICLE STRUCTURE
- title: SEO title under 70 chars, contains "fake" + brand + model
- description: 80-180 chars, meta description
- intro: 200+ words, hook + stakes (cost of getting fooled, super-clone context for highly-counterfeited refs, model-year/discontinuation context where relevant)
- sections: 5-10 sections covering specific authentication checks. Each heading is a real diagnostic check. Body_markdown is detailed prose with reference-specific specifics. Skip generic "weight" or "sound" sections.
- red_flags_quick_list: 5-12 short scannable red flags. Lead with high-confidence ones (e.g. "Rolex caseback engraved → fake"); avoid weight/sound items.
- faq: 3-6 Q&A pairs targeting search-intent questions. Each entry must have keys "q" and "a" (NOT "question"/"answer").
- closing: 80+ words, final advice + soft mention of getting a second opinion (in-hand inspection by an authorised dealer or independent watchmaker).

WHEN TO HEDGE
- If a fact you'd otherwise state is reference-version-dependent or evolves with year, hedge: "On post-2023 examples, the caliber was updated; verify against the manufacturer datasheet for the production year of the watch you are inspecting."
- If a feature varies by configuration (Datejust comes with both fluted gold AND smooth steel bezels, Submariner has stainless and gold variants), say so explicitly rather than picking one.`;

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

> Want a second opinion in seconds? **${APP_NAME}** scans a photo and runs the same checks — dial, crown, rehaut, caseback, movement — flagging anything off. [Try it →](${APP_PAGE_URL})
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
