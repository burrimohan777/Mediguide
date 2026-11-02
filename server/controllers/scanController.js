import Scan from "../models/Scan.js";
import Medicine from "../models/Medicine.js"; 
import { extractTextFromImage } from "../services/ocrService.js";
import { matchMedicine } from "../services/matchService.js";
import { extractPackagingDetails } from "../services/extractService.js";
import { matchPrescriptionMedicines } from "../services/prescriptionService.js";

export const uploadScan = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image uploaded" });
    }  

    let combinedText = "";

    for (const file of req.files) {
      console.log("Running OCR on:", file.path);
      const text = await extractTextFromImage(file.path);
      console.log("OCR result for this image:", text);
      combinedText += "\n" + text;
    }

    console.log("Combined OCR text:", combinedText);

    const matchResult = await matchMedicine(combinedText);
    const matched = matchResult?.medicine || null;
    const matchType = matchResult?.matchType || null;

    const packagingDetails = extractPackagingDetails(combinedText);
    console.log("Packaging details:", packagingDetails);

    const scan = await Scan.create({
      user: req.user._id,
      imagePath: req.files[0].path, // primary image path for record-keeping
      rawText: combinedText,
      matchedMedicine: matched ? matched._id : null,
      type: "medicine",
      batchNumber: packagingDetails.batchNumber,
      expiryDate: packagingDetails.expiryDate,
      manufacturingDate: packagingDetails.manufacturingDate,
    });

    res.status(201).json({
      scanId: scan._id,
      rawText: combinedText,
      medicine: matched || null,
      matchType,
      batchNumber: packagingDetails.batchNumber,
      expiryDate: packagingDetails.expiryDate,
      manufacturingDate: packagingDetails.manufacturingDate,
      message: matched ? "Medicine identified" : "No confident match found",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing scan" });
  }
};

export const getScanHistory = async (req, res) => {
  try {
    const scans = await Scan.find({ user: req.user._id })
      .populate("matchedMedicine")
      .populate("matchedMedicines")
      .sort({ createdAt: -1 });

    res.json(scans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching history" });
  }
};

export const uploadPrescription = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    let combinedText = "";
    for (const file of req.files) {
      const text = await extractTextFromImage(file.path);
      combinedText += "\n" + text;
    }
    console.log("Prescription OCR text:", combinedText);

    const matches = await matchPrescriptionMedicines(combinedText);

    const savedMedicineIds = await Promise.all(
      matches.map(async (m) => {
        let medId = m.medicine._id;

        await Medicine.findByIdAndUpdate(medId, {
          dose: m.dose,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
        });

        return medId;
      })
    );

    const scan = await Scan.create({
      user: req.user._id,
      imagePath: req.files[0].path,
      rawText: combinedText,
      matchedMedicines: savedMedicineIds,
      type: "prescription",
    });

    res.status(201).json({
      scanId: scan._id,
      medicines: matches.map((m) => ({
        ...m.medicine.toObject(),
        dose: m.dose,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
      })),
      message: matches.length
        ? `Found ${matches.length} medicine(s)`
        : "No medicines could be identified",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error processing prescription" });
  }
};

export const deleteScan = async (req, res) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, user: req.user._id });

    if (!scan) {
      return res.status(404).json({ message: "Scan not found" });
    }

    await Scan.deleteOne({ _id: req.params.id });
    res.json({ message: "Scan deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting scan" });
  }
};