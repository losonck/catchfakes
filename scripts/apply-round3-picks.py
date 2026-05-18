"""Apply Karl's Round 3 (Pexels) picks.

Downloads the chosen Pexels full-size image, crops to 1200x630 via ImageOps.fit,
overwrites public/articles/{slug}-v1.jpg + -v2.jpg, and updates
data/photo-attribution.json with Pexels License metadata.

Same v1 + v2 pick id → image is downloaded once and copied (saves bandwidth).
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
from io import BytesIO
from typing import Iterable

from PIL import Image, ImageOps

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)

# Karl's picks from the /round3-pick page. (v1, v2) tuples — 1-indexed into
# data/round3-candidates.json candidates[]. 0 means "keep current AI".
PICKS: dict[str, tuple[int, int]] = {
    "rolex-submariner":      (4, 5),
    "omega-seamaster-300":   (1, 2),
    "tudor-black-bay-58":    (1, 3),
    "grand-seiko-snowflake": (1, 4),
    "omega-aqua-terra":      (2, 1),
    "ap-royal-oak-offshore": (1, 1),
    "ap-code-1159":          (2, 2),
}

CANDS_FILE = "data/round3-candidates.json"
ATTR_FILE = "data/photo-attribution.json"
OUT_DIR = "public/articles"


def curl_download(url: str, timeout: int = 60) -> bytes | None:
    """Pexels images.pexels.com CDN behaves with curl; mirrors the search bypass."""
    proc = subprocess.run(
        [
            "curl", "-sL",
            "-A", UA,
            "-H", "Accept: image/avif,image/webp,image/jpeg,image/*;q=0.8,*/*;q=0.5",
            "--max-time", str(timeout),
            url,
        ],
        capture_output=True, timeout=timeout + 5,
    )
    if proc.returncode != 0 or not proc.stdout:
        return None
    return proc.stdout


def crop_save(data: bytes, out_path: str) -> int:
    img = Image.open(BytesIO(data)).convert("RGB")
    img = ImageOps.fit(img, (1200, 630), method=Image.LANCZOS, centering=(0.5, 0.5))
    img.save(out_path, "JPEG", quality=88, optimize=True)
    return os.path.getsize(out_path)


def main() -> int:
    with open(CANDS_FILE, encoding="utf-8") as f:
        candidates_by_slug = json.load(f)

    attribution: dict[str, dict] = {}
    if os.path.exists(ATTR_FILE):
        with open(ATTR_FILE, encoding="utf-8") as f:
            attribution = json.load(f)

    os.makedirs(OUT_DIR, exist_ok=True)
    done = failed = 0
    download_cache: dict[str, bytes] = {}

    for slug, (v1_pick, v2_pick) in PICKS.items():
        cands = candidates_by_slug.get(slug, {}).get("candidates", [])
        print(f"[{slug}]  v1=#{v1_pick}  v2=#{v2_pick}")
        slug_attr: dict[str, dict] = {}

        for variant, pick in [("v1", v1_pick), ("v2", v2_pick)]:
            if pick == 0:
                print(f"   {variant}: KEEP AI")
                continue
            if pick > len(cands):
                print(f"   {variant}: INVALID pick #{pick} (only {len(cands)} candidates)")
                failed += 1
                continue

            c = cands[pick - 1]
            out_path = os.path.join(OUT_DIR, f"{slug}-{variant}.jpg")
            url = c["full_url"]

            if url in download_cache:
                data = download_cache[url]
                print(f"   {variant}: cached (same pick)")
            else:
                print(f"   {variant}: downloading id={c['photo_id']}…")
                data = curl_download(url)
                if not data:
                    # Fall back to thumb URL if full fails (still ~800w)
                    print(f"   {variant}: full failed, trying thumb URL")
                    data = curl_download(c["thumb_url"])
                if not data:
                    print(f"   {variant}: FAIL — both URLs returned nothing")
                    failed += 1
                    continue
                download_cache[url] = data
                time.sleep(1.5)

            try:
                sz = crop_save(data, out_path)
                print(f"   {variant}: {sz:,}b -> {out_path}")
            except Exception as e:
                print(f"   {variant}: crop/save fail: {e}")
                failed += 1
                continue

            slug_attr[variant] = {
                "photographer": c["photographer"],
                "license": "Pexels License",
                "license_url": "https://www.pexels.com/license/",
                "source_page": c["page_url"],
            }
            done += 1

        if slug_attr:
            # Preserve any other variants that might already be set (won't happen here, but safe)
            existing = attribution.get(slug, {})
            existing.update(slug_attr)
            attribution[slug] = existing

    with open(ATTR_FILE, "w", encoding="utf-8") as f:
        json.dump(attribution, f, indent=2, ensure_ascii=False)

    print()
    print(f"Done. Files written: {done} | Failed: {failed}")
    print(f"Attribution updated for {len(PICKS)} watches in {ATTR_FILE}")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
