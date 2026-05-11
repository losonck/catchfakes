# Catch Fakes — SEO Engine Session Brief

> Auto-loaded by Claude Code. Dense context — keep terse.
> Updated: 2026-05-11

---

## What this project is

Next.js 16 + Tailwind static site. 40 long-form "How to spot a fake [model]" authentication guides. Each article funnels readers to the **Watch Authenticator** mobile app (separate repo at `C:\Users\Karl\watch-scanner`).

| | |
|---|---|
| Domain | **catchfakes.com** (Porkbun → Cloudflare DNS) |
| Repo | github.com/losonck/catchfakes (private, `losonck` account — NOT taxpot-ie) |
| Hosting | Cloudflare Pages (static export, free tier) |
| Production branch | `main` (already promoted via dashboard) |
| Search Console | submitted (Karl confirmed 2026-05-10) |

---

## Current state (2026-05-10)

### Live and working
- ✅ Brand Launch design ported to Next.js — dark theme, Instrument Serif + Inter + JetBrains Mono, brass accent, ambient gradients
- ✅ 40 articles, all QA'd. Critical errors regenerated with stricter prompt (Daytona 4131, BB58 shield-not-rose, Yacht-Master Oysterlock, Pelagos MT5400, Sky-Dweller 9002, etc.)
- ✅ **Hero images: hybrid real + AI** (refined 2026-05-10/11):
  - 19 watches → **Wikimedia Commons** real photos (high-res, sharp, picked from candidates)
  - 6 watches → **Openverse (Flickr CC)** real photos (softer — Flickr CDN 429'd full-size; fallback to 640px thumb upscaled to 1200×630)
  - 15 watches → still on **Nano Banana AI** (no clean CC source exists for these refs, even after Wikimedia + Openverse + Flickr probe)
  - Per-article photo attribution displayed under hero ("Photo: X · CC BY-SA 4.0 · source") read from `data/photo-attribution.json`
- ✅ **Dual-image system**: v1 on home/cards + hero device mockup, v2 on article hero + per-article OG (each watch surface shows two distinct visuals across the user journey)
- ✅ **Cache-busting via `IMG_VERSION` constant** in lib/content.ts — bump to force phone browsers to refetch (currently `wm2`)
- ✅ App link wired correctly:
  - `/app` landing page with hero device + 6-feature grid + Play Store CTA
  - Header pill, footer, article CTA cards all → `/app`
  - **AppStoreButton** client component does device detection: Android→Play Store, iOS→"coming soon"+/app, Desktop→/app
  - Play Store URL: `https://play.google.com/store/apps/details?id=com.watchauthenticator.app`
- ✅ Full SEO: per-page OG + Twitter Cards + canonical + 11 JSON-LD schema types (Article, Product, Brand, BreadcrumbList, FAQPage, etc.)
- ✅ AI search: `/llms.txt` for ChatGPT/Perplexity/Claude crawlers
- ✅ RSS feed at `/rss.xml`
- ✅ About/Method page at `/about`
- ✅ Sitemap: 43 URLs (home + about + app + 40 articles)
- ✅ All 24 in-site links 200 OK (verified end-to-end)

### Internal-only pages (noindex, robots blocked)
- `/image-styles` — original 5-direction mood test (Cinematic Cool, Bright Studio, etc.) — Karl approved 4 of 5
- `/test-images` — early Nano Banana 8-image quality validation — approved
- `/image-pick` — full 80-image v1/v2 picker (obsolete after dual-image system shipped)
- `/wikimedia-pick` — Round 1 picker for Wikimedia Commons real photos (Karl picked from here 2026-05-10)
- `/openverse-pick` — Round 2 picker for Openverse / Flickr CC photos (Karl picked from here 2026-05-11)

These can be deleted at any time — only useful if revisiting image decisions.

### Pending Karl decisions / TODOs
- ⚠️ **Rotate Gemini API key** — Karl pasted `AIzaSyB7dBKcv0u7pFBOnmmadub4-85N7dhYB-o` in chat, billing-enabled. Anyone with chat history can spend on it. Rotate at https://aistudio.google.com/apikey
- 🔜 **Press pitches** — Hodinkee, Worn & Wound, A Blog to Watch. Not yet started.
- 🔜 **Reddit bot revival** — code complete in `C:\Users\Karl\watch-reddit-bot`, parked pending Webshare residential proxy decision (free tier, 1GB/mo).
- 🔜 **iOS app** — when shipped, set `NEXT_PUBLIC_APP_STORE_URL_IOS` in Cloudflare env vars + redeploy. AppStoreButton auto-routes the moment it's set. No code change needed.
- 🔜 **Smart App Banner** (`<meta name="apple-itunes-app" content="app-id=XXXX">`) — adds native iOS install banner. Trivial to add once iOS App Store ID exists.

---

## File layout

```
content/                    — 40 .md articles
data/
  watches.json              — 40 watches with brand/model/refs/priority
  prompt-sheet.json + .csv  — 80 Nano Banana prompts (40 watches × 2 variants)
  wikimedia-candidates.json — top-5 Wikimedia Commons candidates per watch (105 total)
  openverse-candidates.json — top-5 Openverse candidates per watch (31 total)
  wikimedia-attribution.json — Round 1 picked attribution metadata
  photo-attribution.json    — UNIFIED photo attribution per slug (v1+v2) — read at runtime by article page
public/
  articles/                 — 80 hero images: {slug}-v1.jpg + {slug}-v2.jpg (mix of Wikimedia, Openverse, AI)
  articles-test/            — 8 test images (early Nano Banana validation)
  image-styles/             — 5 style-direction tests (1-cinematic-cool.jpg etc)
  wikimedia-candidates/     — 105 thumbnails for round 1 picker
  openverse-candidates/     — 31 thumbnails for round 2 picker
  llms.txt                  — AI crawler summary
  og.jpg                    — site-wide fallback OG image
scripts/
  generate-article.ts       — pnpm generate <slug>  (article markdown via OpenAI)
  batch-generate.ts         — pnpm batch [--force] [--priority N]
  build-prompt-sheet.py     — produces prompt-sheet.json/.csv from STYLE_MAP
  generate-images.py        — gpt-image-1 fallback (kept for reference, NOT current)
  generate-style-tests.py   — produced /image-styles content
  nano-banana-test.py       — produced /articles-test content
  nano-banana-batch.py      — Nano Banana production: full 80-image batch via Gemini API
  wikimedia-scout.py        — initial best-match Wikimedia search (single best per watch)
  wikimedia-candidates.py   — top-5 Wikimedia candidates per watch + thumbnails
  apply-wikimedia-picks.py  — download chosen full-size Wikimedia photos
  openverse-candidates.py   — top-5 Openverse (Flickr CC + Wikimedia) candidates per watch
  apply-openverse-picks.py  — download chosen Openverse photos with 429 retry + thumb fallback
src/
  app/
    layout.tsx              — root layout, header pill uses AppStoreButton
    page.tsx                — home: uses articleCardImagePath() = -v1
    fake-watch-guide/[slug]/page.tsx — uses articleImagePath() = -v2
    app/page.tsx            — /app landing
    about/page.tsx          — /about method page
    test-images/, image-styles/, image-pick/ — internal noindex preview pages
    rss.xml/route.ts        — RSS feed
    sitemap.ts robots.ts
  components/
    AppStoreButton.tsx      — client component, device-aware routing
    ArticleSchema.tsx       — JSON-LD Article + Breadcrumb + FAQ
  lib/
    content.ts              — frontmatter parser + articleImagePath() (v2) + articleCardImagePath() (v1)
    watch-list.ts           — getWatches() (deferred fs read)
    seo.ts                  — JSON-LD helpers, env var exports
    openai.ts               — OpenAI client (article generation only)
.env                        — OPENAI_API_KEY + GEMINI_API_KEY + APP_PAGE_URL + NEXT_PUBLIC_APP_STORE_URL_*
```

---

## Locked decisions — do not re-propose alternatives

| Decision | What was decided |
|---|---|
| Brand name | "Catch Fakes" — gold accent on "Fakes" |
| Domain | catchfakes.com (Porkbun → migrated to Cloudflare DNS) |
| Hosting | Cloudflare Pages, free tier, static export (NOT Vercel) |
| Output mode | `output: "export"` static HTML |
| URL paths | `/fake-watch-guide/[slug]` for SEO keyword density |
| GitHub account | losonck (personal) — NEVER mix with taxpot-ie business identity |
| Image generation | **Nano Banana / Gemini 2.5 Flash Image** for AI fallback. `aspect-preserving center-crop` to 1200×630 (use `ImageOps.fit`, NOT `Image.resize`). |
| Real photo sources | **Wikimedia Commons** (free API, no auth, best for high-res) + **Openverse API** (api.openverse.org, no auth, aggregates Flickr CC + Wikimedia + Smithsonian + NASA + MET). NOT Flickr direct (Pro account required + 429s). NOT Bing/DDG (anti-bot blocks). |
| Image system | Dual: v1 on home cards + device mockup, v2 on article hero + per-article OG. Cache-bust via `IMG_VERSION` constant in lib/content.ts. |
| Photo attribution | Required for CC-BY/CC-BY-SA. Stored in `data/photo-attribution.json` per slug per variant. Rendered by article page as figcaption: "Photo: X · License · source" |
| Article generator | GPT-4o (OpenAI) with stricter facts-discipline prompt (no clichés, no invented bracelet codes, super-clone context required) |
| App routing | All in-site CTAs → `/app` (internal landing). `/app` → external Play Store via `AppStoreButton` (device-aware) |
| No `gray-matter` | Custom regex frontmatter parser in lib/content.ts. Don't reintroduce. |
| No `<Image>` | Use plain `<img>` (we're static-exporting; Next/Image needs runtime) |

---

## Gotchas the next session should know

1. **Next 15 → Next 16 upgrade was required.** Next 15.0.3 hit a webpack bug ("Unexpected end of JSON input") when `lib/content.ts` was imported. Don't downgrade.
2. **`watch-list.ts` defers `fs.readFileSync` to function call time, NOT module top.** Module-level fs reads broke webpack chunking on Windows. Keep deferred.
3. **`marked` v15** is fine; do NOT switch to `remark` (also broke webpack).
4. **`ImageOps.fit()` not `Image.resize()`** for image post-processing — resize stretches to exact dimensions, fit crops while preserving aspect ratio. Squashed-image bug origin.
5. **Gemini API requires billing enabled** for `gemini-2.5-flash-image`. Free tier returns `limit: 0`.
6. **Cloudflare cache is aggressive on JPGs.** Use `?v=N` query strings or hard-refresh on phone when previewing image changes.
7. **Production branch on Cloudflare may default to `master`** if repo was created on master then renamed to main. Already fixed for this project, but worth noting if cloning the setup.
8. **Image generation can sometimes return text-only response (no image).** Script handles this with retry-on-empty. ~3/80 needed retry on initial run.
9. **Flickr direct downloads from data-center IPs return 429.** Use Openverse's thumbnail proxy URL (`item['thumbnail']`) — they cache through their own CDN.
10. **Wikimedia search misses files indexed only in categories.** Use `list=categorymembers` to traverse Brand/Model categories for more coverage. (Marginal help for niche refs.)
11. **Bing image search HTML is JS-only and detects Playwright.** Don't waste time scraping it. Same for DuckDuckGo `/i.js` (403 anti-bot).

---

## Tech stack

- Next.js 16, Tailwind 3.4, React 19 (RC), TypeScript strict
- pnpm package manager
- OpenAI SDK (4.104) — GPT-4o for article markdown
- google-genai SDK — Gemini 2.5 Flash Image for hero images
- `marked` v15 for markdown → HTML
- Pillow (Python) for image post-processing

---

## Cost summary to date

| Item | Cost |
|---|---|
| Articles (40 × ~$0.02) | ~$0.80 |
| Articles regenerated (9 × $0.02) | ~$0.20 |
| Hero images via gpt-image-1 (deprecated) | ~$2.00 |
| Style tests (5 + 8 + 80) via Nano Banana | ~$3.56 |
| Wikimedia + Openverse (free, no API key) | $0.00 |
| Domain (catchfakes.com Porkbun annual) | ~$15 |
| Cloudflare Pages | $0 (free tier) |
| **Total** | **~$22** |

---

## How to work with Karl

- Direct, terse, no fluff. Push back when something is wrong.
- Diagnose before fixing. Logs first, root cause confirmed.
- End every coding session with a "To test:" block stating exactly what Karl runs.
- Never hallucinate — for facts, verify; for personal opinion, state confidence.
- Velocity over polish. Ship working > perfect.
- Account boundary: losonck (personal/Watch Authenticator/Catch Fakes) vs taxpot-ie (separate business). Never mix.

---

## Cross-links

```
C:\Users\Karl\watch-scanner\CLAUDE.md          — Watch Authenticator mobile app session brief
C:\Users\Karl\watch-scanner\PROMOTION-HANDOFF.md — full promotion workstream handoff
C:\Users\Karl\watch-reddit-bot\bot.py          — parked Reddit monitor (RSS-based, needs proxy)
github.com/losonck/watch-authenticator-privacy — privacy policy repo
```
