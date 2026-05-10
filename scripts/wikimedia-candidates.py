"""Fetch up to 5 Wikimedia Commons candidate photos per watch.

For each watch in data/watches.json, search Commons, filter by CC license + min 1200px,
download a 640px-wide preview to public/wikimedia-candidates/{slug}-{n}.jpg, and write
data/wikimedia-candidates.json with full metadata (full-size URL, attribution, license).

Outputs feed the /wikimedia-pick page for Karl to choose from per watch.
"""
import json, os, re, time, sys
from io import BytesIO
import requests
from PIL import Image, ImageOps

UA = "CatchFakesContentBot/1.0 (https://catchfakes.com; contact@catchfakes.com)"
API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": UA}
TOP_N = 5

with open("data/watches.json", encoding="utf-8") as f:
    WATCHES = json.load(f)

THUMB_DIR = "public/wikimedia-candidates"
META_FILE = "data/wikimedia-candidates.json"
os.makedirs(THUMB_DIR, exist_ok=True)

ACCEPTABLE = ["cc by", "cc-by", "cc0", "public domain", "no restrictions"]

def clean_html(s):
    if not s: return "Unknown"
    t = re.sub(r"<[^>]+>", "", s).strip()
    t = re.sub(r"\s+", " ", t)
    return t or "Unknown"

def is_acceptable(meta):
    lic = (meta.get("LicenseShortName", {}).get("value") or "").lower()
    return any(ok in lic for ok in ACCEPTABLE)

def search_files(query, limit=30):
    r = requests.get(API, params={
        "action": "query", "format": "json",
        "list": "search", "srnamespace": 6,
        "srsearch": f"{query} filetype:bitmap",
        "srlimit": limit,
    }, headers=HEADERS, timeout=30)
    return r.json().get("query", {}).get("search", [])

def get_imageinfo(titles):
    if not titles: return {}
    r = requests.get(API, params={
        "action": "query", "format": "json",
        "prop": "imageinfo",
        "iiprop": "url|size|mime|extmetadata",
        "titles": "|".join(titles[:50]),
    }, headers=HEADERS, timeout=30)
    return r.json().get("query", {}).get("pages", {})

def find_candidates(query, limit=TOP_N):
    files = search_files(query)
    titles = [f["title"] for f in files]
    pages = get_imageinfo(titles)
    cands = []
    for _, page in pages.items():
        ii_list = page.get("imageinfo", [])
        if not ii_list: continue
        ii = ii_list[0]
        meta = ii.get("extmetadata", {})
        if not is_acceptable(meta): continue
        if ii.get("mime", "") not in ("image/jpeg", "image/png"): continue
        if ii.get("width", 0) < 1200 or ii.get("height", 0) < 630: continue
        cands.append({
            "title": page["title"],
            "url": ii["url"],
            "width": ii["width"],
            "height": ii["height"],
            "photographer": clean_html(meta.get("Artist", {}).get("value")),
            "license": clean_html(meta.get("LicenseShortName", {}).get("value")),
            "license_url": meta.get("LicenseUrl", {}).get("value", ""),
            "source_page": f"https://commons.wikimedia.org/wiki/{page['title'].replace(' ', '_')}",
        })
    cands.sort(key=lambda c: -(c["width"] * c["height"]))
    return cands[:limit]

def download_thumb(url, out_path):
    """Download image, resize-fit to 640x336 thumbnail."""
    r = requests.get(url, headers=HEADERS, timeout=120)
    r.raise_for_status()
    img = Image.open(BytesIO(r.content)).convert("RGB")
    img = ImageOps.fit(img, (640, 336), method=Image.LANCZOS, centering=(0.5, 0.5))
    img.save(out_path, "JPEG", quality=80, optimize=True)
    return os.path.getsize(out_path)

def queries_for(w):
    qs = [f'{w["brand"]} {w["model"]}']
    for ref in w["refs"][:1]:
        qs.append(f'{w["brand"]} {ref}')
    return qs

force = "--force" in sys.argv
results = {}

# Load existing if present
if not force and os.path.exists(META_FILE):
    with open(META_FILE, encoding="utf-8") as f:
        results = json.load(f)

for i, w in enumerate(WATCHES, 1):
    slug = w["slug"]
    if not force and slug in results and results[slug].get("candidates"):
        print(f"[{i:2d}/{len(WATCHES)}] CACHED  {slug}  ({len(results[slug]['candidates'])} cands)")
        continue

    print(f"[{i:2d}/{len(WATCHES)}] SEARCH  {slug}  ({w['brand']} {w['model']})")
    all_cands = []
    seen_titles = set()
    for q in queries_for(w):
        try:
            cs = find_candidates(q)
            for c in cs:
                if c["title"] not in seen_titles:
                    all_cands.append(c)
                    seen_titles.add(c["title"])
            time.sleep(1)
        except Exception as e:
            print(f"          query '{q}' error: {e}")

    all_cands = all_cands[:TOP_N]
    if not all_cands:
        print(f"        no candidates")
        results[slug] = {"candidates": []}
        continue

    print(f"        {len(all_cands)} candidates found")
    enriched = []
    for n, c in enumerate(all_cands, 1):
        thumb_path = os.path.join(THUMB_DIR, f"{slug}-{n}.jpg")
        try:
            sz = download_thumb(c["url"], thumb_path)
            print(f"          [{n}] {c['width']}x{c['height']} {c['license']} thumb={sz:,}b  {c['photographer'][:50]}")
            c["thumb"] = f"/wikimedia-candidates/{slug}-{n}.jpg"
            enriched.append(c)
        except Exception as e:
            print(f"          [{n}] download fail: {e}")
        time.sleep(0.5)
    results[slug] = {"candidates": enriched}

# Save metadata
with open(META_FILE, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

total_cands = sum(len(r.get("candidates", [])) for r in results.values())
zero = [s for s, r in results.items() if not r.get("candidates")]
print()
print(f"=== Summary ===")
print(f"Total candidates downloaded: {total_cands}")
print(f"Watches with zero candidates: {len(zero)}")
if zero:
    print(f"  -> {', '.join(zero)}")
print(f"Metadata: {META_FILE}")
