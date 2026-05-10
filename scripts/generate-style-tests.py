"""Generate 5 mood/lighting variants on 5 different watches for visual comparison.

Saves to public/image-styles/{slug}.jpg so they can be previewed at /image-styles
without overwriting the production article hero images.

Each prompt is engineered to:
  - vary mood/lighting distinctly
  - avoid hallucinating dial text (uses 3/4 angles, partial views, or focus tricks)
  - stay photorealistic (no illustration / no artistic interpretation)
"""
import base64, os, sys
from io import BytesIO
from PIL import Image
from openai import OpenAI

key = None
for line in open(".env"):
    if line.startswith("OPENAI_API_KEY="):
        key = line.split("=", 1)[1].strip(); break
client = OpenAI(api_key=key)

OUT_DIR = "public/image-styles"
os.makedirs(OUT_DIR, exist_ok=True)

# Five pairings: (slug, style_name, prompt)
TESTS = [
    (
        "rolex-submariner",
        "1-cinematic-cool",
        """Cinematic editorial product photograph of a stainless steel diver's wristwatch with a black unidirectional rotating bezel and integrated steel bracelet. Photographed from a low 3/4 angle showing the case profile, lugs, and bracelet transition. Crisp cool blue rim light from the upper left. Deep navy-to-black gradient background. Razor-sharp focus on the bezel edge and case finishing. Modern luxury campaign aesthetic. 16:9 cinematic composition, watch positioned slightly right of center, generous negative space. Strictly photorealistic studio commercial photography. No visible text on the dial. No illustration. No artifacts. No reflections of the photographer. Realistic proportions and physically plausible reflections only."""
    ),
    (
        "patek-nautilus",
        "2-high-contrast-fashion",
        """High-contrast editorial fashion photograph of a luxury sports wristwatch with an integrated brushed-and-polished stainless steel bracelet and a dark embossed horizontally-striped dial. Photographed dial-up at a 30-degree downward tilt. Pure white seamless studio background. Single hard key light from above-right creating a bold, defined cast shadow on the white surface. Razor-sharp focus across the whole watch. Vivid contrast with deep blacks. GQ / Esquire watch-shoot aesthetic. 16:9 composition. Strictly photorealistic commercial photography. No visible text on the dial. No illustration. No artifacts. Realistic proportions only."""
    ),
    (
        "cartier-tank",
        "3-bright-studio-catalog",
        """Clean product catalogue photograph of a rectangular dress wristwatch with a steel case, blue cabochon-set crown, white dial with Roman numeral hour markers, and a brown alligator-grain leather strap. Photographed straight top-down (flat-lay). Pure white seamless background. Even soft top-light from a large softbox, subtle natural shadow beneath the watch. Crystal clear edge-to-edge focus. Premium e-commerce magazine quality. Watch positioned slightly off-center with ample negative space. 16:9 composition. Strictly photorealistic commercial product photography. No props. No illustration. No artifacts. Realistic proportions only."""
    ),
    (
        "audemars-piguet-royal-oak",
        "4-minimalist-architectural",
        """Minimalist architectural photograph of a luxury sports wristwatch with an octagonal screwed-down bezel and an integrated brushed-and-polished steel bracelet, resting flat on a smooth raw concrete surface. Single soft directional light from upper-left at a low angle. Cool neutral grey colour palette throughout. Generous negative space around the watch. Quiet, gallery-aesthetic, museum-piece presentation. Razor-sharp focus on the bezel screws and tapisserie dial pattern. 16:9 composition. Strictly photorealistic studio commercial photography. No visible text on the dial. No illustration. No artifacts. Realistic proportions and physically plausible shadows only."""
    ),
    (
        "omega-speedmaster",
        "5-natural-daylight-lifestyle",
        """Natural daylight lifestyle photograph of a stainless steel manual-wind chronograph wristwatch with a matte black dial, three white sub-dials, and a black tachymeter bezel, resting on an aged brown leather notebook next to a half-full ceramic coffee cup. Soft directional window light from the left. Warm-but-neutral natural colour temperature, no yellow cast. Background is slightly out-of-focus showing wood grain. Razor-sharp focus on the watch. Editorial lifestyle magazine aesthetic. 16:9 composition, watch positioned in the left third of the frame. Strictly photorealistic photography. No visible text on the dial. No illustration. No artifacts. Realistic proportions only."""
    ),
]

print(f"Generating {len(TESTS)} style tests at {OUT_DIR}\n")
done = failed = 0
for slug, style, prompt in TESTS:
    out = os.path.join(OUT_DIR, f"{style}.jpg")
    print(f"[{style}] watch: {slug}")
    try:
        resp = client.images.generate(
            model="gpt-image-1",
            prompt=prompt,
            size="1536x1024",
            quality="high",   # high quality for these — Karl is judging output
            n=1,
        )
        raw = base64.b64decode(resp.data[0].b64_json)
        img = Image.open(BytesIO(raw)).convert("RGB").resize((1200, 630), Image.LANCZOS)
        img.save(out, "JPEG", quality=88, optimize=True)
        print(f"        wrote {out} ({os.path.getsize(out):,} bytes)\n")
        done += 1
    except Exception as e:
        print(f"        FAIL: {e}\n")
        failed += 1

print(f"Done. Generated: {done} | Failed: {failed}")
