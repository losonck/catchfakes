"""Find CC-licensed real watch photos on Wikimedia Commons.

For each watch in data/watches.json:
  1. Search Wikimedia Commons for "{brand} {model}" files
  2. Filter: license must be CC-BY / CC-BY-SA / CC0 / Public Domain
  3. Filter: image must be at least 1200px wide
  4. Pick the largest matching image
  5. Download, aspect-preserve crop to 1200×630
  6. Save to public/articles/{slug}-v1.jpg AND -v2.jpg (same image twice — Karl can manually
     swap one variant later if he finds a second real photo)
  7. Record attribution metadata to data/wikimedia-attribution.json

Watches with NO match are kept as-is (current Nano Banana versions stay).
"""
import json, os, re, time, sys
from io import BytesIO
import requests
from PIL import Image, ImageOps

UA = "CatchFakesContentBot/1.0 (https://catchfakes.com; contact@catchfakes.com)"
API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": UA}

with open("data/watches.json", encoding="utf-8") as f:
    WATCHES = json.load(f)

OUT_DIR = "public/articles"
ATTR_FILE = "data/wikimedia-attribution.json"

# Existing attribution if any
existing = {}
if os.path.exists(ATTR_FILE):
    with open(ATTR_FILE, encoding="utf-8") as f:
        existing = json.load(f)

ACCEPTABLE_LICENSES = ["cc by", "cc-by", "cc0", "public domain", "no restrictions"]

def clean_html(s):
    if not s: return "Unknown"
    t = re.sub(r"<[^>]+>", "", s).strip()
    t = re.sub(r"\s+", " ", t)
    return t or "Unknown"

def is_acceptable_license(meta):
    lic = (meta.get("LicenseShortName", {}).get("value") or "").lower()
    return any(ok in lic for ok in ACCEPTABLE_LICENSES)

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

def find_best(query):
    """Return the best CC-licensed image candidate for a query, or None."""
    files = search_files(query)
    titles = [f["title"] for f in files]
    pages = get_imageinfo(titles)
    candidates = []
    for _, page in pages.items():
        ii_list = page.get("imageinfo", [])
        if not ii_list: continue
        ii = ii_list[0]
        meta = ii.get("extmetadata", {})
        if not is_acceptable_license(meta): continue
        if ii.get("mime", "") not in ("image/jpeg", "image/png"): continue
        if ii.get("width", 0) < 1200 or ii.get("height", 0) < 630: continue
        candidates.append({
            "title": page["title"],
            "url": ii["url"],
            "width": ii["width"],
            "height": ii["height"],
            "photographer": clean_html(meta.get("Artist", {}).get("value")),
            "license": clean_html(meta.get("LicenseShortName", {}).get("value")),
            "license_url": meta.get("LicenseUrl", {}).get("value", ""),
            "source_page": f"https://commons.wikimedia.org/wiki/{page['title'].replace(' ', '_')}",
        })
    if not candidates: return None
    return max(candidates, key=lambda c: c["width"] * c["height"])

def download_and_crop(url, out_path):
    r = requests.get(url, headers=HEADERS, timeout=120, stream=True)
    r.raise_for_status()
    img = Image.open(BytesIO(r.content)).convert("RGB")
    img = ImageOps.fit(img, (1200, 630), method=Image.LANCZOS, centering=(0.5, 0.5))
    img.save(out_path, "JPEG", quality=88, optimize=True)
    return os.path.getsize(out_path)

# Search queries to try per watch (in priority order — first hit wins)
def queries_for(watch):
    qs = [f'{watch["brand"]} {watch["model"]}']
    # Add ref-specific search as fallback
    for ref in watch["refs"][:1]:  # just first ref to keep it tight
        qs.append(f'{watch["brand"]} {ref}')
    return qs

force = "--force" in sys.argv
matched = {}
unmatched = []

for i, watch in enumerate(WATCHES, 1):
    slug = watch["slug"]
    if not force and slug in existing:
        print(f"[{i:2d}/{len(WATCHES)}] CACHED  {slug}")
        matched[slug] = existing[slug]
        continue

    print(f"[{i:2d}/{len(WATCHES)}] SEARCH  {slug}  ({watch['brand']} {watch['model']})")
    best = None
    for q in queries_for(watch):
        try:
            best = find_best(q)
            if best:
                print(f"          query: '{q}' -> match")
                break
            else:
                print(f"          query: '{q}' -> no CC matches ≥1200px")
        except Exception as e:
            print(f"          query: '{q}' -> error: {e}")
        time.sleep(1)  # rate-limit polite

    if not best:
        print(f"        [FAIL] NO MATCH")
        unmatched.append(slug)
        continue

    print(f"        [OK] {best['width']}x{best['height']}  {best['license']}  by {best['photographer'][:60]}")
    try:
        v1_path = os.path.join(OUT_DIR, f"{slug}-v1.jpg")
        v2_path = os.path.join(OUT_DIR, f"{slug}-v2.jpg")
        size = download_and_crop(best["url"], v1_path)
        # Save same image to v2 path (Karl can overwrite later if a second real photo found)
        with open(v1_path, "rb") as f: data = f.read()
        with open(v2_path, "wb") as f: f.write(data)
        print(f"        wrote {v1_path} + {v2_path} ({size:,} bytes)")
        matched[slug] = best
    except Exception as e:
        print(f"        [FAIL] download failed: {e}")
        unmatched.append(slug)

    time.sleep(1)

# Save attribution
os.makedirs("data", exist_ok=True)
with open(ATTR_FILE, "w", encoding="utf-8") as f:
    json.dump(matched, f, indent=2, ensure_ascii=False)

print()
print(f"=== Summary ===")
print(f"Matched  : {len(matched)}/{len(WATCHES)}")
print(f"Unmatched: {len(unmatched)}")
if unmatched:
    print(f"  -> {', '.join(unmatched)}")
print(f"Attribution metadata written to {ATTR_FILE}")
