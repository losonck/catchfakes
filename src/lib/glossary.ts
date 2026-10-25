export interface GlossaryTerm {
  slug: string;
  term: string;
  aliases?: string[];
  definition: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "anglage",
    term: "Anglage",
    aliases: ["beveling", "chamfering"],
    definition:
      "The hand-polished bevel on the edges of movement bridges and plates. On a genuine high-grade movement the bevel reflects light as a single clean line; a counterfeit will typically show rough, matte, or inconsistent edges.",
  },
  {
    slug: "automatic",
    term: "Automatic",
    aliases: ["self-winding"],
    definition:
      "A mechanical movement wound by a rotor that swings with wrist motion. Opposite of hand-wound. All modern Rolex, most Omega, and most AP/Patek sport models are automatic.",
  },
  {
    slug: "balance-wheel",
    term: "Balance wheel",
    definition:
      "The oscillating wheel inside a mechanical movement that regulates timekeeping — the mechanical equivalent of a pendulum. It beats at a fixed frequency (e.g. 28,800 vibrations per hour on most Rolex calibres).",
  },
  {
    slug: "bezel",
    term: "Bezel",
    definition:
      "The ring around the crystal. On divers it rotates and is marked for elapsed-time tracking; on chronographs it may carry a tachymeter. Counterfeits often get bezel action wrong — too loose, too few clicks, or a misaligned pearl.",
  },
  {
    slug: "bracelet",
    term: "Bracelet",
    definition:
      "The metal strap connecting the case to itself around the wrist. Common types: Oyster (3-link, Rolex sport), Jubilee (5-link, Rolex dress), President (semi-circular links). Fit, end-link alignment, and clasp code are major authenticity checks.",
  },
  {
    slug: "calibre",
    term: "Calibre",
    aliases: ["caliber", "cal."],
    definition:
      "The reference number of a specific movement — e.g. Rolex Cal. 3135, 3235; Zenith El Primero 3600; Patek Cal. 324 S C. On a genuine watch the movement visible through a display back must match the published calibre for that reference.",
  },
  {
    slug: "caseback",
    term: "Caseback",
    definition:
      "The back of the case. Rolex sport models have solid, undecorated casebacks; many Omega and Patek models have sapphire display backs. Fakes often engrave what should be smooth, or print what should be laser-engraved.",
  },
  {
    slug: "cerachrom",
    term: "Cerachrom",
    definition:
      "Rolex's proprietary ceramic bezel insert, introduced in 2005. Platinum-filled numerals, glossy finish, scratch-resistant. A dull, slightly off-colour, or aluminium-feeling bezel on a modern Rolex sport reference is a strong red flag.",
  },
  {
    slug: "chromalight",
    term: "Chromalight",
    definition:
      "Rolex's long-lasting luminescent material. Daylight: white. Low light: a steady blue glow lasting up to eight hours. Counterfeits often use a cheaper green-emitting lume that fades within minutes.",
  },
  {
    slug: "chronograph",
    term: "Chronograph",
    definition:
      "A watch with stopwatch function, operated by pushers flanking the crown. The sub-dials typically record elapsed minutes and hours. On a genuine chronograph the pushers have a crisp, defined click; a fake often feels mushy or has no sweep smoothness on reset.",
  },
  {
    slug: "chronometer",
    term: "Chronometer",
    aliases: ["COSC"],
    definition:
      "An officially certified movement that meets COSC accuracy standards (-4/+6 seconds per day). A Rolex marked \"Superlative Chronometer\" is also internally certified to -2/+2 sec/day. The certification shows on the dial text and matching paperwork.",
  },
  {
    slug: "clasp",
    term: "Clasp",
    definition:
      "The mechanism closing the bracelet. On Rolex sport models the Oysterlock clasp often integrates a Glidelock extension system. Fake clasps commonly lack the Glidelock micro-adjustment, use thin stamped parts, or carry an incorrect bracelet code engraved inside.",
  },
  {
    slug: "cotes-de-geneve",
    term: "Côtes de Genève",
    aliases: ["Geneva stripes", "Geneva waves"],
    definition:
      "Decorative striping on movement bridges and rotors — parallel, uniform, hand-finished. On a genuine movement the stripes catch light evenly; on a fake they are shallow, uneven, or printed rather than cut.",
  },
  {
    slug: "crown",
    term: "Crown",
    definition:
      "The knob used to wind the watch and set the time. On a Rolex it unscrews before winding — the number of underline dots below the Rolex coronet indicates the water-resistance system. A crown that is loose, cross-threaded, or features the wrong logo relief is an immediate red flag.",
  },
  {
    slug: "cyclops",
    term: "Cyclops",
    aliases: ["cyclops lens", "date magnifier"],
    definition:
      "The 2.5× magnifying lens over the date window on most Rolex models. A real cyclops perfectly centres the digits inside the window; counterfeit lenses frequently magnify at only 1.5× or sit visibly off-centre.",
  },
  {
    slug: "dial",
    term: "Dial",
    definition:
      "The face of the watch. Authentication starts here: text alignment, kerning, printing crispness, applied-index height, lume plot symmetry, and \"Swiss Made\" placement. Even cheap fakes get the broad shapes right — the giveaway is nearly always close-up detail.",
  },
  {
    slug: "end-links",
    term: "End-links",
    aliases: ["end-link"],
    definition:
      "The curved pieces of the bracelet that bridge from the case to the first link. On a genuine piece they sit flush against the case flanks with no visible gap; a fake end-link often has daylight showing between it and the case or rattles when flexed.",
  },
  {
    slug: "escapement",
    term: "Escapement",
    definition:
      "The mechanism that releases the mainspring's energy in regulated steps to the balance wheel. Standard Swiss lever escapement is nearly universal; co-axial (Omega) and Chronergy (Rolex) are proprietary refinements visible on genuine movements.",
  },
  {
    slug: "flyback",
    term: "Flyback",
    definition:
      "A chronograph complication that lets you reset and restart the chronograph in one push, without stopping first. Only certain references (e.g. Breguet Type XX, some Zenith El Primero) have it; a seller claiming flyback on a model that never offered it is a hard red flag.",
  },
  {
    slug: "glidelock",
    term: "Glidelock",
    definition:
      "Rolex's tool-free bracelet micro-adjustment system in the Oysterlock clasp, giving ~20 mm of extension in 2 mm steps. Introduced on the Deepsea and spread across Submariner/Sea-Dweller families. If a modern Submariner clasp lacks it, the piece is almost certainly a fake.",
  },
  {
    slug: "gmt",
    term: "GMT hand",
    definition:
      "A 24-hour fourth hand pointing at a 24-hour bezel or dial scale, used to track a second time zone. On a Rolex GMT-Master II the GMT hand is independently settable; a counterfeit often has a GMT hand hard-linked to the hour hand so it drifts wrong.",
  },
  {
    slug: "hairspring",
    term: "Hairspring",
    aliases: ["balance spring"],
    definition:
      "The fine coiled spring that returns the balance wheel to centre on each oscillation. High-end movements use anti-magnetic alloys (Rolex Parachrom blue, Omega Si14 silicon). Rust spots or a visible kink are catastrophic faults.",
  },
  {
    slug: "lugs",
    term: "Lugs",
    definition:
      "The four protrusions on the case that hold the bracelet or strap. Lug profile, drilling, finishing, and the chamfer between brushed and polished surfaces are brand-specific — a fake often blurs the transition or over-polishes the brushed sides.",
  },
  {
    slug: "lume",
    term: "Lume",
    aliases: ["luminescent paint", "SuperLumiNova", "Super-LumiNova"],
    definition:
      "The glow-in-the-dark material on hands and indices. Reputable brands use Chromalight (Rolex), Super-LumiNova (most Swiss), or in-house X1 grades. Even application, correct emission colour, and consistent brightness across the dial are all checks.",
  },
  {
    slug: "master-chronometer",
    term: "Master Chronometer",
    aliases: ["METAS"],
    definition:
      "Omega's certification standard, run with METAS. In addition to COSC accuracy, it certifies resistance to 15,000 gauss magnetic fields. The dial carries the \"Master Chronometer\" line and the papers include a QR-linked certificate.",
  },
  {
    slug: "movement",
    term: "Movement",
    definition:
      "The engine of the watch — the mechanism inside the case. Visible through display backs on many models. Movement photography is the single most useful authentication asset: compare rotor engraving, bridge finishing, screw type, and calibre number to published references.",
  },
  {
    slug: "oyster-perpetual",
    term: "Oyster Perpetual",
    definition:
      "Rolex's self-winding, water-resistant case architecture, dating to the 1920s/1930s. Nearly every modern Rolex is an \"Oyster Perpetual\" — the words appear on most dials. A watch calling itself Rolex but missing or misspelling this line is counterfeit.",
  },
  {
    slug: "perlage",
    term: "Perlage",
    definition:
      "Overlapping circular grinding marks applied to hidden movement surfaces (mainplate, bridges under rotors). Appears as a field of pearl-like dots. On a genuine high-end movement perlage is uniform and symmetrical; a fake usually shows a flat ground finish instead.",
  },
  {
    slug: "power-reserve",
    term: "Power reserve",
    definition:
      "How long a fully wound movement runs before stopping — typically 48–80 hours for modern Swiss calibres. Some watches show it on a dial indicator. A fake wearing a power-reserve dial often has a decorative, non-functional indicator.",
  },
  {
    slug: "pusher",
    term: "Pusher",
    definition:
      "A button on the case (usually flanking the crown) that operates a chronograph or quick-set function. On genuine pieces pushers feel crisp with defined travel; counterfeits often use softer rubber springs that reset mushily.",
  },
  {
    slug: "rehaut",
    term: "Rehaut",
    definition:
      "The angled inner ring between the dial and the crystal. Since ~2005 Rolex engraves \"ROLEX\" repeatedly on the rehaut together with the case serial. The engraving is crisp, centred, and metallic — counterfeits often use shallow printing or offset text.",
  },
  {
    slug: "rotor",
    term: "Rotor",
    definition:
      "The semi-circular weight visible through a display back that winds an automatic movement. Rolex rotors are engraved with the Rolex crown; AP, Patek, and Lange rotors are often skeletonised or gold. A visibly mass-produced plain rotor on a claimed high-end calibre is a tell.",
  },
  {
    slug: "sapphire-crystal",
    term: "Sapphire crystal",
    definition:
      "Synthetic sapphire glass covering the dial. Scratch-resistant to Mohs 9. Fakes often substitute mineral or acrylic — a drop of water beads differently on sapphire, and tapping with a fingernail gives a higher, harder tone than acrylic.",
  },
  {
    slug: "swiss-made",
    term: "Swiss Made",
    definition:
      "The regulated marking printed at 6 o'clock on most Swiss dials. Required ≥60 % Swiss production costs and movement assembly in Switzerland. Font, placement, and spacing are brand-standard — any variance is a reliable fake indicator.",
  },
  {
    slug: "tachymeter",
    term: "Tachymeter",
    definition:
      "A chronograph bezel scale that converts elapsed seconds into average speed. Starts at ~500 near 12 o'clock and tightens anti-clockwise. On genuine Rolex Daytona and Omega Speedmaster models the scale printing is pin-sharp and perfectly indexed with the chronograph seconds hand.",
  },
];
