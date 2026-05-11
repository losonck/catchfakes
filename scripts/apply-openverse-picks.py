"""Apply Karl's Openverse picks. Downloads full-size, falls back to Openverse thumbnail
proxy if Flickr 429s. Updates photo-attribution.json."""
import json, os, time
from io import BytesIO
import requests
from PIL import Image, ImageOps

UA = "CatchFakesBot/1.0 (https://catchfakes.com)"
HEADERS = {"User-Agent": UA}

with open("data/openverse-candidates.json", encoding="utf-8") as f:
    OV = json.load(f)

PICKS = {
    "iwc-portugieser":          (2, 3),
    "vacheron-overseas":        (2, 4),
    "rolex-submariner-vintage": (2, 1),
    "omega-constellation":      (1, 3),
    "tudor-black-bay-pro":      (1, 1),
    "hublot-big-bang":          (4, 5),
}

OUT_DIR = "public/articles"
ATTR_FILE = "data/photo-attribution.json"

attribution = {}
if os.path.exists(ATTR_FILE):
    with open(ATTR_FILE, encoding="utf-8") as f:
        attribution = json.load(f)

def fetch_with_fallback(c):
    """Try original URL, fall back to Openverse thumbnail proxy if rate-limited."""
    urls_to_try = [c["url"]]
    # For Flickr URLs, try a smaller variant
    if "live.staticflickr.com" in c["url"] and c["url"].endswith("_b.jpg"):
        urls_to_try.append(c["url"].replace("_b.jpg", "_o.jpg"))
    # Last resort: Openverse thumbnail proxy (lower res but reliable)
    if c.get("thumb"):
        thumb_proxy = c["thumb"]
        # The /openverse-candidates path is local — actual proxy URL is api.openverse.org
        # We need to derive Openverse thumb URL from the candidate id, which we don't store
        # Just use the local thumb as last resort (640px wide)
        pass

    for attempt, url in enumerate(urls_to_try, 1):
        for retry in range(3):
            try:
                r = requests.get(url, headers=HEADERS, timeout=120)
                if r.status_code == 200:
                    return r.content
                if r.status_code == 429:
                    wait = 10 + retry * 10
                    print(f"      429 on {url[-40:]}, sleep {wait}s")
                    time.sleep(wait)
                    continue
                print(f"      HTTP {r.status_code} on {url[-40:]}")
                break
            except Exception as e:
                print(f"      retry {retry}: {e}")
                time.sleep(5)
    return None

def crop_save(data, out_path):
    img = Image.open(BytesIO(data)).convert("RGB")
    img = ImageOps.fit(img, (1200, 630), method=Image.LANCZOS, centering=(0.5, 0.5))
    img.save(out_path, "JPEG", quality=88, optimize=True)
    return os.path.getsize(out_path)

done = failed = 0
download_cache = {}  # url -> file path

for slug, (v1_pick, v2_pick) in PICKS.items():
    cands = OV.get(slug, {}).get("candidates", [])
    print(f"[{slug}]  v1=#{v1_pick}  v2=#{v2_pick}")
    slug_attr = {}
    for variant, pick in [("v1", v1_pick), ("v2", v2_pick)]:
        if pick == 0 or pick > len(cands):
            print(f"   {variant}: invalid pick")
            continue
        c = cands[pick - 1]
        out_path = os.path.join(OUT_DIR, f"{slug}-{variant}.jpg")
        # Cache: same image for both variants
        if c["url"] in download_cache:
            with open(download_cache[c["url"]], "rb") as f: data = f.read()
            with open(out_path, "wb") as f: f.write(data)
            print(f"   {variant}: copied (same as cached)")
        else:
            data = fetch_with_fallback(c)
            if not data:
                # Fall back to local thumbnail (640x336 will be upscaled = lower quality)
                local_thumb = "public" + c["thumb"]
                if os.path.exists(local_thumb):
                    print(f"   {variant}: fallback to local thumb (640px - lower quality)")
                    with open(local_thumb, "rb") as f: data = f.read()
                else:
                    print(f"   {variant}: FAIL (no fallback available)")
                    failed += 1
                    continue
            sz = crop_save(data, out_path)
            download_cache[c["url"]] = out_path
            print(f"   {variant}: {sz:,}b from {c['source']}/{c['creator'][:30]}")
        slug_attr[variant] = {
            "photographer": c["creator"],
            "license": f"{c['license']} {c.get('license_version','')}".strip(),
            "license_url": c.get("license_url", ""),
            "source_page": c.get("source_page", ""),
        }
        done += 1
        time.sleep(2)
    if slug_attr:
        attribution[slug] = slug_attr

with open(ATTR_FILE, "w", encoding="utf-8") as f:
    json.dump(attribution, f, indent=2, ensure_ascii=False)

print()
print(f"Done. Files written: {done} | Failed: {failed}")
