import type { DecomposeResponse } from "./schema";
import { denudedQuery, normalizeQuery } from "./normalize";

type C = DecomposeResponse["components"][number];

function c(
  name: string,
  description: string,
  type: C["type"],
  iconHint: C["iconHint"] = "box",
  rarity: C["rarity"] = "common",
  isTerminal = false,
): C {
  return { name, description, type, iconHint, rarity, isTerminal };
}

const KB: Record<string, DecomposeResponse> = {
  pencil: {
    normalizedName: "Pencil",
    summary: "A cedar-wood writing tool built around a graphite-clay core.",
    components: [
      c("Graphite Core", "Baked graphite-and-clay rod that leaves marks on paper.", "assembly", "raw", "common"),
      c("Cedar Wood Casing", "Two soft cedar slats glued around the core, shaped hexagonal.", "assembly", "wood"),
      c("Ferrule", "Crimped aluminum band gripping wood and eraser.", "component", "metal"),
      c("Eraser", "Pumice-filled rubber plug that lifts graphite off paper.", "component", "raw"),
      c("Lacquer Coating", "Thin colored paint sealing the wood against moisture.", "material", "liquid"),
      c("Glue Bond", "Adhesive seam fusing the two wood slats together.", "material", "liquid", "common", true),
    ],
    materials: ["cedar wood", "graphite", "aluminum"],
    funFact: "The graphite in a pencil is ~300 million years old — older than dinosaurs.",
    originHint: "Cedar from managed forests; graphite mined as metamorphic rock.",
  },
  "graphite core": {
    normalizedName: "Graphite Core",
    summary: "Baked rod of graphite powder and clay that writes.",
    components: [
      c("Graphite Powder", "Ground crystalline carbon, the actual marking material.", "material", "raw"),
      c("Clay Binder", "Kaolin clay setting the hardness grade (HB, 2B...).", "material", "raw"),
      c("Fired Ceramic Matrix", "Kiln-fused network locking graphite and clay together.", "material", "raw", "common", true),
      c("Wax Impregnation", "Wax soaked in after firing for smooth writing.", "material", "liquid", "common", true),
      c("Carbon (Element C)", "Pure carbon atoms in layered hexagonal sheets.", "element", "gem", "uncommon", true),
    ],
    materials: ["graphite", "kaolin clay", "wax"],
    funFact: "Pencil grades exist because more clay = harder, paler line.",
    originHint: "Graphite mined in China, Mozambique and Brazil; clay from weathered granite.",
  },
  pen: {
    normalizedName: "Ballpoint Pen",
    summary: "A pocket reservoir that meters oil-based ink through a rolling ball.",
    components: [
      c("Ballpoint Tip", "Brass housing holding a tiny tungsten-carbide ball.", "assembly", "metal"),
      c("Ink Reservoir", "Polypropylene tube holding viscous oil-based ink.", "assembly", "tube"),
      c("Barrel", "Molded plastic or metal body you grip.", "component", "housing"),
      c("Click Mechanism", "Spring, cam and plunger advancing the tip.", "assembly", "gear"),
      c("Grip Section", "Textured cone guiding fingers near the tip.", "component", "plastic"),
      c("Pocket Clip", "Spring-steel clip holding the pen in place.", "component", "metal", "common", true),
    ],
    materials: ["polypropylene", "brass", "steel"],
    funFact: "The ball in a pen tip is ~1mm wide and rolls ~2km of line per pen.",
    originHint: "Brass from copper+zinc mines; ink pigments from petrochemical plants.",
  },
  "paper shredder": {
    normalizedName: "Paper Shredder",
    summary: "A motor-driven machine that slices paper into unreadable strips.",
    components: [
      c("Electric Motor", "Small AC motor converting wall power into rotation.", "assembly", "motor"),
      c("Cutting Mechanism", "Interlocking steel blades that shear paper ribbons.", "assembly", "blade"),
      c("Gear Train", "Nylon and steel gears trading speed for cutting torque.", "assembly", "gear"),
      c("Housing", "ABS plastic shell damping noise and guarding blades.", "component", "housing"),
      c("Paper Feed", "Throat, guides and jam sensor lining sheets up.", "assembly", "box"),
      c("Control Electronics", "Circuit board, switches and overload protection.", "assembly", "circuit"),
    ],
    materials: ["ABS plastic", "steel", "copper"],
    funFact: "Strip-cut blades spin paper through gaps narrower than a credit card edge.",
    originHint: "Steel blades from iron ore; copper windings from Chilean mines.",
  },
  "electric motor": {
    normalizedName: "Electric Motor",
    summary: "Converts electrical energy into mechanical rotation via magnetism.",
    components: [
      c("Rotor", "Spinning steel shaft assembly carrying the magnetic field.", "assembly", "motor"),
      c("Stator", "Fixed laminated core whose coils push the rotor around.", "assembly", "coil"),
      c("Copper Windings", "Enameled copper coils generating the magnetic field.", "assembly", "wire"),
      c("Bearings", "Sealed ball bearings letting the shaft spin freely.", "component", "metal"),
      c("Drive Shaft", "Hardened steel rod delivering torque to the gears.", "component", "metal"),
      c("Motor Housing", "Cast shell aligning parts and shedding heat.", "component", "housing"),
    ],
    materials: ["copper", "silicon steel", "aluminum"],
    funFact: "A shredder motor's windings can hold over 100 meters of hair-thin copper wire.",
    originHint: "Copper from chalcopyrite ore; silicon steel from iron + silicon.",
  },
  "copper windings": {
    normalizedName: "Copper Windings",
    summary: "Coiled enameled wire that creates the motor's magnetic field.",
    components: [
      c("Enameled Copper Wire", "Thin copper conductor with insulating enamel coat.", "material", "wire"),
      c("Insulation Varnish", "Heat-cured resin preventing shorts between turns.", "material", "liquid", "common", true),
      c("Bobbin", "Plastic former holding coils off the steel core.", "component", "plastic", "common", true),
      c("Lead Wires", "Stranded hookup wires to the motor terminals.", "component", "wire", "common", true),
      c("Copper (Element Cu)", "Pure copper refined from ore, drawn into wire.", "element", "raw", "uncommon", true),
    ],
    materials: ["copper", "polyester-imide enamel"],
    funFact: "Enamel insulation on magnet wire is thinner than a human hair.",
    originHint: "Copper comes from chalcopyrite ore mined in Chile and Peru.",
  },
  smartphone: {
    normalizedName: "Smartphone",
    summary: "A glass-and-aluminum computer with radios, cameras and a big battery.",
    components: [
      c("Display Assembly", "OLED panel, touch sensor and cover glass fused together.", "assembly", "glass"),
      c("Battery", "Lithium-ion pouch cell storing the phone's energy.", "assembly", "power"),
      c("Logic Board", "Multilayer PCB carrying processor, memory and radios.", "assembly", "circuit"),
      c("Camera Modules", "Lenses, sensors and stabilizers for photo and video.", "assembly", "sensor"),
      c("Aluminum Frame", "Machined chassis holding everything rigid.", "component", "metal"),
      c("Antenna Bands", "Tuned metal strips for cellular, Wi-Fi and GPS.", "component", "wire", "uncommon"),
      c("Haptics & Speakers", "Vibration motor, mics and speaker boxes.", "assembly", "motor", "common"),
    ],
    materials: ["glass", "aluminum", "lithium"],
    funFact: "Your phone contains rare-earth magnets — and gold worth ~50mg.",
    originHint: "Lithium from Andean salt flats; rare earths mostly from Bayan Obo, China.",
  },
  battery: {
    normalizedName: "Lithium-Ion Battery",
    summary: "Rechargeable cell shuttling lithium ions between graphite and metal oxide.",
    components: [
      c("Cathode", "Lithium metal-oxide coating on aluminum foil.", "assembly", "raw"),
      c("Anode", "Graphite coating on copper foil.", "assembly", "raw"),
      c("Separator", "Microporous film keeping electrodes apart.", "component", "plastic"),
      c("Electrolyte", "Lithium-salt solvent carrying ions.", "material", "liquid"),
      c("Pouch / Can", "Sealed aluminum-laminate enclosure.", "component", "metal"),
      c("Protection Circuit", "Tiny board preventing overcharge and shorts.", "assembly", "circuit"),
    ],
    materials: ["lithium", "graphite", "aluminum"],
    funFact: "About a third of a phone battery's weight is just its metal casing and foils.",
    originHint: "Lithium from brine in Chile/Argentina; cobalt from the DR Congo.",
  },
  lithium: {
    normalizedName: "Lithium",
    summary: "The lightest metal — lives to shuttle charge back and forth.",
    components: [
      c("Lithium Brine", "Salty groundwater pumped from desert salt flats.", "material", "liquid"),
      c("Lithium Carbonate", "Refined white powder, the traded commodity.", "material", "raw"),
      c("Spodumene Ore", "Hard-rock lithium mineral from pegmatite mines.", "material", "raw", "uncommon"),
      c("Lithium (Element Li)", "Alkali metal, atomic number 3.", "element", "gem", "rare", true),
      c("Evaporation Ponds", "Vast shallow basins concentrating brine in the sun.", "component", "box", "uncommon", true),
    ],
    materials: ["lithium carbonate"],
    funFact: "It takes ~500,000 liters of brine to make one ton of lithium.",
    originHint: "Salar de Atacama, Chile — evaporated under the world's driest desert sun.",
  },
  motorcycle: {
    normalizedName: "Motorcycle",
    summary: "A two-wheeled machine built around a stressed engine and steel frame.",
    components: [
      c("Engine", "Air- or liquid-cooled block turning fuel into torque.", "assembly", "motor"),
      c("Frame", "Steel or aluminum skeleton tying wheels to engine.", "component", "metal"),
      c("Transmission", "Gearbox and chain or belt driving the rear wheel.", "assembly", "gear"),
      c("Suspension", "Forks and shock taming bumps at both wheels.", "assembly", "tube"),
      c("Braking System", "Discs, calipers and ABS hydraulics.", "assembly", "metal"),
      c("Wheels & Tires", "Alloy rims with grippy rubber compounds.", "assembly", "box"),
      c("Fuel System", "Tank, pump and injectors feeding the engine.", "assembly", "liquid"),
    ],
    materials: ["steel", "aluminum", "rubber"],
    funFact: "A sportbike engine can rev past 15,000 rpm — 250 explosions per second.",
    originHint: "Steel from iron ore; rubber from Hevea trees and synthetic oil.",
  },
  tank: {
    normalizedName: "Battle Tank",
    summary: "An armored gun platform riding on tracks, built around crew survival.",
    components: [
      c("Main Cannon", "120mm smoothbore gun with thermal sleeve.", "assembly", "tube"),
      c("Composite Armor", "Layered steel, ceramic and depleted-uranium sandwich.", "assembly", "metal"),
      c("Diesel Engine", "1,500-hp multifuel turbine or diesel block.", "assembly", "motor"),
      c("Track System", "Steel links, road wheels and drive sprockets.", "assembly", "gear"),
      c("Turret & Autoloader", "Rotating weapon station with loading mechanism.", "assembly", "housing"),
      c("Fire Control", "Thermal sights, laser rangefinder, ballistic computer.", "assembly", "sensor", "rare"),
      c("Suspension", "Torsion bars or hydropneumatic units per wheel.", "assembly", "metal"),
    ],
    materials: ["rolled steel", "ceramic", "rubber"],
    funFact: "A tank track link alone can weigh more than a motorcycle.",
    originHint: "Armor steel from iron ore; optics glass from high-purity quartz.",
  },
  engine: {
    normalizedName: "Combustion Engine",
    summary: "Burns fuel in cylinders to drive pistons and a crankshaft.",
    components: [
      c("Piston Set", "Aluminum pistons sliding inside honed cylinders.", "assembly", "metal"),
      c("Cylinder Block", "Cast-iron or aluminum crankcase with bores.", "component", "housing"),
      c("Crankshaft", "Forged steel shaft turning piston strokes into spin.", "component", "metal"),
      c("Cylinder Head", "Valves, camshafts and spark or injection gear.", "assembly", "gear"),
      c("Fuel Injection", "High-pressure injectors metering each charge.", "assembly", "liquid"),
      c("Cooling System", "Pump, radiator and coolant jacket.", "assembly", "tube"),
    ],
    materials: ["aluminum", "cast iron", "steel"],
    funFact: "Engine oil sees temperatures swing from -30°C to over 300°C.",
    originHint: "Aluminum from bauxite; iron from hematite ore.",
  },
  piston: {
    normalizedName: "Piston",
    summary: "Aluminum plug converting exploding fuel into downward shove.",
    components: [
      c("Piston Crown", "Heat-shielded top face taking the blast.", "component", "metal"),
      c("Compression Rings", "Spring-steel rings sealing combustion pressure.", "component", "metal"),
      c("Oil Ring", "Scraper ring metering cylinder-wall oil.", "component", "metal", "common", true),
      c("Wrist Pin", "Hardened steel pin linking piston to rod.", "component", "metal", "common", true),
      c("Aluminum Alloy", "Silicon-rich alloy balancing strength and lightness.", "material", "metal"),
      c("Silicon (Element Si)", "Alloying element from quartz.", "element", "gem", "uncommon", true),
    ],
    materials: ["aluminum", "silicon", "steel"],
    funFact: "A piston at redline changes direction ~250 times every second.",
    originHint: "Aluminum smelted from bauxite mined in Australia and Guinea.",
  },
  airplane: {
    normalizedName: "Airliner",
    summary: "An aluminum tube with wings, optimized to sip fuel at 35,000 feet.",
    components: [
      c("Fuselage", "Pressurized aluminum-alloy tube with frames and skin.", "assembly", "housing"),
      c("Wings", "Spar-and-rib structures holding fuel and flexing in gusts.", "assembly", "metal"),
      c("Jet Engines", "Turbofans turning kerosene into quiet thrust.", "assembly", "motor"),
      c("Avionics", "Fly-by-wire computers, radar and radios.", "assembly", "circuit", "rare"),
      c("Landing Gear", "Oleo struts, brakes and retraction hydraulics.", "assembly", "gear"),
      c("Tail Assembly", "Stabilizers and rudder trimming the jet in flight.", "assembly", "metal"),
      c("Cabin Systems", "Seats, galleys, air conditioning and oxygen.", "assembly", "fabric"),
    ],
    materials: ["aluminum", "titanium", "composites"],
    funFact: "A 787 is ~50% carbon composite — its wings flex over 7 meters.",
    originHint: "Aerospace aluminum from bauxite; titanium from rutile sands.",
  },
  "coffee machine": {
    normalizedName: "Espresso Machine",
    summary: "A precise hot-water pump forcing 9 bars through ground coffee.",
    components: [
      c("Boiler", "Brass or steel vessel holding water at ~93°C.", "assembly", "metal"),
      c("Vibration Pump", "Electromagnetic pump building 9 bars of pressure.", "assembly", "motor"),
      c("Group Head", "Brass brew head locking the portafilter in.", "assembly", "metal"),
      c("Portafilter", "Handled basket dosing ~18g of grounds.", "component", "metal"),
      c("Grinder Burrs", "Hardened steel burrs crushing beans evenly.", "assembly", "blade", "uncommon"),
      c("Control Board", "PID controller, sensors and safety thermostat.", "assembly", "circuit"),
    ],
    materials: ["brass", "stainless steel", "copper"],
    funFact: "Espresso water touches coffee for only ~25 seconds — grind size does the rest.",
    originHint: "Brass from copper+zinc; burrs from high-carbon tool steel.",
  },
  keyboard: {
    normalizedName: "Mechanical Keyboard",
    summary: "An array of spring switches reporting keypresses to a controller.",
    components: [
      c("Key Switches", "Spring-and-contact mechanisms under each key.", "assembly", "sensor"),
      c("Keycaps", "ABS or PBT caps with printed legends.", "component", "plastic"),
      c("PCB", "Circuit board scanning the key matrix.", "assembly", "circuit"),
      c("Case", "Aluminum or plastic shell setting the typing feel.", "component", "housing"),
      c("Stabilizers", "Wire balancers under wide keys like spacebar.", "component", "wire"),
      c("Controller", "Microcontroller speaking USB to the computer.", "component", "circuit"),
    ],
    materials: ["ABS plastic", "copper", "steel"],
    funFact: "A keyboard switch is rated for ~50–100 million presses — decades of typing.",
    originHint: "Keycap plastic from crude oil; PCB copper from sulfide ores.",
  },
  copper: {
    normalizedName: "Copper",
    summary: "Humanity's first worked metal — still the king of wires.",
    components: [
      c("Chalcopyrite Ore", "Brassy sulfide rock holding ~0.6% copper.", "material", "raw"),
      c("Open-Pit Mine", "Terraced excavation where ore is blasted and hauled.", "component", "box", "uncommon", true),
      c("Smelted Anodes", "98%-pure slabs cast after furnace smelting.", "material", "metal"),
      c("Refined Cathodes", "99.99% pure sheets after electrorefining.", "material", "metal"),
      c("Copper (Element Cu)", "Atomic number 29, forged in ancient supernovas.", "element", "gem", "rare", true),
    ],
    materials: ["chalcopyrite", "copper"],
    funFact: "Copper is 100% recyclable — two-thirds of all copper ever mined is still in use.",
    originHint: "Escondida, Chile — the largest copper mine on Earth.",
  },
  carbon: {
    normalizedName: "Carbon",
    summary: "The backbone of life — and of pencils, steel and diamonds.",
    components: [
      c("Graphite Deposit", "Metamorphosed ancient seabeds rich in carbon.", "material", "raw"),
      c("Carbon Atoms", "Six-proton atoms bonding into sheets and lattices.", "element", "gem", "rare", true),
      c("Stellar Furnace", "Dying stars fusing helium into carbon 5B years ago.", "component", "raw", "rare", true),
      c("Diamond Cousin", "Same atoms, tetrahedral lattice — hardest natural material.", "material", "gem", "rare", true),
      c("CO₂ Cycle", "Carbon constantly traded between air, sea and life.", "material", "liquid", "common", true),
    ],
    materials: ["carbon"],
    funFact: "You started with breakfast. You ended in a star — carbon was forged in one.",
    originHint: "Every carbon atom is older than the Earth itself.",
  },
  croissant: {
    normalizedName: "Croissant",
    summary: "Laminated dough: thin layers of yeasted dough interleaved with butter.",
    components: [
      c("Dough Layers", "Dozens of flour-water-yeast sheets folded around butter.", "assembly", "raw"),
      c("Butter Block", "Cold cultured butter rolled between the dough turns.", "material", "raw"),
      c("Yeast Culture", "Live yeast breathing air into the crumb.", "material", "raw", "uncommon"),
      c("Egg Wash", "Beaten egg brushed on for the glossy brown crust.", "material", "liquid", "common", true),
      c("Flour Base", "Wheat flour giving the gluten network.", "material", "raw"),
      c("Caramelized Crust", "Sugars browned in the oven's heat.", "material", "raw", "common", true),
    ],
    materials: ["flour", "butter", "yeast"],
    funFact: "A classic croissant has 81 layers — three folds of three, three times.",
    originHint: "Wheat from temperate plains; butter from dairy herds.",
  },
  "pastel de nata": {
    normalizedName: "Pastel de Nata",
    summary: "Crisp puff-pastry cup holding wobbling egg custard, scorched on top.",
    components: [
      c("Puff Pastry Shell", "Flaky laminated crust baked crisp in a hot tin.", "assembly", "raw"),
      c("Custard Filling", "Egg yolk, sugar, cream and milk set to a wobble.", "assembly", "liquid"),
      c("Egg Yolk Mix", "Yolks giving the rich yellow color and set.", "material", "raw"),
      c("Caramelized Top", "Sugar scorched nearly black under fierce heat.", "material", "raw", "uncommon"),
      c("Cinnamon Dust", "Bark spice shaken over before serving.", "material", "raw", "common", true),
      c("Lemon Zest", "Citrus peel perfuming the custard.", "material", "raw", "common", true),
    ],
    materials: ["egg", "flour", "sugar"],
    funFact: "Baked since 1837 by monks — the original Belém recipe is still secret.",
    originHint: "Eggs from poultry farms; sugar cane from tropical harvests; cinnamon from Sri Lanka.",
  },
  display: {
    normalizedName: "Phone Display",
    summary: "A fused stack of glass, touch sensor and millions of OLED pixels.",
    components: [
      c("Cover Glass", "Ion-strengthened glass shrugging off keys and drops.", "material", "glass"),
      c("OLED Panel", "Millions of self-lit red-green-blue pixels.", "assembly", "glass", "uncommon"),
      c("Touch Sensor", "Transparent electrode grid sensing your finger.", "component", "circuit"),
      c("Polarizer Films", "Layered films boosting contrast and killing glare.", "material", "plastic", "common", true),
      c("Display Driver", "Chip painting 120 frames per second.", "component", "circuit"),
    ],
    materials: ["glass", "indium", "plastic"],
    funFact: "Cover glass gets its strength from potassium ions stuffed into its surface.",
    originHint: "Display glass from high-purity quartz sand; indium is a zinc-mining byproduct.",
  },
  "rotor": rotorNode(),
  stator: statorNode(),
};

function rotorNode(): DecomposeResponse {
  return {
    normalizedName: "Rotor",
    summary: "The spinning heart of the motor, dragged around by magnetism.",
    components: [
      c("Rotor Core", "Stacked steel laminations channeling magnetic flux.", "component", "metal"),
      c("Squirrel Cage", "Aluminum or copper bars shorted by end rings.", "component", "metal", "uncommon"),
      c("Shaft", "Ground steel rod carrying torque to the load.", "component", "metal"),
      c("End Rings", "Shorting rings completing the cage circuit.", "component", "metal", "common", true),
      c("Balance Weights", "Tiny masses trimming vibration at speed.", "component", "metal", "common", true),
      c("Iron (Element Fe)", "Ferromagnetic iron from hematite ore.", "element", "raw", "uncommon", true),
    ],
    materials: ["silicon steel", "aluminum"],
    funFact: "A rotor can spin at 20,000 rpm — rim speed near the speed of sound.",
    originHint: "Electrical steel from iron ore plus a whisper of silicon.",
  };
}

function statorNode(): DecomposeResponse {
  return {
    normalizedName: "Stator",
    summary: "The still ring of coils whose pulsing field chases the rotor.",
    components: [
      c("Lamination Stack", "Insulated steel sheets strangling eddy currents.", "component", "metal"),
      c("Stator Coils", "Copper windings wired into magnetic poles.", "assembly", "wire"),
      c("Slot Insulation", "Heat-proof paper lining each winding slot.", "material", "fabric", "common", true),
      c("End Windings", "Copper crowns looping beyond the core.", "component", "wire", "common", true),
      c("Frame Fit", "Pressed housing sinking coil heat away.", "component", "housing", "common", true),
    ],
    materials: ["silicon steel", "copper"],
    funFact: "Laminating the core into sheets cuts wasted eddy-current heat by ~90%.",
    originHint: "Steel from iron ore; copper from Chilean sulfide mines.",
  };
}

/** Strip accumulated generic suffixes ("X Core" → "X") so repeated dives
 *  through fallback layers converge instead of growing names forever
 *  ("Logic Board Core Core Core"). Runs to a fixed point, capped. */
function stripGenericSuffixes(name: string): string {
  let out = name;
  for (let i = 0; i < 3; i++) {
    const next = out.replace(
      /\s+(Core|Housing|Assembly|Unit|Module|Shell|Casing|Cover|Body|Frame|Set|Element)$/i,
      "",
    ).trim();
    if (next === out || !next) break;
    out = next;
  }
  return out || name;
}

/** Words that carry no domain meaning on their own. When a tapped target is
 *  made of nothing but these (e.g. diving into our own "Small Parts"),
 *  there is no substance to compose children from. */
const FILLER_WORDS = new Set([
  "core", "shell", "housing", "assembly", "unit", "module", "cover", "body",
  "frame", "set", "element", "elements", "material", "materials", "parts",
  "mix", "bits", "stock", "base", "small", "control", "connector", "fastener",
  "surface", "finish", "structure", "holding", "inner", "outer",
]);

/** The substantive words of a name. Empty when the name is pure filler —
 *  callers then fall back to the thread root so layers go sideways
 *  instead of spiraling into "Small Parts Shell". */
function substantive(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => w && !FILLER_WORDS.has(w.toLowerCase()))
    .join(" ");
}

function title(s: string): string {
  return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

/** Alias map → canonical KB key */
const ALIASES: Record<string, string> = {
  iphone: "smartphone",
  phone: "smartphone",
  "mobile phone": "smartphone",
  "cell phone": "smartphone",
  cellphone: "smartphone",
  "paper shredder": "paper shredder",
  shredder: "paper shredder",
  "coffee maker": "coffee machine",
  espresso: "coffee machine",
  "mech keyboard": "keyboard",
  plane: "airplane",
  aeroplane: "airplane",
  jet: "airplane",
  airliner: "airplane",
  bike: "motorcycle",
  motorbike: "motorcycle",
  "main battle tank": "tank",
  "li-ion": "battery",
  "lithium battery": "battery",
  "aa battery": "battery",
  screen: "display",
  "oled": "display",
  croissants: "croissant",
  "pasteis de nata": "pastel de nata",
  "pastéis de nata": "pastel de nata",
  "pastel de belem": "pastel de nata",
  "pastel de belém": "pastel de nata",
  "pastéis de belém": "pastel de nata",
  "custard tart": "pastel de nata",
  "graphite": "graphite core",
  "pencil lead": "graphite core",
  "windings": "copper windings",
  "winding": "copper windings",
  "copper wire": "copper windings",
  "ev motor": "electric motor",
  motor: "electric motor",
  "combustion engine": "engine",
  "diesel engine": "engine",
  "v8": "engine",
};

export function lookupFallback(target: string): DecomposeResponse | null {
  const n = normalizeQuery(target);
  if (!n) return null;
  const key = ALIASES[n] ?? n;
  return KB[key] ?? null;
}

/** Generative fallback so ANY input decomposes plausibly, forever. */
export function generateFallback(target: string, ancestry: string[], depth: number): DecomposeResponse {
  const norm = normalizeQuery(target) || target.toLowerCase().trim();
  // Never compose display names from raw markup — denude first.
  const safe = denudedQuery(target) || "unknown object";
  const name = title(safe).slice(0, 48) || "Unknown Object";
  const root = ancestry[0] ? title(ancestry[0]) : name;
  const lower = norm.toLowerCase();

  // Element-ish → provenance chain
  if (/(element|atom|carbon|copper|iron|lithium|silicon|gold|aluminum|aluminium|quartz|uranium|cobalt|nickel|neodymium)/.test(lower) || depth >= 5) {
    const selfEl = name.toLowerCase();
    const elComponents = [
        c("Raw Source", `Mine, well, forest or farm where ${name} begins.`, "assembly", "raw", "uncommon"),
        c("Refined Stock", `Cleaned, milled or refined ${name}.`, "material", "metal"),
        c("Finished Material", `${name} ready for manufacturing.`, "material", "raw", "common", true),
        c("Deep Time Story", `${name} carries atoms older than the Earth itself.`, "element", "gem", "rare", true),
        c("Source Region", `The part of the world where ${name} is found.`, "material", "raw", "common", true),
    ].filter((child) => child.name.toLowerCase() !== selfEl);
    return {
      normalizedName: name,
      summary: `Tracing ${name} back to where it comes from.`,
      components: elComponents,
      materials: [lower.split(" ")[0] || "raw stock"],
      funFact: `Two-thirds of many metals ever mined are still in use today.`,
      originHint: `${name} ultimately traces to mines, wells, forests — and ancient stars.`,
    };
  }

  // Material-ish at depth 3+
  if (depth >= 3 && /(steel|plastic|glass|rubber|wood|ceramic|fabric|foam|paint|oil|fuel|ink|paper)/.test(lower)) {
    const base = name.replace(/s$/, "");
    return {
      normalizedName: name,
      summary: `${name} inside ${root} — down to its raw ingredients.`,
      components: [
        c(`${base} Stock`, `Bulk ${lower} shaped for this part.`, "material", "raw"),
        c("Additives", `Fillers and stabilizers tuning ${lower}.`, "material", "liquid", "common", true),
        c("Raw Feedstock", `Ore, crude or harvest behind ${lower}.`, "material", "raw"),
        c("Processing Aid", `Heat, pressure or chemistry forming it.`, "component", "box", "common", true),
        c("Base Element", `The atoms ${lower} is built from.`, "element", "gem", "rare", true),
      ],
      materials: [lower],
      funFact: `Follow any material far enough and you reach a mine, a well, or a forest.`,
      originHint: `${name} traces back to raw feedstock — ore, oil, sand or timber.`,
    };
  }

  // Deep fallback must CONVERGE, never recurse: at depth 3+ return a
  // terminal material/element set built from the suffix-stripped base noun,
  // so threads bottom out even when live AI stays down.
  if (depth >= 3) {
    const stripped = stripGenericSuffixes(name);
    // Filler target (e.g. our own "Small Parts"): borrow the root's substance.
    const base = substantive(stripped) || title(root);
    const bl = base.toLowerCase();
    // Never stack "Stock" onto something already called stock.
    const stockName = /stocks?$/i.test(base) ? base : `${base} Stock`;
    // Never offer the tapped thing back as its own child (stable loop).
    const self = name.toLowerCase();
    const components = [
        c(stockName, `Bulk ${bl} shaped for this part.`, "material", "raw"),
        c("Raw Feedstock", `Ore, crop or harvest behind ${bl}.`, "material", "raw"),
        c("Processing Aid", `Heat, pressure or chemistry forming it.`, "component", "box", "common", true),
        c("Base Element", `The atoms ${bl} is built from.`, "element", "gem", "rare", true),
        c("Source Region", `The part of the world its raw stuff comes from.`, "material", "raw", "common", true),
    ].filter((child) => child.name.toLowerCase() !== self);
    return {
      normalizedName: name,
      summary: `${base} inside ${root} — down to its raw ingredients.`,
      components,
      materials: [bl.split(" ")[0] || "raw stock"],
      funFact: `Follow any material far enough and you reach a mine, a well, or a forest.`,
      originHint: `${base} traces back to raw feedstock — ore, oil, sand or timber.`,
    };
  }

  // Generic physical breakdown — domain-neutral on purpose. This branch serves
  // ANYTHING (gadgets, pastries, plants), so children must read sensibly for
  // all of them: no screws, no sensors, no steel. Never state materials we
  // don't know — omit rather than lie.
  const strippedBase = stripGenericSuffixes(name);
  // Filler target (e.g. our own "Small Parts"): borrow the root's substance
  // so the layer goes sideways instead of inventing "Small Parts Shell".
  const base = substantive(strippedBase) || title(root);
  const blower = base.toLowerCase();
  // Never offer the tapped thing back as its own child (stable loop).
  const selfName = name.toLowerCase();
  const genericComponents = [
      c(`${base} Shell`, `Outer layer holding the inside of ${blower} together.`, "component", "housing"),
      c(`${base} Core`, `The heart of it — most of what ${blower} is.`, "assembly", "box"),
      c("Holding Structure", `Whatever keeps ${blower} in one piece.`, "component", "box"),
      c("Surface Finish", `The outside of ${blower} you see and touch.`, "component", "raw"),
      c("Small Parts", `Bits inside ${blower} too small to name one by one.`, "component", "raw", "common", true),
      c("Base Elements", `The atoms everything in ${blower} is built from.`, "element", "gem", "rare", true),
  ].filter((child) => child.name.toLowerCase() !== selfName);
  return {
    normalizedName: name,
    summary: `${name} in ${root} — its meaningful physical parts.`,
    components: genericComponents,
    materials: [],
    funFact: `Break ${blower} down far enough and you always reach raw ingredients.`,
    originHint: `Farms, mines, wells and forests — everything starts in one of those.`,
  };
}
