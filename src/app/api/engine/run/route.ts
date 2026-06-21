import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getPool, initSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Expanded keyword taxonomy for Algerian products
const SCORE_KEYWORDS: Record<string, string[]> = {
  // Beverages - Water
  "Eau": [
    // French
    "eau", "minérale", "minéral", "spring", "source", "plate", "gazeuse", "pétillante",
    // Arabic transliterations
    "ifri", "sidi ali", "lalla", "bledina", "boumerdes", "médéa",
    // Brand-specific water
    "afia", "rasel", "sahra", "nour", " cristal", "viva", "water", "voda",
    // Common patterns
    "aqua", "h2o", "hydration", "bouteille d'eau", "eau de source"
  ],
  
  // Dairy - Milk
  "Lait": [
    // French
    "lait", "milk", "écrémé", "entier", "premier prix", "poudre",
    "lactel", "Candia", "President", "laits", "frais", "uht", "stérilisé",
    // Arabic
    "حليب", "halib", "lben", "leben", "laban", "l'ben", "laben",
    // Common
    "brik", "brique", "crème", "crémier", "kondia", "condia", "reda"
  ],
  
  // Dairy - Yogurt
  "Yaourt": [
    // French
    "yaourt", "yogurt", "yogourt", "danone", "activia", "velouté",
    // Arabic
    "زبادي", "leben", "yapro", "jebana",
    // Common patterns
    "yaourtière", "ferment", "nature", "aux fruits", "à boire", "boisson lactée"
  ],
  
  // Dairy - Cheese
  "Fromage": [
    // French
    "fromage", "cheese", "camembert", "gruyère", "emmental", "cheddar",
    "vache qui rit", "kiri", "la vache qui rit", "babybel", "boursin",
    "gouda", "edam", "mozzarella", "parmesan", "comté", "beaufort",
    "tomme", "raclette", "caprice des dieux", "chèvre", "fromé",
    // Arabic
    "جبنة", "fromage",
    // Brands
    "président", "entremont", "galbani", "s delicacy", "lurpak",
    // Common
    "tranche", "râpé", "rapé", "cube", "meurt", "frais"
  ],
  
  // Dairy - Butter
  "Beurre": [
    // French
    "beurre", "butter", "margarine", "smen", "crème butter",
    // Arabic
    "زبدة", "smen", "smen",
    // Brands
    "président beurre", "vireol", "cultura", "le petit maraîcher",
    // Common
    "barra", "barrm", "salé", "doux", "fin", "allégé"
  ],
  
  // Oils
  "Huile": [
    // French
    "huile", "oil", "olive", "tournesol", "soja", "colza", "arachide",
    "huile de", "huiles",
    // Arabic
    "زيت", "zit", "zeit",
    // Brands
    "fiord", "lesieur", "Fleur", "huile d olive", "huile de tournesol",
    "graine d or", "crystal", "plantin",
    // Common
    "vierge", "extra", "bio", "première pression", "raffinée"
  ],
  
  // Sweeteners - Sugar
  "Sucre": [
    // French
    "sucre", "sugar", "canne", "betterave", "cassonade", "glucose",
    "fructose", "saccharose", "édulcorant",
    // Arabic
    "سكر", "sokkar",
    // Brands
    "divers", "premier prix",
    // Common
    "morceaux", "morceau", "poudre", "cristallisé"
  ],
  
  // Grains - Flour
  "Farine": [
    // French
    "farine", "flour", "blé", "froment", "complète", "semi-complète",
    // Arabic
    "دقيق", "da9i2", "deghem",
    // Brands
    "molino", "whitney", "flour",
    // Common
    "tamiseé", "tamisée", "001", "tipo"
  ],
  
  // Grains - Rice
  "Riz": [
    // French
    "riz", "rice", "arborio", "basmati", "carré", "long grain",
    "étuvé", "blanc",
    // Arabic
    "رز", "roz",
    // Common
    "rist", "sushi", "couscous", "pakistani", "indien"
  ],
  
  // Grains - Semolina
  "Semoule": [
    // French
    "semoule", "couscous", "semolina", "tablé",
    // Arabic
    "سميد", "smid",
    // Common
    "couscous", "tali", "granular"
  ],
  
  // Pasta
  "Pâtes": [
    // French
    "pâte", "pâtes", "pasta", "spaghetti", "macaroni", "nouilles",
    "nouille", "penne", "fusilli", "farfalle", "tagliatelle",
    "lasagne", "coquillette", "vermicelle",
    // Arabic
    "معكرونة", "makarona", "pasta",
    // Common
    "frais", "sèches", "aux œufs", "complet", "bio"
  ],
  
  // Snacks - Biscuits
  "Biscuit": [
    // French
    "biscuit", "cookie", "gaufrette", "madeleine", "petit beurre",
    "sablé", "barre", "barres", "bn", "biscotte", "biscotti",
    // Arabic
    "بسكويت", "biskwi",
    // Brands
    "oreo", "prince", "lu", "cereal", "choco", "bnx", "gerber",
    "lesulian", "s prejuízo",
    // Common
    "chocolat", "vanille", "fruits", "carré", "crème"
  ],
  
  // Chocolate & spreads
  "Chocolat": [
    // French
    "chocolat", "cacao", "nutella", "pâte à tartiner", "pralin",
    "praliné", "carré de chocolate", "cocoa",
    // Arabic
    "شوكولاتة", "chokola",
    // Brands
    "ferrero", "valrhona", "côte d'or", "milka", "toblerone",
    "nestlé", "cailler", "lindt",
    // Common
    "noir", "au lait", "blanc", "fourré", "tablette", "barre"
  ],
  
  // Coffee
  "Café": [
    // French
    "café", "coffee", "café soluble", "café moulu", "express",
    "espresso", "cappuccino", "ristretto",
    // Arabic
    "قهوة", "2ahwa", "gahwa",
    // Brands
    "nescafé", "nescafe", "tasters choice", "maxwell house", "jacobs",
    "grand mère", "café de paris", "movenpick", "café royal",
    "serrure", "monaco",
    // Common
    "décaféiné", "décaf", "classic", "gold"
  ],
  
  // Tea
  "Thé": [
    // French
    "thé", "tea", "infusion", "tisan", "tisane", "camomille",
    "menthe", "verveine",
    // Arabic
    "شاي", "shai", "chai",
    // Brands
    "lippton", "catherine", "dilmah", "lipton", "taybostan",
    "boulevard", "twinning", "malta",
    // Common
    "vert", "noir", "rouge", "blanc", " BIO", "bio"
  ],
  
  // Juices
  "Jus": [
    // French
    "jus", "juice", "nectar", "sirop", "concentré", "boisson",
    // Arabic
    "عصير", "3sir",
    // Brands
    "alal", "tropicana", "innocent", "fruit", "pulpy", "minute maid",
    "rimbaud", "tritan", "hawaiian", "sun sweet", "frutival",
    // Common
    "orange", "pomme", "raisin", "pêche", "tomate", "multi-fruits",
    "fruits de la passion", "mangue", "ananas", "citron"
  ],
  
  // Sodas
  "Boisson Gazeuse": [
    // French
    "coca", "cola", "soda", "sprite", "fanta", "pepsi", "fanta",
    "gazéifiée", "pétillante",
    // Arabic
    "مشروب غازي",
    // Brands
    "coca-cola", "cocacola", "sprite", "fanta", "hamoud", "selecto",
    "hayat", "cola", "Pepsi", "mirinda", "7up",
    // Common
    "zero", "light", "sans sucre", "regular", "cherry"
  ],
  
  // Sauces & Condiments
  "Sauce": [
    // French
    "sauce", "mayonnaise", "ketchup", "moutarde", "vinaigrette",
    "chutney", "curry", "pesto",
    // Arabic
    "صلصة", "salça",
    // Brands
    "heinz", "amora", "maison", "carapelli",
    // Common
    "tomate", "provençale", "barbecue", "poivre", "moutarde"
  ],
  
  // Canned goods
  "Conserve": [
    // French
    "conserve", "tomate", "concentré", "boîte", "haricots", "pois",
    "lentilles", "thon", "sardine", "maquereau", "mackerel",
    // Arabic
    "محفوظ", "muhafaz",
    // Brands
    "petit navire", "saupiquet", "connétable", "captain cook",
    // Common
    "pelé", "en purée", "en dés", "entier", "égoutté"
  ],
  
  // Jams & spreads
  "Confiture": [
    // French
    "confiture", "jam", "marmelade", "pâte à tartiner",
    // Arabic
    "مربى", "marabba",
    // Brands
    "hero", "andros", "st dalfour", "bonne maman", "helios",
    // Common
    "fraise", "abricot", "cerise", "myrtille", "figue", "orange",
    "mangue", "framboise", "groseille", "cassis"
  ],
  
  // Honey
  "Miel": [
    // French
    "miel", "honey", "gelée royale",
    // Arabic
    "عسل", "3asal",
    // Common
    "acacia", "fleur", "montagne", "forestier", "toutes fleurs",
    "romarin", "eucalyptus", "thym"
  ],
  
  // Salty snacks
  "Snack": [
    // French
    "chips", "snack", "apéritif", "cacahuète", "amande", "noix",
    "popcorn", "croustille", "bretzel",
    // Arabic
    "مقبلات", "مسليات",
    // Brands
    "pringles", "lays", "cheetos", "curly", "tortilla", "swiss",
    // Common
    "sel", "nature", "arôme", "saveur", "paprika", "fromage"
  ],
  
  // Laundry detergent
  "Détergent": [
    // French
    "lessive", "détergent", "lessive liquide", "poudre",
    // Brands
    "ariel", "omo", "persil", "tide", "gain", "dash", "liby",
    // Common
    "lavage", "machine", "linge", "nettoyant"
  ],
  
  // Dish soap
  "Vaisselle": [
    // French
    "vaisselle", "liquide vaisselle", "produit vaiselle",
    // Brands
    "isis", "pril", "fairy", "dawn", "bonux", "citrol",
    // Common
    "nettoyer", "lava", "lave", "plaque", "dosette"
  ],
  
  // Personal hygiene
  "Hygiène": [
    // French
    "savon", "soap", "gel douche", "douche", "crème hydratante",
    "lotion", "déodorant", "rouleau", "papier hygiénique",
    // Arabic
    "صابون", "saboun",
    // Brands
    "dove", "nivea", "cif", "lysol", "swan", "patrimoine",
    // Common
    "corps", "visage", "mains", "hygiène", "corporel"
  ],
  
  // Shampoo
  "Shampooing": [
    // French
    "shampoing", "shampoo", "après-shampoing", "soin", "masque",
    // Arabic
    "شامبو", "shampo",
    // Brands
    "pantene", "head & shoulders", "l'oréal", "garnier", "elseve",
    "natural", "herbal", "schwarzkopf",
    // Common
    "cheveux", "capillaire", "volume", "réparation", "brillance"
  ],
  
  // Toothpaste
  "Dentifrice": [
    // French
    "dentifrice", "toothpaste", "brosse à dents", "brosse", "fil dental",
    // Arabic
    "معجون أسنان",
    // Brands
    "signal", "colgate", "aquafresh", "elmex", "sensodyne", "oral-b",
    // Common
    "dents", "fraicheur", "blancheur", "protection", "caries"
  ]
};

interface CategoryScore {
  category: string;
  score: number;
  matchedKeywords: string[];
}

function classifyProduct(
  productName: string,
  brand: string,
  categories?: string
): { category: string; confidence: number } {
  const text = `${productName} ${brand} ${categories || ''}`.toLowerCase();
  
  const scores: CategoryScore[] = [];
  
  for (const [category, keywords] of Object.entries(SCORE_KEYWORDS)) {
    let score = 0;
    const matchedKeywords: string[] = [];
    
    for (const kw of keywords) {
      // Check for exact word match (with word boundaries)
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(text)) {
        score += 1;
        matchedKeywords.push(kw);
      }
      // Also check for partial matches for short keywords
      else if (kw.length <= 4 && text.includes(kw)) {
        score += 0.5;
        matchedKeywords.push(kw);
      }
    }
    
    if (score > 0) {
      scores.push({ category, score, matchedKeywords });
    }
  }
  
  // Sort by score and get best match
  scores.sort((a, b) => b.score - a.score);
  
  if (scores.length === 0) {
    return { category: "Autre", confidence: 0 };
  }
  
  const best = scores[0];
  
  // Calculate confidence based on:
  // 1. Number of matched keywords (max contribution: 0.6)
  // 2. Score magnitude (max contribution: 0.3)
  // 3. Minimum baseline when matched (0.2)
  
  const keywordBonus = Math.min(best.matchedKeywords.length * 0.15, 0.6);
  const scoreBonus = Math.min(best.score / 5, 0.3);
  const baseline = 0.2;
  
  const confidence = Math.min(baseline + keywordBonus + scoreBonus, 1.0);
  
  return { 
    category: best.category, 
    confidence: Math.round(confidence * 100) / 100 
  };
}

async function fetchProducts(): Promise<any[]> {
  console.log("[ENGINE] Fetching from Open Food Facts...");
  const allProducts: any[] = [];
  
  const baseUrl = "https://world.openfoodfacts.org/api/v2/search";
  
  for (let page = 1; page <= 5; page++) {
    const url = new URL(baseUrl);
    url.searchParams.append("countries_tags_en", "algeria");
    url.searchParams.append("fields", "code,product_name,product_name_fr,brands,categories_tags,quantity,image_url");
    url.searchParams.append("page_size", "50");
    url.searchParams.append("page", page.toString());
    
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "AlgerianPOSEngine/1.0" }
    });

    console.log("[ENGINE] Page " + page + " status: " + res.status);
    
    if (!res.ok) break;
    
    const data = await res.json();
    console.log("[ENGINE] Page " + page + " products: " + (data.products?.length || 0));
    
    if (!data.products?.length) break;

    for (const p of data.products) {
      if (p.code && p.code.length >= 8) {
        allProducts.push(p);
      }
    }
    
    await new Promise(r => setTimeout(r, 200));
  }

  console.log("[ENGINE] Total fetched: " + allProducts.length);
  return allProducts;
}

// Utility functions
function cleanBrand(brand: string): string {
  if (!brand) return '';
  // Clean up brand string - remove extra spaces, '...', etc.
  return brand.split(',')[0].trim().replace(/^\.+/, '').trim() || '';
}

function normalizeQuantity(quantity: string | undefined): string | null {
  if (!quantity) return null;
  const cleaned = quantity.trim();
  return cleaned.length > 0 ? cleaned : null;
}

export async function POST() {
  try {
    console.log('[ENGINE] Starting...');
    await initSchema();
    
    const pool = getPool();
    const client = await pool.connect();

    try {
      const raw = await fetchProducts();
      console.log(`[ENGINE] Raw products: ${raw.length}`);

      const deduped: any[] = [];
      const byBarcode = new Map<string, any>();
      
      for (const p of raw) {
        const name = (p.product_name_fr || p.product_name || "").trim();
        if (!name || name.length <= 2) continue;
        
        if (!byBarcode.has(p.code)) {
          // Get categories from Open Food Facts for better classification
          const categoriesStr = p.categories_tags ? 
            p.categories_tags.filter((c: string) => c.length > 2).join(' ') : '';
          
          const result = classifyProduct(name, p.brands || "", categoriesStr);
          
          byBarcode.set(p.code, {
            id: crypto.randomUUID(),
            barcode: p.code,
            product_name: name,
            brand: cleanBrand(p.brands || ""),
            category: result.category,
            quantity: normalizeQuantity(p.quantity),
            image_url: p.image_url || null,
            classification_confidence: result.confidence,
            weight_version: 1,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          });
        }
      }
      
      const products = Array.from(byBarcode.values());
      console.log(`[ENGINE] Deduped: ${products.length}`);

      let inserted = 0;
      for (const p of products) {
        try {
          await client.query(`
            INSERT INTO products (id, barcode, product_name, brand, category, quantity, image_url, classification_confidence, weight_version, created_at, last_updated)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (barcode) DO UPDATE SET 
              product_name = EXCLUDED.product_name, 
              category = EXCLUDED.category,
              classification_confidence = EXCLUDED.classification_confidence,
              last_updated = EXCLUDED.last_updated
          `, [p.id, p.barcode, p.product_name, p.brand, p.category, p.quantity, p.image_url, p.classification_confidence, p.weight_version, p.created_at, p.last_updated]);
          inserted++;
        } catch (err: any) {
          console.log("[ENGINE] Insert error: " + err.message);
        }
      }
      
      console.log(`[ENGINE] Inserted: ${inserted}`);

      const version = new Date().toISOString().replace(/[:-]/g, "").slice(0, 12) + "-" + crypto.randomUUID().slice(0, 4);
      const avgConfidence = products.length > 0 ? products.reduce((sum, p) => sum + p.classification_confidence, 0) / products.length : 0;
      
      await client.query(`INSERT INTO dataset_versions (version, product_count, avg_confidence, exported_at) VALUES ($1, $2, $3, $4) ON CONFLICT (version) DO NOTHING`,
        [version, inserted, avgConfidence, new Date().toISOString()]);

      console.log(`[ENGINE] Done! ${inserted} products`);
      return NextResponse.json({ 
        success: true, 
        data: { 
          message: `Successfully processed ${inserted} products`, 
          version, 
          product_count: inserted, 
          avg_confidence: avgConfidence 
        } 
      });
    } finally { client.release(); }
  } catch (error: any) {
    console.error('[ENGINE] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}