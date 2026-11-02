import "dotenv/config";
import fs from "fs";
import csv from "csv-parser";
import mongoose from "mongoose";
import Medicine from "../models/Medicine.js";

const coreFile = "./seed/indian_medicine_data.csv";
const detailsFile = "./seed/medicine_dataset.csv";

const normalize = (str) =>
  (str || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");

function readCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected for seeding");

  console.log("Reading CSV files (this may take a minute for 250k+ rows)...");
  const coreRows = await readCsv(coreFile);
  const detailRows = await readCsv(detailsFile);
  console.log(`Core rows: ${coreRows.length}, Detail rows: ${detailRows.length}`);

  const detailsMap = new Map();
  for (const row of detailRows) {
    const key = normalize(row.name);
    if (key && !detailsMap.has(key)) {
      detailsMap.set(key, row);
    }
  }

  const merged = [];
  const limitedCore = coreRows; // start small, raise later

  let matchCount = 0;

  for (const row of limitedCore) {
    if (!row.name) continue;

    const details = detailsMap.get(normalize(row.name));
    if (details) matchCount++;

    const uses = [];
    const sideEffects = [];
    const warnings = [];

    if (details) {
      for (let i = 0; i <= 4; i++) {
        if (details[`use${i}`]) uses.push(details[`use${i}`]);
      }
      for (let i = 0; i <= 41; i++) {
        if (details[`sideEffect${i}`]) sideEffects.push(details[`sideEffect${i}`]);
      }
      if (details["Habit Forming"] && details["Habit Forming"] !== "No") {
        warnings.push(`Habit forming: ${details["Habit Forming"]}`);
      }
      if (details["Therapeutic Class"] && details["Therapeutic Class"] !== "NA") {
        warnings.push(`Class: ${details["Therapeutic Class"]}`);
      }
    }

    merged.push({
      name: row.name.trim(),
      genericName: [row.short_composition1, row.short_composition2]
        .filter(Boolean)
        .map((s) => s.trim())
        .join(", "),
      composition: [row.short_composition1, row.short_composition2]
        .filter(Boolean)
        .map((s) => s.trim())
        .join(" + "),
      manufacturer: row.manufacturer_name || "",
      uses,
      sideEffects,
      warnings,
    });
  }

  try {
    await Medicine.insertMany(merged);
    console.log(`Inserted ${merged.length} medicines`);
    console.log(`Matched with details for ${matchCount} of them`);
  } catch (err) {
    console.error("Insert failed:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

seed();