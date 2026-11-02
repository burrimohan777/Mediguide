import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { deleteScan, getScanHistory, uploadPrescription, uploadScan } from "../controllers/scanController.js";

const router = express.Router();

router.post("/upload", protect, upload.array("images", 2), uploadScan);
router.post("/prescription", protect, upload.array("images", 2), uploadPrescription);
router.get("/history", protect, getScanHistory);
router.delete("/:id", protect, deleteScan);

export default router;