import Tesseract from "tesseract.js";
import path from "path";
import sharp from "sharp";
import fs from "fs";

async function runOcr(imagePath) {
  const { data } = await Tesseract.recognize(imagePath, "eng", {
    logger: () => {}, // quiet for internal rotation attempts
  });
  return data.text;
}

function textQualityScore(text) {
  const letters = text.match(/[a-zA-Z]/g) || [];
  return letters.length;
}

export async function extractTextFromImage(imagePath) {
  const fullPath = path.resolve(imagePath);
  const rotations = [0, 90, 180, 270];

  let bestText = "";
  let bestScore = -1;

  for (const angle of rotations) {
    let testPath = fullPath;

    if (angle !== 0) {
      testPath = fullPath.replace(/(\.\w+)$/, `_rot${angle}$1`);
      await sharp(fullPath).rotate(angle).toFile(testPath);
    }

    try {
      const text = await runOcr(testPath);
      const score = textQualityScore(text);
      console.log(`OCR at ${angle}° — readable letters: ${score}`);

      if (score > bestScore) {
        bestScore = score;
        bestText = text;
      }
    } finally {
      if (angle !== 0 && fs.existsSync(testPath)) {
        fs.unlinkSync(testPath); // clean up temp rotated file
      }
    }
  }

  return bestText;
}