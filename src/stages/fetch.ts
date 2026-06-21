import { Product, Category, TAXONOMY } from "../types";

const KEYWORDS: Record<Category, string[]> = {
  "Eau": ["eau", "water", "mineral", "spring"],
  "Lait": ["lait", "milk", "poudre de lait", "lactel"],
  "Yaourt": ["yaourt", "yogurt", "yogourt", "danone"],
  "Fromage": ["fromage", "cheese", "camembert", "gruyere", "vache qui rit"],
  "Beurre": ["beurre", "butter", "margarine", "smen"],
  "Huile": ["huile", "oil", "tournesol", "soja", "olive"],
  "Sucre": ["sucre", "sugar", "canne"],
  "Farine": ["farine", "flour", "blé"],
  "Riz": ["riz", "rice", "arborio"],
  "Semoule": ["semoule", "couscous", "semola"],
  "Pâtes": ["pâte", "pâtes", "pasta", "spaghetti", "macaroni", "nouille"],
  "Biscuit": ["biscuit", "gaufrette", "cookie", "madeleine", "cake"],
  "Chocolat": ["chocolat", "cacao", "nutella"],
  "Café": ["café", "coffee", "nescafé"],
  "Thé": ["thé", "tea", "chamomile"],
  "Jus": ["jus", "juice", "nectar", "frutival"],
  "Boisson Gazeuse": ["coca", "cola", "selecto", "soda", "hamoud", "sprite", "fanta", "gazéifiée"],
  "Sauce": ["harissa", "sauce", "tomate"],
  "Conserve": ["tomate", "concentré", "conserve", "boîte"],
  "Confiture": ["confiture", "jam", "marmelade"],
  "Miel": ["miel", "honey"],
  "Snack": ["chips", "snack", "popcorn"],
  "Détergent": ["lessive", "detergent", "ariel", "omo", "persil"],
  "Vaisselle": ["vaisselle", "liquide vaisselle", "isis", "pril"],
  "Hygiène": ["savon", "soap", "gel douche", "shampoing"],
  "Shampooing": ["shampooing", "shampoo", "après-shampooing"],
  "Dentifrice": ["dentifrice", "toothpaste", "signal"],
  "Autre": []
};

// For external use
export { KEYWORDS };

export async function fetchProducts(): Promise<any[]> {
  console.log("[FETCH] Starting Open Food Facts ingestion...");
  const allProducts: any[] = [];
  const baseUrl = "https://world.openfoodfacts.org/api/v2/search";
  const pageSize = 1000;
  const maxPages = 15;

  for (let page = 1; page <= maxPages; page++) {
    const url = new URL(baseUrl);
    url.searchParams.append("countries_tags_en", "algeria");
    url.searchParams.append("fields", "code,product_name_fr,product_name,brands,categories,quantity,image_url");
    url.searchParams.append("page_size", pageSize.toString());
    url.searchParams.append("page", page.toString());

    try {
      const res = await fetch(url.toString(), {
        headers: { "User-Agent": "POS-DataEngine/1.0" }
      });

      if (!res.ok) break;
      const data = await res.json();
      if (!data.products?.length) break;

      allProducts.push(...data.products);
      console.log(`[FETCH] Page ${page}: ${data.products.length} products`);
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`[FETCH] Error at page ${page}:`, err);
      break;
    }
  }

  console.log(`[FETCH] Total raw products: ${allProducts.length}`);
  return allProducts;
}