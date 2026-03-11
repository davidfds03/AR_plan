/**************************************************
 * PLANPRO REAL PRICE COMPARISON ENGINE
 * Single-file | Rule-based | RF/XG ready
 **************************************************/

const fs = require("fs");
const path = require("path");
const readline = require("readline");

/* ================= BASIC HELPERS ================= */

function exists(v) {
  return v !== undefined && v !== null && v !== "";
}

function loadJSON(file) {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, file), "utf-8")
  );
}

/* ================= NORMALIZATION ================= */

function normalizeType(type, site) {
  if (!exists(type)) return null;
  const t = type.toLowerCase();
  if (site === "Flipkart" && t.includes("desk")) return "table";
  return t;
}

function normalizeText(str) {
  return str
    .toLowerCase()
    .replace(/[_\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ================= SUBTYPE INTENT MAP ================= */

const SUBTYPE_INTENT_MAP = {
  "study table": ["study table", "study desk", "computer desk"],
  "dining table": ["dining table"],
  "coffee table": ["coffee table", "tea table"],
  "gaming chair": ["gaming chair"],
  "office chair": ["office chair"],
  "dining chair": ["dining chair"],
  "sofa set": ["sofa set"],
  "recliner sofa": ["recliner sofa"],
  "sofa cum bed": ["sofa cum bed"],
  "wardrobe": ["wardrobe"],
  "bookshelf": ["bookshelf", "shelves"],
  "bed": ["bed", "double bed", "queen size bed", "king size bed"]
};

function resolveSubtypeIntent(subtype) {
  if (!exists(subtype)) return null;
  const norm = normalizeText(subtype);
  for (const intent in SUBTYPE_INTENT_MAP) {
    if (SUBTYPE_INTENT_MAP[intent].some(k => norm.includes(k))) {
      return intent;
    }
  }
  return null;
}

/* ================= HARD FILTER ================= */

function hardFilter(plan, cand, site) {
  try {
    const pType = plan[6]?.toLowerCase();
    const cType = normalizeType(cand[6], site);

    if (!exists(pType) || !exists(cType)) return false;
    if (pType !== cType) return false;

    const pIntent = resolveSubtypeIntent(plan[7]);
    const cIntent = resolveSubtypeIntent(cand[7]);

    if (!pIntent || !cIntent) return false;
    if (pIntent !== cIntent) return false;

    return true;
  } catch {
    return false;
  }
}

/* ================= DIMENSIONS ================= */

function parseDimensions(dim) {
  if (!exists(dim)) return [0, 0, 0];
  const nums = dim.match(/\d+(\.\d+)?/g)?.map(Number);
  return nums?.length >= 3 ? nums.slice(0, 3) : [0, 0, 0];
}

function dimensionSimilarity(a, b) {
  let score = 0;
  let count = 0;
  for (let i = 0; i < 3; i++) {
    if (!a[i] || !b[i]) continue;
    score += 1 - Math.abs(a[i] - b[i]) / Math.max(a[i], b[i]);
    count++;
  }
  return count ? score / count : 0;
}

/* ================= SIMILARITY ================= */

function similarityScore(plan, cand) {
  const dimScore = dimensionSimilarity(
    parseDimensions(plan[2]),
    parseDimensions(cand[2])
  );
  const priceScore =
    Math.min(plan[3], cand[3]) / Math.max(plan[3], cand[3]);

  return 0.5 + dimScore * 0.35 + priceScore * 0.15;
}

/* ================= SITE INFERENCE ================= */

function inferSite(id) {
  if (id.startsWith("A")) return "Amazon";
  if (id.startsWith("F")) return "Flipkart";
  if (id.startsWith("I")) return "IKEA";
  if (id.startsWith("U")) return "Urban Ladder";
  return "Unknown";
}

/* ================= ADAPTERS ================= */

function adaptRealProduct(p) {
  return [
    p.ID,
    null,
    p.Dimension,
    Number(p.Price),
    null,
    null,
    p.Type,
    p.SubType,
    null
  ];
}

function adaptPlanProProduct(p) {
  return [
    p.ID,
    p.Name,
    p.Dimension,
    Number(p.Price),
    null,
    null,
    p.Type,
    p.SubType,
    p.Brand || null
  ];
}

/* ================= CORE ENGINE ================= */

function compare(planProduct, datasets) {
  const sites = ["Amazon", "Flipkart", "IKEA", "Urban Ladder"];
  const results = Object.fromEntries(sites.map(s => [s, []]));

  datasets.forEach(data => {
    data.forEach(cand => {
      const site = inferSite(cand[0]);
      if (!results[site]) return;

      if (!hardFilter(planProduct, cand, site)) return;

      const sim = similarityScore(planProduct, cand);
      if (sim <= 0.6) return;

      results[site].push({
        id: cand[0],
        site,
        price: cand[3],
        similarity: Number(sim.toFixed(3))
      });
    });
  });

  return results;
}

/* ================= RUNNER ================= */

const planproData = loadJSON("planpro_data_2.json").map(adaptPlanProProduct);
const amazon = loadJSON("amazon_D.json").map(adaptRealProduct);
const flipkart = loadJSON("flipkart_D.json").map(adaptRealProduct);
const ikea = loadJSON("ikea_D.json").map(adaptRealProduct);

console.log("\nAVAILABLE PLANPRO PRODUCTS:");
console.table(planproData.map(p => ({
  id: p[0],
  name: p[1],
  price: p[3]
})));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("\nEnter PLANPRO product ID to compare: ", inputId => {
  const planProduct = planproData.find(p => p[0] === inputId.trim());
  if (!planProduct) {
    console.error("\n❌ Invalid PlanPro ID.");
    rl.close();
    return;
  }
  console.log("\nSELECTED PLANPRO PRODUCT:");
  console.table([{
    id: planProduct[0],
    name: planProduct[1],
    price: planProduct[3],
    type: planProduct[6],
    subtype: planProduct[7]
  }]);

  const results = compare(planProduct, [amazon, flipkart, ikea]);

  console.log("\nMATCHED PRODUCTS (TOP-2 PER SITE):");

  for (const site in results) {
    if (results[site].length === 0) {
      console.log(`\n⚠️   No sufficiently similar ${site} products found for this item`);
    } else {
      console.table(
        results[site]
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 2)
      );
    }
  }

  rl.close();
});
