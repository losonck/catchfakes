"""Quick test: generate 4 images via Gemini 2.5 Flash Image (Nano Banana).
One per style, to validate quality before the full 80-prompt batch.
Saves to public/articles-test/{slug}-v{n}.jpg
"""
import csv, os, sys, base64
from io import BytesIO
from PIL import Image
from google import genai
from google.genai import types

# --- key ---
key = None
for line in open(".env"):
    if line.startswith("GEMINI_API_KEY="):
        key = line.split("=", 1)[1].strip(); break
if not key: sys.exit("GEMINI_API_KEY missing in .env")
client = genai.Client(api_key=key)

# --- pick 4 test rows (one per style) ---
TEST_SLUGS = {
    "rolex-submariner",       # cinematic-cool
    "cartier-tank",           # bright-studio
    "audemars-piguet-royal-oak",  # architectural
    "omega-speedmaster",      # daylight-lifestyle
}

OUT = "public/articles-test"
os.makedirs(OUT, exist_ok=True)

with open("data/prompt-sheet.csv", encoding="utf-8") as f:
    rows = [r for r in csv.DictReader(f) if r["slug"] in TEST_SLUGS]

print(f"Testing {len(rows)} watches × 2 variants = {len(rows)*2} images via gemini-2.5-flash-image\n")

done = failed = 0
for r in rows:
    for v in ("v1", "v2"):
        out = os.path.join(OUT, r[f"{v}_filename"])
        prompt = r[f"{v}_prompt"]
        print(f"[{r['slug']:<30} {v}]  {r['style']}")
        try:
            resp = client.models.generate_content(
                model="gemini-2.5-flash-image",
                contents=[prompt],
            )
            saved = False
            for part in resp.candidates[0].content.parts:
                if getattr(part, "inline_data", None) and part.inline_data.data:
                    raw = part.inline_data.data
                    if isinstance(raw, str):
                        raw = base64.b64decode(raw)
                    img = Image.open(BytesIO(raw)).convert("RGB").resize((1200, 630), Image.LANCZOS)
                    img.save(out, "JPEG", quality=88, optimize=True)
                    print(f"        wrote {out} ({os.path.getsize(out):,} bytes)")
                    saved = True
                    done += 1
                    break
            if not saved:
                print(f"        FAIL: no image in response (text only)")
                failed += 1
        except Exception as e:
            print(f"        FAIL: {e}")
            failed += 1
        print()

print(f"Done. Generated: {done} | Failed: {failed}")
