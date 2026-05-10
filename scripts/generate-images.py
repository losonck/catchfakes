"""Generate one hero image per article via OpenAI gpt-image-1.

Idempotent — skips watches that already have an image.
Saves to public/articles/{slug}.jpg at 1200x630 (perfect for OG + hero use).
"""
import base64
import json
import os
import sys
from io import BytesIO
from PIL import Image
from openai import OpenAI

# read OPENAI_API_KEY from .env
key = None
for line in open(".env"):
    if line.startswith("OPENAI_API_KEY="):
        key = line.split("=", 1)[1].strip()
        break

client = OpenAI(api_key=key)

with open("data/watches.json", encoding="utf-8") as f:
    WATCHES = json.load(f)

OUT_DIR = "public/articles"
os.makedirs(OUT_DIR, exist_ok=True)

PROMPT_TEMPLATE = """Cinematic editorial photograph of a {brand} {model} watch, reference {ref}, in dramatic chiaroscuro lighting.
Dark, almost-black background with deep shadows. Warm brass and gold highlights catching the bezel,
crown, and case edges. Watch face visible with precision craftsmanship details.
Shot on a fine grain film aesthetic. Magazine cover quality. Photorealistic.
Composition: 16:9 cinematic, watch positioned slightly off-center, generous negative space.
No text, no logos, no brand names visible.
Mood: premium horology, authentication, forensic-grade attention to detail.
Atmosphere: refined, mysterious, expensive."""

force = "--force" in sys.argv
done = skipped = failed = 0
total = len(WATCHES)

for i, watch in enumerate(WATCHES, 1):
    slug = watch["slug"]
    out = os.path.join(OUT_DIR, f"{slug}.jpg")
    if not force and os.path.exists(out):
        skipped += 1
        print(f"[{i}/{total}] SKIP   {slug}")
        continue
    prompt = PROMPT_TEMPLATE.format(
        brand=watch["brand"],
        model=watch["model"],
        ref=watch["refs"][0] if watch["refs"] else "",
    )
    print(f"[{i}/{total}] GEN    {slug}  ({watch['brand']} {watch['model']})")
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
        size = os.path.getsize(out)
        print(f"        wrote {out} ({size:,} bytes)")
        done += 1
    except Exception as e:
        print(f"        FAIL: {e}")
        failed += 1

print()
print(f"Done. Generated: {done} | Skipped: {skipped} | Failed: {failed}")
