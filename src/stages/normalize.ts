export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function cleanBrand(brand: string): string {
  return brand
    .split(",")[0]
    .replace(/\b\d+\s*(da|dza|dz)\b/gi, "")
    .replace(/[\.\-\_]+$/g, "")
    .trim() || "Inconnu";
}

export function normalizeQuantity(qty: string | undefined): string | null {
  if (!qty) return null;

  const match = qty.match(/([\d\.,]+)\s*(l|ml|cl|g|kg|gr)\b/i);
  if (!match) return qty.trim() || null;

  let [, numStr, unit] = match;
  let num = parseFloat(numStr.replace(",", "."));

  if (isNaN(num)) return null;

  unit = unit.toLowerCase();
  if (unit === "gr") unit = "g";
  if (unit === "cl") {
    num = num / 100;
    unit = "L";
  }
  if (unit === "ml") {
    num = num / 1000;
    unit = "L";
  }

  return `${num} ${unit}`;
}