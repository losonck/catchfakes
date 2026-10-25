# Gemini article prompt

Paste this into Gemini (any 1.5 Pro / 2.0 Pro / 2.5 class model will work).
Replace the three `{{PLACEHOLDERS}}` at the top with the specific watch, then run.
The output is a complete `.md` file — paste it verbatim into `content/<slug>.md`.

---

## PROMPT (copy from the line below down to the end)

```
You are an expert watch authenticator writing an in-depth SEO article for buyers who want to spot a counterfeit before parting with money. Your job: produce ONE complete Markdown article, ready to drop into a static Next.js site.

=== WATCH ===
Slug: {{SLUG}}            (e.g. rolex-day-date)
Brand: {{BRAND}}          (e.g. Rolex)
Model: {{MODEL}}          (e.g. Day-Date)
References: {{REFS}}      (e.g. 128238, 228238, 118238)

=== OUTPUT FORMAT (STRICT) ===
Output ONLY the Markdown below — no preface, no sign-off, no code fences around the whole file. Fill in the dynamic parts marked with <> and keep every other character exactly as shown.

---
slug: "<slug>"
brand: "<brand>"
model: "<model>"
refs: [<comma-separated quoted refs>]
title: "<SEO title, under 70 chars, contains the word 'Fake' + brand + model>"
description: "<meta description, 80–180 chars, promises what the reader learns>"
publishedAt: "<today in ISO 8601, e.g. 2026-10-25T12:00:00.000Z>"
updatedAt: "<same as publishedAt>"
readingMinutes: <integer, 4–7>
---
<Intro paragraph, 200–280 words. No heading. Hook the reader with the stakes: how much a convincing fake of this reference costs, what the counterfeit market looks like for THIS model, and promise that by the end they'll know the physical details to check.>

## <First check — e.g. "Dial Printing and Text">

<150–280 words. Be specific to this reference family. Mention real indices, text positions, lacquer vs. matte, "Swiss Made" placement, printing crispness. If you don't know an exact detail, describe the category rather than inventing a number.>

## <Second check — e.g. "The Cyclops Magnification" / "Case Flanks and Finishing">

<150–280 words.>

## <Third check>

<150–280 words.>

## <Fourth check>

<150–280 words.>

## <Fifth check>

<150–280 words.>

## <Sixth check>

<150–280 words.>

## <Seventh check>

<150–280 words.>

## <Eighth check (optional, keep total sections 7–9)>

<150–280 words.>

## Red Flags at a Glance

- <Red flag 1, one short line>
- <Red flag 2>
- <Red flag 3>
- <Red flag 4>
- <Red flag 5>
- <Red flag 6>
- <Red flag 7>
- <Red flag 8>
- <Red flag 9>
- <Red flag 10>

## FAQ

### <A real search-intent question about this reference, e.g. "What movement powers the Day-Date 128238?">

<60–120 word answer, direct, specific. One paragraph.>

### <Second question>

<Answer.>

### <Third question>

<Answer.>

### <Fourth question>

<Answer.>

### <Fifth question>

<Answer.>

=== RULES ===
1. Length: total body 1,500–2,200 words.
2. Spelling: British/Irish English (colour, centred, millimetre).
3. Tone: specialist, confident, no fluff. No "In today's world…". No "In conclusion".
4. Specificity: name real calibers (3135, 3285, Cal. 324 S C, El Primero 3600…), bezel materials (Cerachrom, aluminium), bracelet codes where known, lume types (Chromalight, SuperLumiNova X1).
5. Check headings must be concrete things an authenticator inspects — not generic ("How to spot a fake"). Good headings: "The Cyclops Magnification", "Caseback Engravings", "Bracelet End-Links and Clasp", "Movement Finishing and Caliber", "Lume Colour and Application".
6. Do not include a "Final Word" / "Conclusion" / promotional closing. The article ends after the last FAQ answer.
7. Do not wrap the output in triple backticks or any other fence. Output raw Markdown only.
8. If an exact detail would be fabricated, describe the category instead ("the rehaut is engraved with a repeating serial-adjacent marking…" rather than inventing a serial format).
```

---

## Variables to swap in

| Placeholder   | What to put                                              |
|---------------|----------------------------------------------------------|
| `{{SLUG}}`    | Kebab-case; must match the entry in `data/watches.json`  |
| `{{BRAND}}`   | Brand as it appears in `data/watches.json`               |
| `{{MODEL}}`   | Model as it appears in `data/watches.json`               |
| `{{REFS}}`    | Reference numbers, comma-separated                       |

## After generating

1. Save Gemini's full output as `content/<slug>.md` — make sure the slug matches the one in `data/watches.json`.
2. Commit the file; the site will rebuild and the article will appear automatically on the homepage and sitemap.
3. The site also auto-emits FAQPage + BreadcrumbList + Article JSON-LD based on the FAQ section — just keep the `## FAQ` + `### Question` structure intact.

## Suggested publish order (today's 5)

Covers the most-faked models not yet published:

1. `rolex-day-date` — Rolex "President", 128238 / 228238 / 118238
2. `patek-aquanaut` — 5167A / 5168G
3. `audemars-piguet-royal-oak-offshore` — 26470ST / 15710ST
4. `omega-planet-ocean` — 215.30.44.21.01.001 / 215.30.40.20.01.001
5. `tudor-pelagos` — 25600TN / 25600TB / 25407N
