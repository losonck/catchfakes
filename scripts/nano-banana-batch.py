"""Generate all 80 images (40 watches x 2 variants) via Gemini 2.5 Flash Image.

Reads data/prompt-sheet.csv, writes public/articles/{slug}-v1.jpg and -v2.jpg.
Idempotent — skips files that already exist (use --force to overwrite).
Handles 429 rate limits with exponential backoff.
"""
import csv, os, sys, time, base64, random
from io import BytesIO
from PIL import Image, ImageOps
from google import genai
from google.genai.errors import APIError

# --- key ---
key = None
for line in open(".env"):
    if line.startswith("GEMINI_API_KEY="):
        key = line.split("=", 1)[1].strip(); break
if not key: sys.exit("GEMINI_API_KEY missing in .env")
client = genai.Client(api_key=key)

OUT = "public/articles"
os.makedirs(OUT, exist_ok=True)

force = "--force" in sys.argv

with open("data/prompt-sheet.csv", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

print(f"Batch generating {len(rows)} watches × 2 variants = {len(rows)*2} images\n")

def generate_one(prompt: str, out_path: str, max_attempts: int = 5) -> bool:
    """Generate one image with retries on rate limits."""
    for attempt in range(1, max_attempts + 1):
        try:
            resp = client.models.generate_content(
                model="gemini-2.5-flash-image",
                contents=[prompt],
            )
            for part in resp.candidates[0].content.parts:
                if getattr(part, "inline_data", None) and part.inline_data.data:
                    raw = part.inline_data.data
                    if isinstance(raw, str):
                        raw = base64.b64decode(raw)
                    img = Image.open(BytesIO(raw)).convert("RGB")
                    img = ImageOps.fit(img, (1200, 630), method=Image.LANCZOS, centering=(0.5, 0.5))
                    img.save(out_path, "JPEG", quality=88, optimize=True)
                    return True
            print(f"        no image in response (attempt {attempt})")
            return False
        except APIError as e:
            msg = str(e)
            if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
                wait = min(60, 2 ** attempt + random.uniform(0, 2))
                print(f"        rate limited, sleeping {wait:.1f}s (attempt {attempt}/{max_attempts})")
                time.sleep(wait)
                continue
            print(f"        APIError: {msg[:200]}")
            return False
        except Exception as e:
            print(f"        FAIL: {e}")
            return False
    print(f"        gave up after {max_attempts} attempts")
    return False


done = skipped = failed = 0
total = len(rows) * 2
i = 0
for r in rows:
    for v in ("v1", "v2"):
        i += 1
        out = os.path.join(OUT, r[f"{v}_filename"])
        if not force and os.path.exists(out):
            skipped += 1
            print(f"[{i:3d}/{total}] SKIP   {r[f'{v}_filename']}")
            continue
        print(f"[{i:3d}/{total}] GEN    {r[f'{v}_filename']}  ({r['style']})")
        ok = generate_one(r[f"{v}_prompt"], out)
        if ok:
            print(f"        wrote {out} ({os.path.getsize(out):,} bytes)")
            done += 1
        else:
            failed += 1
        # Small inter-request pause to be polite
        time.sleep(0.5)

print()
print(f"Done. Generated: {done} | Skipped: {skipped} | Failed: {failed}")
