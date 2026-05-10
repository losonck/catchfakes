"""Fetch candidates from Openverse (api.openverse.org) — aggregates Flickr CC, Wikimedia,
Smithsonian, NASA, Europeana, MET Museum etc. No API key required.

Saves thumbnails to public/openverse-candidates/{slug}-{n}.jpg + metadata to
data/openverse-candidates.json. Feeds the same picker page.
"""
import json, os, re, sys, time
from io import BytesIO
import requests
from PIL import Image, ImageOps

UA = "CatchFakesBot/1.0 (https://catchfakes.com; contact@catchfakes.com)"
HEADERS = {"User-Agent": UA}
API = "https://api.openverse.org/v1/images/"
TOP_N = 5

with open("data/watches.json", encoding="utf-8") as f:
    WATCHES = json.load(f)

THUMB_DIR = "public/openverse-candidates"
META_FILE = "data/openverse-candidates.json"
os.makedirs(THUMB_DIR, exist_ok=True)

# Watches that ALREADY have great Wikimedia photos in production — skip Openverse
HAVE_WIKIMEDIA = {
    "rolex-datejust","rolex-daytona","rolex-gmt-master-ii","rolex-explorer","rolex-yachtmaster",
    "omega-speedmaster","audemars-piguet-royal-oak","patek-nautilus","cartier-santos","cartier-tank",
    "panerai-luminor","breitling-navitimer","tag-heuer-monaco","rolex-sea-dweller","rolex-sky-dweller",
    "rolex-air-king","omega-speedmaster-pre-moon","patek-calatrava","tudor-pelagos",
}

ACCEPTABLE = {"cc0", "by", "by-sa", "pdm"}

def queries_for(w):
    qs = [f'{w["brand"]} {w["model"]}']
    for ref in w["refs"][:1]:
        qs.append(f'{w["brand"]} {ref}')
    return qs

def search(q, license_filter="cc0,by,by-sa,pdm", page_size=10):
    try:
        r = requests.get(API, params={
            "q": q,
            "license": license_filter,
            "page_size": page_size,
            "mature": "false",
        }, headers=HEADERS, timeout=30)
        if r.status_code != 200: return []
        return r.json().get("results", [])
    except Exception as e:
        print(f"        search error: {e}")
        return []

def download_thumb(url, out_path):
    r = requests.get(url, headers=HEADERS, timeout=120)
    r.raise_for_status()
    img = Image.open(BytesIO(r.content)).convert("RGB")
    img = ImageOps.fit(img, (640, 336), method=Image.LANCZOS, centering=(0.5, 0.5))
    img.save(out_path, "JPEG", quality=80, optimize=True)
    return os.path.getsize(out_path)

force = "--force" in sys.argv
results = {}
if not force and os.path.exists(META_FILE):
    with open(META_FILE, encoding="utf-8") as f:
        results = json.load(f)

# Process all 40 watches; can run on missing-only by passing --missing
missing_only = "--missing" in sys.argv

for i, w in enumerate(WATCHES, 1):
    slug = w["slug"]
    if missing_only and slug in HAVE_WIKIMEDIA:
        continue
    if not force and slug in results and results[slug].get("candidates"):
        print(f"[{i:2d}/{len(WATCHES)}] CACHED  {slug}")
        continue

    print(f"[{i:2d}/{len(WATCHES)}] OPENVERSE  {slug}")
    seen_urls = set()
    candidates = []
    for q in queries_for(w):
        items = search(q)
        for x in items:
            url = x.get("url") or ""
            if not url or url in seen_urls: continue
            if (x.get("width") or 0) < 800: continue
            seen_urls.add(url)
            candidates.append(x)
        time.sleep(0.5)
        if len(candidates) >= TOP_N: break

    candidates = candidates[:TOP_N]
    if not candidates:
        print(f"        no candidates")
        results[slug] = {"candidates": []}
        continue

    enriched = []
    for n, c in enumerate(candidates, 1):
        thumb_path = os.path.join(THUMB_DIR, f"{slug}-{n}.jpg")
        # Use Openverse-proxied thumbnail (bypasses Flickr 429 rate limits)
        thumb_url = c.get("thumbnail") or c["url"]
        try:
            sz = download_thumb(thumb_url, thumb_path)
            print(f"          [{n}] {c.get('source','?'):<10} {c.get('width','?')}x{c.get('height','?')} {c.get('license','?'):<6} by {(c.get('creator','') or '')[:40]}  ({sz:,}b)")
            enriched.append({
                "title": c.get("title", ""),
                "url": c["url"],
                "thumb": f"/openverse-candidates/{slug}-{n}.jpg",
                "width": c.get("width"),
                "height": c.get("height"),
                "license": c.get("license", ""),
                "license_version": c.get("license_version", ""),
                "license_url": c.get("license_url", ""),
                "creator": c.get("creator", "Unknown"),
                "creator_url": c.get("creator_url", ""),
                "source": c.get("source", ""),
                "source_page": c.get("foreign_landing_url", ""),
                "attribution": c.get("attribution", ""),
            })
        except Exception as e:
            print(f"          [{n}] download fail: {e}")
        time.sleep(0.3)

    results[slug] = {"candidates": enriched}

with open(META_FILE, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

with_cands = sum(1 for r in results.values() if r.get("candidates"))
total = sum(len(r.get("candidates", [])) for r in results.values())
print()
print(f"=== Summary ===")
print(f"Watches with candidates: {with_cands}/{len(WATCHES)}")
print(f"Total candidate images : {total}")
print(f"Metadata: {META_FILE}")
