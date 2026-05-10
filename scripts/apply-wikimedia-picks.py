"""Apply Karl's Wikimedia picks: download chosen full-size photos, replace v1/v2 files,
write attribution metadata for display on article pages.
"""
import json, os, sys
from io import BytesIO
import requests
from PIL import Image, ImageOps

UA = "CatchFakesContentBot/1.0 (https://catchfakes.com)"
HEADERS = {"User-Agent": UA}

with open("data/wikimedia-candidates.json", encoding="utf-8") as f:
    CANDIDATES = json.load(f)

# Karl's picks (1-indexed candidate numbers; 0 means keep AI Nano Banana)
# Format: slug -> (v1_pick, v2_pick) where pick is 0 or 1..5
PICKS = {
    # 1. rolex-submariner: 0 → keep AI for both
    "rolex-datejust":             (2, 3),
    "rolex-daytona":              (1, 3),
    "rolex-gmt-master-ii":        (4, 5),
    "rolex-explorer":             (5, 1),
    "rolex-yachtmaster":          (2, 3),
    "omega-speedmaster":          (3, 1),
    # 8. omega-seamaster-300: keep AI
    "audemars-piguet-royal-oak":  (1, 4),
    "patek-nautilus":             (4, 5),
    # 11. tudor-black-bay-58: keep AI
    "cartier-santos":             (1, 3),
    "cartier-tank":               (3, 4),
    # 14. iwc-portugieser: keep AI
    "panerai-luminor":            (2, 4),
    "breitling-navitimer":        (3, 5),
    "tag-heuer-monaco":           (1, 4),
    "rolex-sea-dweller":          (4, 2),
    "rolex-sky-dweller":          (1, 2),
    "rolex-air-king":             (1, 1),
    "omega-speedmaster-pre-moon": (1, 2),
    # 22. omega-aqua-terra: keep AI
    # 23. omega-constellation: keep AI
    # 24. patek-aquanaut: keep AI
    "patek-calatrava":            (1, 5),
    # 26. ap-royal-oak-offshore: keep AI
    # 27. vacheron-222: keep AI
    "tudor-pelagos":              (1, 2),
    # 29. tudor-black-bay-pro: keep AI
    # 30. jlc-reverso: keep AI
    # 31. hublot-big-bang: keep AI
}

OUT_DIR = "public/articles"
ATTR_FILE = "data/photo-attribution.json"

def download_and_crop(url, out_path):
    r = requests.get(url, headers=HEADERS, timeout=180)
    r.raise_for_status()
    img = Image.open(BytesIO(r.content)).convert("RGB")
    img = ImageOps.fit(img, (1200, 630), method=Image.LANCZOS, centering=(0.5, 0.5))
    img.save(out_path, "JPEG", quality=88, optimize=True)
    return os.path.getsize(out_path)

# Load existing attribution if any
attribution = {}
if os.path.exists(ATTR_FILE):
    with open(ATTR_FILE, encoding="utf-8") as f:
        attribution = json.load(f)

done = failed = 0
# Cache downloads — if v1 and v2 use same candidate, only download once
download_cache = {}

for slug, (v1_pick, v2_pick) in PICKS.items():
    cands = CANDIDATES.get(slug, {}).get("candidates", [])
    if not cands:
        print(f"[SKIP] {slug}: no candidates available")
        failed += 1
        continue

    print(f"[{slug}]  v1=#{v1_pick}  v2=#{v2_pick}")
    slug_attr = {}
    for variant, pick in [("v1", v1_pick), ("v2", v2_pick)]:
        if pick == 0 or pick > len(cands):
            print(f"   {variant}: invalid pick {pick}, skipping")
            continue
        c = cands[pick - 1]
        out_path = os.path.join(OUT_DIR, f"{slug}-{variant}.jpg")

        # Cache key: URL
        if c["url"] in download_cache:
            # Already downloaded for the other variant — just copy
            with open(download_cache[c["url"]], "rb") as f: data = f.read()
            with open(out_path, "wb") as f: f.write(data)
            print(f"   {variant}: copied from cached {os.path.basename(download_cache[c['url']])}")
        else:
            try:
                sz = download_and_crop(c["url"], out_path)
                download_cache[c["url"]] = out_path
                print(f"   {variant}: downloaded {sz:,}b from {c['title'][:60]}")
            except Exception as e:
                print(f"   {variant}: FAIL {e}")
                failed += 1
                continue
        slug_attr[variant] = {
            "photographer": c["photographer"],
            "license": c["license"],
            "license_url": c["license_url"],
            "source_page": c["source_page"],
        }
        done += 1

    if slug_attr:
        attribution[slug] = slug_attr

# Save attribution
with open(ATTR_FILE, "w", encoding="utf-8") as f:
    json.dump(attribution, f, indent=2, ensure_ascii=False)

print()
print(f"Done. Files written: {done} | Failed: {failed}")
print(f"Attribution metadata: {ATTR_FILE}")
