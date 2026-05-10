"""Generate one hero image per article via OpenAI gpt-image-1, using a per-slug style map.

Each slug is mapped to one of 4 approved styles:
  - cinematic-cool       (sport divers, GMTs, dive tools)
  - bright-studio        (dress watches, elegant pieces)
  - architectural        (sports-luxury, integrated-bracelet, restrained luxury)
  - daylight-lifestyle   (chronographs, vintage, tool watches with character)

Idempotent — skips watches that already have an image. Use --force to overwrite.
"""
import base64
import json
import os
import sys
from io import BytesIO
from PIL import Image
from openai import OpenAI

# ----- API key -----
key = None
for line in open(".env"):
    if line.startswith("OPENAI_API_KEY="):
        key = line.split("=", 1)[1].strip(); break
client = OpenAI(api_key=key)

with open("data/watches.json", encoding="utf-8") as f:
    WATCHES = json.load(f)

OUT_DIR = "public/articles"
os.makedirs(OUT_DIR, exist_ok=True)

# ----- 4 approved style prompts -----
# Each takes {brand}, {model}, {ref} placeholders. Designed to minimise hallucination
# (3/4 angles, partial views, no-text directives, anti-illustration clauses).

STYLES = {
    "cinematic-cool": (
        "Cinematic editorial product photograph of a {brand} {model} (reference {ref}). "
        "Photographed from a low 3/4 angle showing the case profile, lugs, and bracelet/strap transition. "
        "Crisp cool blue rim light from the upper left. Deep navy-to-black gradient background. "
        "Razor-sharp focus on the bezel edge, case finishing, and end-link. "
        "Modern luxury campaign aesthetic. 16:9 cinematic composition, watch positioned slightly right of center, "
        "generous negative space. Strictly photorealistic studio commercial photography. "
        "No visible text on the dial. No illustration. No artifacts. No reflections of the photographer. "
        "Realistic proportions and physically plausible reflections only."
    ),
    "bright-studio": (
        "Clean product catalogue photograph of a {brand} {model} (reference {ref}). "
        "Photographed straight top-down (flat-lay) showing the full watch and strap/bracelet. "
        "Pure white seamless background. Even soft top-light from a large softbox, subtle natural shadow beneath the watch. "
        "Crystal clear edge-to-edge focus. Premium e-commerce magazine quality. Neutral colour palette. "
        "Watch positioned slightly off-center with ample negative space. 16:9 composition. "
        "Strictly photorealistic commercial product photography. "
        "No props. No illustration. No artifacts. Realistic proportions only. Avoid rendering legible text on the dial."
    ),
    "architectural": (
        "Minimalist architectural photograph of a {brand} {model} (reference {ref}), "
        "resting flat on a smooth raw concrete surface. Single soft directional light from upper-left at a low angle. "
        "Cool neutral grey colour palette throughout. Generous negative space around the watch. "
        "Quiet, gallery-aesthetic, museum-piece presentation. Razor-sharp focus on the bezel and dial pattern. "
        "16:9 composition. Strictly photorealistic studio commercial photography. "
        "No visible text on the dial. No illustration. No artifacts. "
        "Realistic proportions and physically plausible shadows only."
    ),
    "daylight-lifestyle": (
        "Natural daylight lifestyle photograph of a {brand} {model} (reference {ref}), "
        "resting on an aged brown leather notebook next to a half-full ceramic coffee cup. "
        "Soft directional window light from the left. Warm-but-neutral natural colour temperature, "
        "no yellow cast. Background slightly out-of-focus showing wood grain. "
        "Razor-sharp focus on the watch. Editorial lifestyle magazine aesthetic. "
        "16:9 composition, watch positioned in the left third of the frame. "
        "Strictly photorealistic photography. No visible text on the dial. No illustration. No artifacts. "
        "Realistic proportions only."
    ),
}

# ----- Per-slug style map -----
STYLE_MAP = {
    # Cinematic Cool — sport divers, GMTs, modern steel sport
    "rolex-submariner":         "cinematic-cool",
    "rolex-gmt-master-ii":      "cinematic-cool",
    "rolex-explorer":           "cinematic-cool",
    "rolex-yachtmaster":        "cinematic-cool",
    "rolex-sea-dweller":        "cinematic-cool",
    "rolex-sky-dweller":        "cinematic-cool",
    "rolex-air-king":           "cinematic-cool",
    "omega-seamaster-300":      "cinematic-cool",
    "omega-aqua-terra":         "cinematic-cool",
    "tudor-pelagos":            "cinematic-cool",
    "tudor-black-bay-pro":      "cinematic-cool",
    "panerai-luminor":          "cinematic-cool",
    "bell-ross-br-03":          "cinematic-cool",

    # Bright Studio Catalog — dress, elegant
    "rolex-datejust":           "bright-studio",
    "cartier-santos":           "bright-studio",
    "cartier-tank":             "bright-studio",
    "iwc-portugieser":          "bright-studio",
    "omega-constellation":      "bright-studio",
    "patek-calatrava":          "bright-studio",
    "cartier-ballon-bleu":      "bright-studio",
    "jlc-reverso":              "bright-studio",

    # Minimalist Architectural — sports-luxury, integrated bracelets
    "audemars-piguet-royal-oak":"architectural",
    "patek-nautilus":           "architectural",
    "grand-seiko-snowflake":    "architectural",
    "vacheron-overseas":        "architectural",
    "richard-mille-rm-011":     "architectural",
    "patek-aquanaut":           "architectural",
    "ap-royal-oak-offshore":    "architectural",
    "ap-code-1159":             "architectural",
    "hublot-big-bang":          "architectural",

    # Natural Daylight Lifestyle — chronos, vintage, lifestyle stories
    "rolex-daytona":            "daylight-lifestyle",
    "omega-speedmaster":        "daylight-lifestyle",
    "tudor-black-bay-58":       "daylight-lifestyle",
    "breitling-navitimer":      "daylight-lifestyle",
    "tag-heuer-monaco":         "daylight-lifestyle",
    "rolex-submariner-vintage": "daylight-lifestyle",
    "omega-speedmaster-pre-moon":"daylight-lifestyle",
    "vacheron-222":             "daylight-lifestyle",
    "heuer-carrera-vintage":    "daylight-lifestyle",
    "zenith-el-primero":        "daylight-lifestyle",
}


force = "--force" in sys.argv
done = skipped = failed = 0
total = len(WATCHES)

# Sanity: every watch in watches.json should be mapped
unmapped = [w["slug"] for w in WATCHES if w["slug"] not in STYLE_MAP]
if unmapped:
    print(f"WARNING: {len(unmapped)} watches not in STYLE_MAP — will use cinematic-cool fallback:")
    for s in unmapped: print(f"  - {s}")
    print()

for i, watch in enumerate(WATCHES, 1):
    slug = watch["slug"]
    out = os.path.join(OUT_DIR, f"{slug}.jpg")
    style = STYLE_MAP.get(slug, "cinematic-cool")

    if not force and os.path.exists(out):
        skipped += 1
        print(f"[{i}/{total}] SKIP   {slug}  ({style})")
        continue

    prompt = STYLES[style].format(
        brand=watch["brand"],
        model=watch["model"],
        ref=watch["refs"][0] if watch["refs"] else "",
    )
    print(f"[{i}/{total}] GEN    {slug}  ({style})  {watch['brand']} {watch['model']}")
    try:
        resp = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1536x1024",
            quality="medium",
            n=1,
        )
        raw = base64.b64decode(resp.data[0].b64_json)
        img = Image.open(BytesIO(raw)).convert("RGB").resize((1200, 630), Image.LANCZOS)
        img.save(out, "JPEG", quality=85, optimize=True)
        print(f"        wrote {out} ({os.path.getsize(out):,} bytes)")
        done += 1
    except Exception as e:
        print(f"        FAIL: {e}")
        failed += 1

print()
print(f"Done. Generated: {done} | Skipped: {skipped} | Failed: {failed}")
