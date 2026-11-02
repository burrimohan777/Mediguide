import Medicine from "../models/Medicine.js";

function cleanText(text) {
  return text
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !/^\d+$/.test(w));
}

const FORM_VARIANTS = {
  cream: ["cream"],
  tube: ["tube"],
  gel: ["gel", "ge|", "gei", "g3l"],
  ointment: ["ointment"],
  drop: ["drop", "drops"],
  eye: ["eye"],
  tablet: ["tablet", "tablets", "tab1et"],
  injection: ["injection", "injecti0n"],
  syrup: ["syrup"],
  capsule: ["capsule"],
  powder: ["powder"],
};

function detectFormHints(rawText) {
  const lower = rawText.toLowerCase();
  const hits = [];

  for (const [form, variants] of Object.entries(FORM_VARIANTS)) {
    for (const variant of variants) {
      const index = lower.indexOf(variant);
      if (index !== -1) {
        hits.push({ form, index });
        break;
      }
    }
  }

  hits.sort((a, b) => a.index - b.index);
  return hits.map((h) => h.form);
}
export async function matchMedicine(ocrText) {
  const words = cleanText(ocrText);
  if (words.length === 0) return null;

  const brandWords = words.filter((w) => w.length >= 6);

  const searchQuery = words.slice(0, 6).join(" ");
  const candidates = await Medicine.find(
    { $text: { $search: searchQuery } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(15);

  console.log("Search query:", searchQuery);
  console.log("Brand words:", brandWords);
  console.log(
    "Candidates:",
    candidates.map((m) => `${m.name} (score: ${m._doc.score.toFixed(2)})`)
  );

  if (candidates.length === 0 || brandWords.length === 0) {
    console.log("No confident match found");
    return null;
  }

  const filtered = candidates.filter((med) => {
    const searchable = `${med.name} ${med.genericName} ${med.composition}`.toLowerCase();
    return brandWords.some((w) => searchable.includes(w.toLowerCase()));
  });

  console.log("Filtered candidates:", filtered.map((m) => m.name));

  if (filtered.length === 0) {
    console.log("No confident match found");
    return null;
  }

  const formHints = detectFormHints(ocrText);
  let best = filtered[0];

if (formHints.length > 0) {
  for (const hint of formHints) {
    const formMatch = filtered.find((med) =>
      med.name.toLowerCase().includes(hint)
    );
    if (formMatch) {
      best = formMatch;
      break;
    }
  }
}

  const matchedByName = brandWords.some((w) =>
    best.name.toLowerCase().includes(w.toLowerCase())
  );
  const matchType = matchedByName ? "brand" : "composition";

  console.log(`Final match (${matchType}):`, best.name);

  return { medicine: best, matchType };
}