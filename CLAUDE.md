# Catch Fakes — SEO Engine Session Brief

> Auto-loaded by Claude Code. Dense context — keep terse.
> Updated: 2026-05-09

---

## What this project is

Next.js 16 + Tailwind static site. Generates 1,500–2,000-word "How to spot a fake [model]" authentication guides via GPT-4o. Each article ends with a soft CTA to the **Watch Authenticator** mobile app (separate repo at `C:\Users\Karl\watch-scanner`). This is the SEO/content arm of that promotion workstream.

Domain: **catchfakes.com** (bought on Porkbun 2026-05-09, DNS migrated to Cloudflare same day).
Repo: **github.com/losonck/catchfakes** (private, on personal `losonck` account — NOT taxpot-ie).
Hosting: **Cloudflare Pages** (static export, free tier).

---

## Where we are RIGHT NOW (2026-05-09)

✅ Code rebranded from "Fake Watch Guide" → "Catch Fakes" (header, title, OG, descriptions)
✅ Static export configured (`output: "export"` in next.config.mjs)
✅ Pushed to `losonck/catchfakes` main branch
✅ Cloudflare Pages project `catchfakes` created, connected to repo
✅ Domain `catchfakes.com` migrated from Porkbun to Cloudflare DNS (stale records cleaned)

🔄 **In flight: first Cloudflare Pages build.** After the most recent push, watch the Deployments tab on the Cloudflare Pages project — should auto-trigger within ~30s.

⚠️ **Production branch may still be set to `master` on Cloudflare** (project was created when local was on master; we then renamed local → main and force-pushed). If no build kicks off after 60s, fix at: Cloudflare Pages project → Settings → Builds & deployments → Production branch → change to `main` → trigger empty commit:
```powershell
git commit --allow-empty -m "trigger build" && git push
```

---

## Cloudflare Pages config (verify these are set)

- **Framework preset**: None (NOT "Next.js" — we're static-exporting, don't want the Workers adapter)
- **Build command**: `pnpm build`
- **Build output directory**: `out`
- **Root directory**: blank
- **Production branch**: `main`
- **Environment variables (production)**:
  - `OPENAI_API_KEY` — copied from watch-scanner/.env (only used for `pnpm batch` regeneration in CI)
  - `SITE_URL=https://catchfakes.com`
  - `APP_URL=https://watchauthenticator.app` (placeholder until Play Store URL finalised)
  - `NODE_VERSION=20`

---

## Immediate next steps (in order)

1. **Verify Cloudflare build went green.** Visit `https://<deployment>.pages.dev` and confirm:
   - Header reads "Catch Fakes" with gold accent on "Fakes"
   - 20 articles listed on home
   - Click 2–3 articles, confirm rendering and end-of-article CTA
   - View source: `<title>` = "Catch Fakes — authenticate watches by reference", canonical URL correct
2. **Attach custom domain.** Cloudflare Pages project → Custom domains → add `catchfakes.com` and `www.catchfakes.com`. Cloudflare auto-creates DNS records (since domain is on Cloudflare DNS now). Pick `catchfakes.com` apex as canonical, redirect www → apex.
3. **Wait for SSL provisioning** (~5 min after custom domain is added).
4. **Test live**: `https://catchfakes.com` should serve the home page over HTTPS.
5. **Submit to Google Search Console**: search.google.com/search-console → Add property → Domain → `catchfakes.com` → verify via DNS TXT (Cloudflare DNS makes this trivial). Then Sitemaps → submit `sitemap.xml`.
6. **Enable Cloudflare Web Analytics**: dash.cloudflare.com → catchfakes.com site → Analytics → Web Analytics. Free, privacy-friendly, no JS snippet needed.

---

## After launch — backlog

- **Generate next 20 articles.** Easy `pnpm batch` from local. Suggested batch (highest search volume):
  - Vintage Submariner refs: 1680, 5512, 5513, 5517 (MilSub)
  - Speedmaster pre-Moon: CK2998, 105.012, 145.012
  - Heuer/TAG Heuer Carrera (1960s)
  - Vacheron 222 (vintage)
  - AP Royal Oak Offshore
  - Rolex Sea-Dweller (16660 + 116600)
  - Omega Seamaster Aqua Terra
  - Patek Aquanaut
  - JLC Reverso, Master Control
  - Cartier Pasha
  - More (refresh `data/watches.json` with full list)
- **Article QA pass** — skim all 20 existing articles for hallucinated specs, awkward phrasing, weak CTAs.
- **OG images** — currently no per-article OG image. Generate via Next route handler or static SVG-to-PNG pipeline. Lifts CTR from social shares.
- **Internal linking** — articles don't currently link to each other. Add "related guides" section (same brand or same era).
- **Newsletter capture** — soft opt-in for "new authentication guides published". Not yet wired.
- **Schema.org refinements** — JSON-LD currently `Article`; consider `HowTo` or `FAQPage` for relevant articles to win rich snippets.
- **Plausible vs Vercel-style analytics** — Cloudflare Web Analytics is fine, but Plausible ($9/mo) gives cleaner UTM tracking when we start press outreach.

---

## File layout

```
content/                    — 20 generated .md articles (Rolex Sub, Datejust, Daytona,
                              GMT-II, Explorer, Yacht-Master, Speedmaster, Seamaster,
                              AP Royal Oak, Patek Nautilus, Tudor BB58, Cartier
                              Santos/Tank, IWC Portugieser, Panerai Luminor, Breitling
                              Navitimer, TAG Monaco, GS Snowflake, VC Overseas, RM 011)
data/watches.json           — priority-ranked watch list for batch generation
scripts/
  generate-article.ts       — pnpm generate <slug>
  batch-generate.ts         — pnpm batch [--force] [--priority N]
src/
  app/
    layout.tsx              — root layout, "Catch Fakes" branding, metadata
    page.tsx                — home: hero + article list + "coming soon" tags (force-static)
    fake-watch-guide/[slug]/page.tsx  — article page; dynamicParams=false + generateStaticParams
    sitemap.ts robots.ts    — SEO basics, both read SITE_URL env
    globals.css             — Tailwind + .prose-watch typography
  components/
    ArticleSchema.tsx       — JSON-LD Article schema
  lib/
    content.ts              — frontmatter parser (regex, no gray-matter) + marked HTML
    watch-list.ts           — getWatches() reads data/watches.json (DEFERRED fs read, NOT module-level)
    openai.ts               — OpenAI client + GPT_MODEL
.env.example                — template
.env                        — populated, contains OPENAI_API_KEY (gitignored)
next.config.mjs             — output:"export", images.unoptimized, trailingSlash:false
package.json next.config.mjs tailwind.config.ts tsconfig.json postcss.config.mjs
```

---

## Locked decisions — do not re-propose alternatives

| Decision | What was decided |
|---|---|
| Brand name | "Catch Fakes" — gold accent on "Fakes", matches original styling pattern |
| Domain | catchfakes.com (Porkbun → migrated to Cloudflare DNS) |
| Hosting | Cloudflare Pages, free tier, static export (NOT Vercel — Teams require Pro now) |
| Output mode | `output: "export"` static HTML, not Workers/SSR adapter — site has no runtime needs |
| URL paths | Keep `/fake-watch-guide/[slug]` for now — keyword-rich for SEO; refactor later if expanding beyond watches |
| GitHub account | losonck (personal) — taxpot-ie is a separate business identity, NEVER mix |
| No `gray-matter` | Replaced with regex frontmatter parser in lib/content.ts; Windows webpack chunking issue |
| No `<Image>` | Components use plain `<img>` if needed; avoids Image Optimization complexity in static export |

---

## Gotchas the next session should know

1. **Next 15 → Next 16 upgrade was required.** Next 15.0.3 hit a webpack bug ("Unexpected end of JSON input") when `lib/content.ts` was imported. Don't downgrade.
2. **No `gray-matter`.** Custom regex parser in `lib/content.ts`. Don't reintroduce.
3. **`watch-list.ts` defers `fs.readFileSync` to function call time, NOT module top.** Module-level fs reads broke webpack chunking on Windows. Keep deferred.
4. **`marked` v15** is fine; do NOT switch to `remark` (also broke webpack).
5. **GPT FAQ schema** in `scripts/generate-article.ts` accepts both `q/a` and `question/answer` keys via Zod transform — GPT sometimes emits the long form despite the prompt.
6. **Production branch on Cloudflare may be `master`, local is `main`** — if auto-builds aren't firing, check this first.

---

## Tech stack

- Next.js 16 (canary/RC React 19 deps in lockfile, expected)
- Tailwind 3.4
- pnpm package manager (lockfile is `pnpm-lock.yaml`)
- TypeScript strict
- OpenAI SDK (4.104, GPT-4o for article generation only — runtime is pure static)
- `marked` v15 for markdown → HTML

---

## How to work with Karl

- Be direct. No fluff, no padding. Push back when something is wrong.
- Diagnose before fixing. Logs first, root cause confirmed, then code.
- End every coding session with a "To test:" block stating exactly what Karl runs.
- Never hallucinate. If unsure, say so. State confidence honestly.
- Velocity over polish. Ship working > perfect.
- Account boundary: losonck (personal/Watch Authenticator/Catch Fakes) vs taxpot-ie (separate business). Never mix.

---

## Cross-links

```
C:\Users\Karl\watch-scanner\CLAUDE.md          — Watch Authenticator mobile app session brief (Flutter + FastAPI)
C:\Users\Karl\watch-scanner\PROMOTION-HANDOFF.md — full promotion workstream handoff (incl. parked Reddit bot)
github.com/losonck/watch-authenticator-privacy — privacy policy repo (referenced by app)
```
