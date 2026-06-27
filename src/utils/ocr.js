export async function extractTextFromImage(file) {
  return new Promise((resolve) => {
    // Stub - integrate Tesseract.js or native OCR
    setTimeout(() => resolve("Sample extracted text\nItem 1: 10.00\nItem 2: 25.50"), 500);
  });
}

export function parseItemsFromText(text) {
  if (!text) return [];
  const lines = text.split(/
/);
  const items = [];
  for (const line of lines) {
    const match = line.match(/(.+?)[:\s]+(\d+[.,]?\d*)/);
    if (match) {
      items.push({
        name: match[1].trim(),
        price: parseFloat(match[2].replace(",", ".")),
        tag: "invoices",
        endDate: null,
      });
    }
  }
  return items;
}
