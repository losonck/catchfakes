"""Build 40 watches × 2 prompt variants for Nano Banana, output as JSON + CSV.

Each watch is mapped to one of 4 visual styles (matches generate-images.py STYLE_MAP).
Each style has TWO variant templates so Karl can compare and pick the better generation.
Per-watch visual cues are inserted to make prompts brand/model-specific without
hallucinating dial text.

Output:
  data/prompt-sheet.json   — list of dicts (one per watch, with v1 and v2 prompts)
  data/prompt-sheet.csv    — same data, comma-separated, for fallback / Excel
"""
import csv
import json
import os

with open("data/watches.json", encoding="utf-8") as f:
    WATCHES = json.load(f)

# Slug → style (mirrors generate-images.py STYLE_MAP)
STYLE_MAP = {
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
    "rolex-datejust":           "bright-studio",
    "cartier-santos":           "bright-studio",
    "cartier-tank":             "bright-studio",
    "iwc-portugieser":          "bright-studio",
    "omega-constellation":      "bright-studio",
    "patek-calatrava":          "bright-studio",
    "cartier-ballon-bleu":      "bright-studio",
    "jlc-reverso":              "bright-studio",
    "audemars-piguet-royal-oak":"architectural",
    "patek-nautilus":           "architectural",
    "grand-seiko-snowflake":    "architectural",
    "vacheron-overseas":        "architectural",
    "richard-mille-rm-011":     "architectural",
    "patek-aquanaut":           "architectural",
    "ap-royal-oak-offshore":    "architectural",
    "ap-code-1159":             "architectural",
    "hublot-big-bang":          "architectural",
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

# Brand/model-specific visual cues — descriptive enough for Nano Banana to render
# the right WATCH without us hallucinating dial text or invented details.
VISUAL_CUES = {
    "rolex-submariner":         "stainless steel 41mm Oyster case, black dial with circular and rectangular maxi-dial markers, black ceramic Cerachrom unidirectional rotating bezel with platinum-coated 60-minute scale, Mercedes-style hour hand, stainless steel Oyster bracelet with Glidelock clasp, cyclops magnifier over date at 3 o'clock",
    "rolex-datejust":           "stainless steel 36mm Oyster case, fluted white gold bezel, silver dial with applied baton hour markers, polished baton hands, stainless steel Jubilee five-link bracelet, cyclops magnifier over date at 3 o'clock",
    "rolex-daytona":            "stainless steel 40mm Oyster case, black dial with three contrasting white sub-dials at 3, 6 and 9 o'clock, black ceramic Cerachrom tachymetric bezel, screw-down chronograph pushers, stainless steel Oyster bracelet",
    "rolex-gmt-master-ii":      "stainless steel 40mm Oyster case, black dial with maxi-dial markers, two-tone blue-and-black ceramic Cerachrom 24-hour bezel (Batman), Mercedes hour hand, distinctive red GMT hand with arrow tip, stainless steel Oyster or Jubilee bracelet, cyclops magnifier over date",
    "rolex-explorer":           "stainless steel 36mm or 40mm Oyster case, glossy black dial with applied 3, 6 and 9 numerals plus baton markers, smooth stainless steel bezel, Mercedes-style hour hand, stainless steel Oyster bracelet, no date",
    "rolex-yachtmaster":        "stainless steel 40mm Oyster case with Rolesium platinum bezel showing raised polished numerals, blue dial with applied luminous markers and Mercedes hour hand, stainless steel Oyster bracelet with Oysterlock clasp, cyclops magnifier over date",
    "omega-seamaster-300":      "stainless steel 42mm case with helium escape valve at 10 o'clock, polished blue ceramic dial with laser-engraved wave pattern, blue ceramic unidirectional rotating dive bezel with white enamel scale, skeleton sword-shaped hands, stainless steel bracelet, sapphire display caseback",
    "omega-aqua-terra":         "stainless steel 41mm case, blue dial with vertical 'teak deck' striping pattern, applied luminous baton hour markers, leaf-shaped hands, polished stainless steel bezel, stainless steel bracelet, date window at 6 o'clock",
    "tudor-pelagos":            "matt-finished titanium 42mm case, matte black dial with luminous Snowflake hands and square hour markers, matte black ceramic unidirectional rotating dive bezel, titanium bracelet with self-adjusting spring clasp, helium escape valve",
    "tudor-black-bay-pro":      "stainless steel 39mm case with brushed finish, matte black dial with Snowflake hand and luminous indices, fixed yellow-and-black 24-hour bezel for GMT timing, distinctive yellow GMT hand, jubilee-style five-link bracelet",
    "panerai-luminor":          "brushed stainless steel 44mm cushion case with the signature crown-protector lever-bridge at 9 o'clock, matte black sandwich dial with luminous numerals at 12-3-6-9 plus baton indices, simple bezel, thick black or brown leather strap with steel pin buckle",
    "bell-ross-br-03":          "matte black ceramic 41mm square case with four exposed corner screws, matte black dial styled like an aircraft cockpit instrument with large luminous numerals at 12-3-6-9 plus minute track, matte black-coated hands, black canvas or rubber strap",
    "rolex-sea-dweller":        "stainless steel 43mm Oyster case with helium escape valve, black dial with maxi-dial markers and the signature red 'SEA-DWELLER' text, black ceramic Cerachrom unidirectional rotating bezel, Mercedes hour hand, stainless steel Oyster bracelet with Glidelock and Fliplock extension, cyclops magnifier over date",
    "rolex-sky-dweller":        "stainless steel and white gold 42mm Oyster case, white silver dial with applied baton indices, ring command fluted bezel, off-centered second time zone disc at the dial center, twelve small month-indicator apertures around the dial perimeter, stainless steel Oyster bracelet",
    "rolex-air-king":           "stainless steel 40mm Oyster case, black dial with prominent applied luminous 3-6-9 numerals plus minute-scale numerals on the inner ring, smooth domed stainless steel bezel, distinctive yellow-green Rolex coronet at 12 o'clock, stainless steel Oyster bracelet",

    "cartier-santos":           "polished stainless steel rectangular case with rounded edges, eight visible blue screws on the bezel, white silvered dial with painted black Roman numerals and a chemin-de-fer minute track, blued steel sword hands, blue cabochon-set crown, integrated stainless steel bracelet",
    "cartier-tank":             "polished stainless steel rectangular case 31x40mm with brushed bands above and below, silvered opaline dial with painted black Roman numerals and chemin-de-fer railroad minute track, blued steel sword hands, blue cabochon-set crown, brown alligator-grain leather strap with steel pin buckle",
    "iwc-portugieser":          "polished stainless steel round 40mm case with thin bezel, silvered dial with black painted Arabic numerals and railway-track minute scale, blued steel feuille hands, small seconds sub-dial at 6 o'clock, leather strap",
    "omega-constellation":      "stainless steel 39mm case with the signature claws holding the bezel at 4 and 8 o'clock, silver dial with applied baton hour markers, integrated stainless steel bracelet",
    "patek-calatrava":          "polished white gold round 38mm case, silvered satin-finished dial with applied gold baton hour markers, dauphine hour and minute hands, small seconds sub-dial at 6 o'clock, brown alligator leather strap with white-gold pin buckle",
    "cartier-ballon-bleu":      "polished stainless steel round case with the crown integrated into a side cabochon guard, silvered guilloché dial with black painted Roman numerals and railway-track minute scale, blued steel sword hands, brown leather or steel bracelet",
    "jlc-reverso":              "polished stainless steel rectangular case with the signature reversible swivel mechanism, silvered satin dial with painted Arabic numerals on Art Deco gadroons, blued steel hands, brown alligator-grain leather strap",

    "audemars-piguet-royal-oak":"stainless steel 41mm octagonal bezel with eight exposed hexagonal screws, blue dial with the signature 'Grande Tapisserie' guilloché waffle pattern, applied white-gold baton hour markers and matching hands, integrated stainless steel bracelet",
    "patek-nautilus":           "stainless steel 40mm rounded-octagonal case with horizontal lugs, dark blue dial with horizontal embossed groove pattern and gradient fade to black at the edges, applied white-gold baton hour markers and matching hands, integrated stainless steel three-link bracelet",
    "grand-seiko-snowflake":    "high-intensity titanium 41mm case, distinctive textured 'snowflake' silver dial mimicking fallen snow, polished applied baton hour markers, blued steel seconds hand, titanium bracelet, small power-reserve indicator at lower-left",
    "vacheron-overseas":        "stainless steel 41mm case with the signature six-sided Maltese-cross-shaped bezel, blue dial with horizontal embossed pattern and applied baton hour markers, integrated stainless steel bracelet with half-Maltese-cross links",
    "richard-mille-rm-011":     "tonneau-shaped (curved barrel) titanium and carbon TPT case with skeletonised tourbillon dial showing the visible movement architecture, exposed bridges, sub-dials at 4 and 8 o'clock, black rubber strap, technical aerospace-grade aesthetic",
    "patek-aquanaut":           "stainless steel 40mm rounded-octagonal case, embossed black or blue checkerboard pattern dial, applied luminous baton hour markers, tropical-style black or blue composite rubber strap with the signature embossed pattern matching the dial",
    "ap-royal-oak-offshore":    "stainless steel 42mm octagonal bezel with eight hexagonal screws, slate grey 'Méga Tapisserie' guilloché dial, three large recessed chronograph sub-dials, large screw-down chronograph pushers, black rubber strap or stainless steel bracelet",
    "ap-code-1159":             "polished and brushed white gold 41mm case combining a circular middle case with an octagonal top, double-curved sapphire crystal, smoked-blue dial with railway minute track and applied gold hour markers, dauphine hands, brown alligator strap",
    "hublot-big-bang":          "polished and brushed stainless steel 44mm round case with the signature six exposed H-shaped screws on the bezel, matte black dial with applied luminous baton markers and three black-on-black chronograph sub-dials, black rubber-and-leather strap",

    "rolex-submariner-vintage": "vintage 1970s stainless steel 40mm Oyster case with polished sides, black gilt dial with creamy aged tritium luminous markers and gilt printing, faded-to-grey or black aluminium dive bezel insert, vintage Mercedes hour hand, riveted or expanding link Oyster bracelet, signs of patina and wear",
    "rolex-daytona": None,  # in lifestyle list
    "omega-speedmaster":        "stainless steel 42mm Moonwatch case with twisted lyre lugs, matte black dial with three white sub-dials, black aluminium tachymeter bezel, baton hour markers, polished stainless steel pump pushers, hesalite domed crystal, stainless steel bracelet",
    "tudor-black-bay-58":       "stainless steel 39mm case with snowflake hour and minute hands, matte black or burgundy dial with gilt printing, anodised aluminium unidirectional rotating dive bezel, stainless steel rivet-style bracelet or aged brown leather strap",
    "breitling-navitimer":      "stainless steel 41mm case, dark blue or black dial with three contrasting silver chronograph sub-dials, distinctive bidirectional rotating slide-rule bezel with logarithmic scales, stainless steel beads-of-rice bracelet, oversized crown",
    "tag-heuer-monaco":         "stainless steel square 39mm case with crown on the LEFT side at 9 o'clock, blue dial with two white square chronograph sub-dials at 3 and 9, applied luminous baton markers, red minute hand, black perforated calf leather strap",
    "omega-speedmaster-pre-moon":"vintage 1960s stainless steel Moonwatch case with twisted lyre lugs, matte black dial with creamy aged tritium markers, applied Omega logo, faded black aluminium tachymeter bezel insert, stepped dial profile, original beads-of-rice bracelet showing patina",
    "vacheron-222":             "vintage steel-and-yellow-gold 37mm case with notched bezel, salmon-pink or champagne dial with applied baton hour markers, integrated bracelet with alternating brushed and polished links, signs of aged patina",
    "heuer-carrera-vintage":    "vintage 1960s polished stainless steel 38mm chronograph case with curved twisted lugs, panda dial layout with white background and two contrasting black sub-dials at 3 and 9, baton hour markers, stainless steel pump pushers, brown leather strap with stitching",
    "zenith-el-primero":        "stainless steel 38mm case with thin bezel, the iconic three-coloured tri-compax dial layout (one light grey, one anthracite, one blue sub-dial), polished baton hour markers, faceted polished hour and minute hands, stainless steel ladder-style bracelet",
}
# Daytona belongs in lifestyle but we have it above; assign:
VISUAL_CUES["rolex-daytona"] = "stainless steel 40mm Oyster case, white panda dial with three contrasting black sub-dials at 3, 6 and 9 o'clock, black ceramic Cerachrom tachymetric bezel, screw-down chronograph pushers, stainless steel Oyster bracelet"


# Style prompt templates — each style has v1 and v2 variants.
# Variant 1 = primary mood; Variant 2 = secondary angle within same style.
STYLES = {
    "cinematic-cool": {
        "v1": (
            "Cinematic editorial product photograph of a {brand} {model} (reference {ref}). "
            "Watch detail: {cues}. "
            "Photographed from a low 3/4 angle showing the case profile, lugs, and bracelet/strap transition. "
            "Crisp cool blue rim light from the upper left. Deep navy-to-black gradient background. "
            "Razor-sharp focus on the bezel edge and case finishing. "
            "Shot on a Hasselblad H6D, 100mm macro lens, f/8, ISO 200, softbox + cool gel rim. "
            "16:9 cinematic composition, watch positioned slightly right of center, generous negative space. "
            "Strictly photorealistic studio commercial photography. No visible text on the dial, no brand logos, "
            "no illustration, no artifacts, no reflections of the photographer. "
            "Realistic proportions and physically plausible reflections only."
        ),
        "v2": (
            "Studio product photograph of a {brand} {model} (reference {ref}). "
            "Watch detail: {cues}. "
            "Dial-up at a 30-degree downward tilt showing the full dial face and bezel. "
            "Cool tonal background — gradient from deep slate-blue at the top to charcoal at the bottom. "
            "Single soft key light from above, cool fill from the right, subtle floor reflection. "
            "Razor-sharp focus across the dial, hands and bezel. "
            "Shot on a Phase One IQ4, 120mm macro, f/11, ISO 100. "
            "16:9 composition, watch slightly left of center, ample negative space on right. "
            "Strictly photorealistic. No visible text on the dial, no brand logos, no illustration, no artifacts. "
            "Realistic proportions only."
        ),
    },
    "bright-studio": {
        "v1": (
            "Clean product catalogue photograph of a {brand} {model} (reference {ref}). "
            "Watch detail: {cues}. "
            "Photographed straight top-down (flat-lay) showing the full watch and strap/bracelet. "
            "Pure white seamless paper background. Even soft top-light from a large overhead softbox, "
            "subtle natural shadow beneath the watch. Crystal clear edge-to-edge focus. "
            "Premium e-commerce magazine quality, neutral colour palette, no warm cast. "
            "Watch positioned slightly off-center with ample negative space. "
            "Shot on a Phase One IQ4, 80mm lens, f/11, ISO 100. "
            "16:9 composition. Strictly photorealistic commercial product photography. "
            "No props, no illustration, no artifacts, realistic proportions. Avoid rendering legible text on the dial."
        ),
        "v2": (
            "Premium product photograph of a {brand} {model} (reference {ref}). "
            "Watch detail: {cues}. "
            "Photographed at a 3/4 angle, watch appearing to float just above a pure white seamless surface, "
            "with a soft natural shadow beneath. Pure white background extending to infinity. "
            "Soft front-fill light, subtle rim light from above-right. Crystal clear focus on the case and dial. "
            "Premium luxury catalogue aesthetic, neutral colour palette, no warm cast. "
            "Shot on a Hasselblad H6D, 120mm macro, f/8, ISO 100. "
            "16:9 composition, watch in left third, generous negative space on right. "
            "Strictly photorealistic. No props, no illustration, no artifacts, realistic proportions. "
            "Avoid rendering legible text on the dial."
        ),
    },
    "architectural": {
        "v1": (
            "Minimalist architectural photograph of a {brand} {model} (reference {ref}), "
            "resting flat on a smooth raw concrete surface. "
            "Watch detail: {cues}. "
            "Single soft directional light from the upper-left at a low angle, casting a long subtle shadow. "
            "Cool neutral grey colour palette throughout. Generous negative space around the watch. "
            "Quiet gallery aesthetic, museum-piece presentation. "
            "Razor-sharp focus on the bezel and dial pattern. "
            "Shot on a Phase One IQ4, 100mm macro, f/8, ISO 200. "
            "16:9 composition, watch positioned in the lower-right third. "
            "Strictly photorealistic studio commercial photography. No visible text on the dial, no brand logos, "
            "no illustration, no artifacts. Realistic proportions and physically plausible shadows only."
        ),
        "v2": (
            "Architectural editorial photograph of a {brand} {model} (reference {ref}), "
            "resting on a smooth honed grey marble or polished basalt slab. "
            "Watch detail: {cues}. "
            "Single overhead soft light, large negative space, a dramatic reflective sheen on the stone surface. "
            "Cool neutral grey-and-bone palette. Restrained luxury, art-gallery presentation. "
            "Razor-sharp focus on the bezel screws, bracelet links, and dial pattern. "
            "Shot on a Hasselblad H6D, 120mm macro, f/11, ISO 100. "
            "16:9 composition, watch off-center with the reflection occupying the rest of the frame. "
            "Strictly photorealistic. No visible text on the dial, no brand logos, no illustration, no artifacts. "
            "Realistic proportions only."
        ),
    },
    "daylight-lifestyle": {
        "v1": (
            "Natural daylight lifestyle photograph of a {brand} {model} (reference {ref}), "
            "resting on an aged brown leather notebook beside a half-full ceramic espresso cup, "
            "on a matte oak desk surface. "
            "Watch detail: {cues}. "
            "Soft directional window light from the left, true daylight colour temperature around 5500K, "
            "no yellow cast and no orange tint. Background slightly out-of-focus showing wood grain. "
            "Razor-sharp focus on the watch case and dial. Editorial lifestyle magazine aesthetic, "
            "like Hodinkee or Worn & Wound. "
            "Shot on a Sony A7R V, 85mm f/1.8, f/4, ISO 400, available light only. "
            "16:9 composition, watch positioned in the left third, coffee cup softly out of focus on the right. "
            "Strictly photorealistic. No visible text on the dial, no brand logos, no illustration, no artifacts. "
            "Realistic proportions and physically accurate shadows only."
        ),
        "v2": (
            "Natural daylight lifestyle photograph of a {brand} {model} (reference {ref}), "
            "resting on a watchmaker's worn wooden bench between a brass loupe and a small open-face "
            "movement-rest tray. "
            "Watch detail: {cues}. "
            "Soft directional window light from the upper-right, true daylight colour temperature around 5500K, "
            "no yellow cast. Background slightly out-of-focus showing tools and the wood-grain bench. "
            "Razor-sharp focus on the watch. Editorial documentary photography, intimate workshop atmosphere. "
            "Shot on a Leica Q3, 28mm Summilux, f/2.8, ISO 800, available light only. "
            "16:9 composition, watch positioned in the right third, tools softly framing the left. "
            "Strictly photorealistic. No visible text on the dial, no brand logos, no illustration, no artifacts. "
            "Realistic proportions only."
        ),
    },
}


# Build rows
rows = []
for w in WATCHES:
    slug = w["slug"]
    style = STYLE_MAP[slug]
    cues = VISUAL_CUES.get(slug, "")
    refs_str = ", ".join(w["refs"])
    primary_ref = w["refs"][0] if w["refs"] else ""

    fmt = lambda t: t.format(brand=w["brand"], model=w["model"], ref=primary_ref, cues=cues)
    p1 = fmt(STYLES[style]["v1"])
    p2 = fmt(STYLES[style]["v2"])

    rows.append({
        "slug": slug,
        "brand": w["brand"],
        "model": w["model"],
        "refs": refs_str,
        "style": style,
        "v1_filename": f"{slug}-v1.jpg",
        "v1_prompt": p1,
        "v2_filename": f"{slug}-v2.jpg",
        "v2_prompt": p2,
        "pick": "",
    })

os.makedirs("data", exist_ok=True)
with open("data/prompt-sheet.json", "w", encoding="utf-8") as f:
    json.dump(rows, f, indent=2, ensure_ascii=False)

with open("data/prompt-sheet.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    writer.writeheader()
    writer.writerows(rows)

print(f"Wrote {len(rows)} rows")
print(f"  data/prompt-sheet.json  ({os.path.getsize('data/prompt-sheet.json'):,} bytes)")
print(f"  data/prompt-sheet.csv   ({os.path.getsize('data/prompt-sheet.csv'):,} bytes)")
