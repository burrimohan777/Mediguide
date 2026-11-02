function findAllDates(text) {
  const pattern = /([A-Za-z]{3,9}\.?\s?\d{4}|\d{1,2}\s?[\/\-]\s?\d{2,4})\b/g;
  const matches = [...text.matchAll(pattern)];
  return matches.map((m) => m[1].replace(/\s+/g, "").trim());
}

function findBatchCode(text) {
  const pattern = /\b([A-Z]{1,4}\d{3,8}|[A-Z0-9]{5,10})\b/g;
  const matches = [...text.matchAll(pattern)];

  const candidates = matches
    .map((m) => m[1])
    .filter((code) => {
      if (/^(19|20)\d{2}$/.test(code)) return false; // looks like a plain year
      if (code.length < 5) return false;
      return true;
    });

  return candidates.length > 0 ? candidates[0] : null;
}


function padMonth(dateStr) {
  const match = dateStr.match(/^(\d{1,2})([\/\-])(\d{2,4})$/);
  if (!match) return dateStr;
  const [, month, sep, year] = match;
  return month.padStart(2, "0") + sep + year;
}

export function extractPackagingDetails(rawText) {
  const dates = findAllDates(rawText);
  const batchNumber = findBatchCode(rawText);

  let manufacturingDate = null;
  let expiryDate = null;

  if (dates.length === 1) {
    expiryDate = padMonth(dates[0]);
  } else if (dates.length >= 2) {
    manufacturingDate = padMonth(dates[0]);
    expiryDate = padMonth(dates[1]);
  }

  return { batchNumber, expiryDate, manufacturingDate };
}