import Medicine from "../models/Medicine.js";

const SKIP = new Set([
  "tablet", "tablets", "tab", "cap", "capsule", "capsules", "syrup", "syp",
  "inj", "after", "before", "food", "days", "day", "weeks", "week",
  "months", "month", "prescription", "medicine", "name", "dosage",
  "freq", "duration", "instructions",
]);

function parseLine(line) {
  const freq = line.match(/\b([0-3])\s*[-–]\s*([0-3])\s*[-–]\s*([0-3])\b/);
  const dose = line.match(/\b(\d+)\s*(tab|tabs|tablet|tablets|cap|caps|capsule|capsules)\b/i);
  const duration = line.match(/\b(\d+)\s*(days?|weeks?|months?)\b/i);
  const after = /after\s*food/i.test(line);
  const before = /before\s*food/i.test(line);

  return {
    frequency: freq ? `${freq[1]}-${freq[2]}-${freq[3]}` : null,
    dose: dose ? `${dose[1]} ${/cap/i.test(dose[2]) ? "capsule" : "tablet"}${dose[1] === "1" ? "" : "s"}` : null,
    duration: duration ? `${duration[1]} ${duration[2].toLowerCase()}` : null,
    instructions: after ? "After food" : before ? "Before food" : null,
  };
}

export async function matchPrescriptionMedicines(rawText) {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results = [];
  const seen = new Set();

  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed.frequency && !parsed.dose && !parsed.duration) continue;
    const tokens = line
      .split(/[^a-zA-Z0-9]+/)
      .filter((t) => t.length >= 4 && /[a-zA-Z]{4,}/.test(t) && !SKIP.has(t.toLowerCase()));

    let found = null;
    for (const token of tokens) {
      found = await Medicine.findOne({
        name: { $regex: "^" + token, $options: "i" },
      });
      if (found) break;
    }

    if (found && !seen.has(found._id.toString())) {
      seen.add(found._id.toString());
      results.push({ medicine: found, ...parsed });
    }
  }
  return results;
}