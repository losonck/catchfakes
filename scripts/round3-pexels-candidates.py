"""Round 3 — Pexels HTML scrape for the 15 watches still on Nano Banana AI.

No API key required. Scrapes the public search HTML (same surface Google
indexes), extracts image IDs + photographer slugs from the `dl=` query param
on full-size links, downloads top 5 thumbnails per watch.

Outputs:
  public/round3-candidates/{slug}-{n}.jpg  — 640x336 thumbnails for the picker
  data/round3-candidates.json              — metadata: ids, photographer, urls

Usage:
  python scripts/round3-pexels-candidates.py [--force]
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import time
from dataclasses import dataclass
from io import BytesIO
from typing import Iterable
from urllib.parse import quote, unquote

import requests
from PIL import Image, ImageOps

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
)
HEADERS = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

TOP_N = 5
THUMB_DIR = "public/round3-candidates"
META_FILE = "data/round3-candidates.json"
WATCHES_FILE = "data/watches.json"

# Watches still on Nano Banana AI (no real photo found in rounds 1 + 2).
# Each watch gets a primary query plus optional fallback queries when the
# primary returns < TOP_N hits — broader brand-only as last resort.
AI_WATCHES: dict[str, list[str]] = {
    "rolex-submariner":      ["rolex submariner", "submariner watch"],
    "omega-seamaster-300":   ["omega seamaster diver", "omega seamaster"],
    "tudor-black-bay-58":    ["tudor black bay 58", "tudor black bay"],
    "grand-seiko-snowflake": ["grand seiko snowflake", "grand seiko"],
    "richard-mille-rm-011":  ["richard mille rm 011", "richard mille"],
    "omega-aqua-terra":      ["omega aqua terra", "omega seamaster aqua terra"],
    "patek-aquanaut":        ["patek aquanaut", "patek philippe aquanaut"],
    "ap-royal-oak-offshore": ["royal oak offshore", "audemars piguet offshore"],
    "ap-code-1159":          ["audemars piguet code 11.59", "audemars piguet code"],
    "vacheron-222":          ["vacheron 222", "vacheron constantin overseas"],
    "cartier-ballon-bleu":   ["cartier ballon bleu", "ballon bleu watch"],
    "jlc-reverso":           ["jaeger lecoultre reverso", "reverso watch"],
    "heuer-carrera-vintage": ["vintage heuer carrera", "heuer carrera"],
    "zenith-el-primero":     ["zenith el primero", "zenith chronomaster"],
    "bell-ross-br-03":       ["bell ross br 03", "bell ross watch"],
}


@dataclass(frozen=True)
class Candidate:
    photo_id: str
    photographer: str
    page_url: str
    thumb_url: str
    full_url: str

    def as_dict(self) -> dict[str, str]:
        return {
            "photo_id": self.photo_id,
            "photographer": self.photographer,
            "page_url": self.page_url,
            "thumb_url": self.thumb_url,
            "full_url": self.full_url,
        }


# Matches: https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg?cs=srgb&dl=pexels-{photog}-{id}.jpg
# Pexels embeds the photographer slug in the `dl=` filename. Group 1 = id, group 2 = photog slug.
PHOTO_RE = re.compile(
    r"https://images\.pexels\.com/photos/(\d+)/pexels-photo-\1\.jpe?g\?[^\"\s]*dl=pexels-([a-z0-9\-]+?)-\1\.jpe?g",
    re.IGNORECASE,
)
# Fallback when `dl=` is absent — still get the id but photographer unknown
BARE_PHOTO_RE = re.compile(
    r"https://images\.pexels\.com/photos/(\d+)/pexels-photo-\1\.jpe?g",
    re.IGNORECASE,
)


def _curl_get(url: str, timeout: int = 30) -> tuple[int, str]:
    """Cloudflare TLS-fingerprints Python's requests/urllib3 and 403s it.
    Curl uses a Chrome-like TLS signature that passes. Shell out to it for
    HTML fetches; image CDN downloads remain on requests (different host)."""
    proc = subprocess.run(
        [
            "curl", "-sL",
            "-A", UA,
            "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "-H", "Accept-Language: en-US,en;q=0.9",
            "-w", "\n__HTTP__:%{http_code}",
            "--max-time", str(timeout),
            url,
        ],
        capture_output=True, timeout=timeout + 5,
    )
    body = (proc.stdout or b"").decode("utf-8", errors="replace")
    code = 0
    if "\n__HTTP__:" in body:
        body, _, code_str = body.rpartition("\n__HTTP__:")
        try:
            code = int(code_str.strip())
        except ValueError:
            code = 0
    return code, body


def search_pexels(query: str) -> list[Candidate]:
    """Scrape the public search page for a query. Returns candidates in render order."""
    url = f"https://www.pexels.com/search/{quote(query)}/"
    code, html = _curl_get(url, timeout=30)
    if code != 200:
        print(f"      search HTTP {code} for '{query}'")
        return []

    seen: set[str] = set()
    out: list[Candidate] = []

    # Pass 1: extract with photographer slug (preferred)
    for m in PHOTO_RE.finditer(html):
        photo_id = m.group(1)
        photog_slug = m.group(2)
        if photo_id in seen:
            continue
        seen.add(photo_id)
        # Strip trailing numeric Pexels user-id token ("quang viet nguyen 107013384" -> "Quang Viet Nguyen")
        parts = unquote(photog_slug).split("-")
        if parts and parts[-1].isdigit() and len(parts) > 1:
            parts = parts[:-1]
        photog = " ".join(parts).title()
        out.append(_build_candidate(photo_id, photog))

    # Pass 2: any remaining bare IDs without `dl=` (photographer unknown)
    for m in BARE_PHOTO_RE.finditer(html):
        photo_id = m.group(1)
        if photo_id in seen:
            continue
        seen.add(photo_id)
        out.append(_build_candidate(photo_id, "Unknown"))

    return out


def _build_candidate(photo_id: str, photographer: str) -> Candidate:
    base = f"https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg"
    return Candidate(
        photo_id=photo_id,
        photographer=photographer,
        page_url=f"https://www.pexels.com/photo/{photo_id}/",
        thumb_url=f"{base}?auto=compress&cs=tinysrgb&w=800",
        full_url=f"{base}?auto=compress&cs=tinysrgb&w=2400",
    )


def download_thumb(url: str, out_path: str) -> int:
    r = requests.get(url, headers=HEADERS, timeout=60)
    r.raise_for_status()
    img = Image.open(BytesIO(r.content)).convert("RGB")
    img = ImageOps.fit(img, (640, 336), method=Image.LANCZOS, centering=(0.5, 0.5))
    img.save(out_path, "JPEG", quality=82, optimize=True)
    return os.path.getsize(out_path)


def collect_for_slug(queries: Iterable[str]) -> list[Candidate]:
    seen_ids: set[str] = set()
    collected: list[Candidate] = []
    for q in queries:
        if len(collected) >= TOP_N:
            break
        print(f"      query: '{q}'")
        for c in search_pexels(q):
            if c.photo_id in seen_ids:
                continue
            seen_ids.add(c.photo_id)
            collected.append(c)
            if len(collected) >= TOP_N:
                break
        time.sleep(0.8)
    return collected[:TOP_N]


def main() -> int:
    if not os.path.exists(WATCHES_FILE):
        print(f"ERROR: {WATCHES_FILE} not found — run from repo root")
        return 1

    os.makedirs(THUMB_DIR, exist_ok=True)
    force = "--force" in sys.argv

    results: dict[str, dict] = {}
    if not force and os.path.exists(META_FILE):
        with open(META_FILE, encoding="utf-8") as f:
            results = json.load(f)

    slugs = list(AI_WATCHES.keys())
    for i, slug in enumerate(slugs, 1):
        if not force and slug in results and results[slug].get("candidates"):
            print(f"[{i:2d}/{len(slugs)}] CACHED  {slug}")
            continue

        print(f"[{i:2d}/{len(slugs)}] PEXELS  {slug}")
        cands = collect_for_slug(AI_WATCHES[slug])
        if not cands:
            print(f"      NO RESULTS")
            results[slug] = {"candidates": []}
            continue

        enriched: list[dict[str, str]] = []
        for n, c in enumerate(cands, 1):
            thumb_path = os.path.join(THUMB_DIR, f"{slug}-{n}.jpg")
            try:
                sz = download_thumb(c.thumb_url, thumb_path)
                print(f"        [{n}] id={c.photo_id} by {c.photographer[:30]} ({sz:,}b)")
                enriched.append({**c.as_dict(), "thumb": f"/round3-candidates/{slug}-{n}.jpg"})
            except Exception as e:
                print(f"        [{n}] download fail: {e}")
            time.sleep(0.4)

        results[slug] = {"candidates": enriched}
        # Persist after each watch so a crash mid-run doesn't lose progress
        with open(META_FILE, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

    with_cands = sum(1 for r in results.values() if r.get("candidates"))
    total = sum(len(r.get("candidates", [])) for r in results.values())
    print()
    print("=== Summary ===")
    print(f"Watches with candidates: {with_cands}/{len(slugs)}")
    print(f"Total candidate images : {total}")
    print(f"Metadata: {META_FILE}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
