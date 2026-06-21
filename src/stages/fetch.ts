import { Product, Category, TAXONOMY } from "../types";

export interface ClassificationResult {
  category: Category;
  confidence: number;
  scores: Partial<Record<Category, number>>;
}

// Comprehensive keyword taxonomy for Algerian products
const KEYWORDS: Record<Category, string[]> = {
  "Eau": [
    "eau", "minérale", "minéral", "spring", "source", "plate", "gazeuse", "pétillante",
    "ifri", "sidi ali", "lalla", "bledina", "boumerdes", "médéa",
    "afia", "rasel", "sahra", "nour", " cristal", "viva", "water", "voda",
    "aqua", "h2o", "hydration", "bouteille d'eau", "eau de source"
  ],
  "Lait": [
    "lait", "milk", "écrémé", "entier", "premier prix", "poudre",
    "lactel", "Candia", "President", "laits", "frais", "uht", "stérilisé",
    "حليب", "halib", "lben", "leben", "laban", "l'ben", "laben",
    "brik", "brique", "crème", "crémier", "kondia", "condia", "reda"
  ],
  "Yaourt": [
    "yaourt", "yogurt", "yogourt", "danone", "activia", "velouté",
    "زبادي", "leben", "yapro", "jebana",
    "yaourtière", "ferment", "nature", "aux fruits", "à boire", "boisson lactée"
  ],
  "Fromage": [
    "fromage", "cheese", "camembert", "gruyère", "emmental", "cheddar",
    "vache qui rit", "kiri", "la vache qui rit", "babybel", "boursin",
    "gouda", "edam", "mozzarella", "parmesan", "comté", "beaufort",
    "tomme", "raclette", "caprice des dieux", "chèvre", "fromé",
    "جبنة", "président", "entremont", "galbani", "lurpak",
    "tranche", "râpé", "rapé", "cube", "meurt", "frais"
  ],
  "Beurre": [
    "beurre", "butter", "margarine", "smen", "crème butter",
    "زبدة", "smen", "président beurre", "vireol", "cultura",
    "barra", "barrm", "salé", "doux", "fin", "allégé"
  ],
  "Huile": [
    "huile", "oil", "olive", "tournesol", "soja", "colza", "arachide",
    "huile de", "huiles", "زيت", "zit", "zeit",
    "fiord", "lesieur", "Fleur", "huile d olive", "huile de tournesol",
    "graine d or", "crystal", "plantin",
    "vierge", "extra", "bio", "première pression", "raffinée"
  ],
  "Sucre": [
    "sucre", "sugar", "canne", "betterave", "cassonade", "glucose",
    "fructose", "saccharose", "édulcorant", "سكر", "sokkar",
    "morceaux", "morceau", "poudre", "cristallisé"
  ],
  "Farine": [
    "farine", "flour", "blé", "froment", "complète", "semi-complète",
    "دقيق", "da9i2", "deghem", "molino", "whitney", "tipo"
  ],
  "Riz": [
    "riz", "rice", "arborio", "basmati", "carré", "long grain",
    "étuvé", "blanc", "رز", "roz", "rist", "sushi"
  ],
  "Semoule": [
    "semoule", "couscous", "semolina", "tablé", "سميد", "smid", "tali"
  ],
  "Pâtes": [
    "pâte", "pâtes", "pasta", "spaghetti", "macaroni", "nouilles",
    "nouille", "penne", "fusilli", "farfalle", "tagliatelle",
    "lasagne", "coquillette", "vermicelle", "معكرونة", "makarona",
    "frais", "sèches", "aux œufs", "complet", "bio"
  ],
  "Biscuit": [
    "biscuit", "cookie", "gaufrette", "madeleine", "petit beurre",
    "sablé", "barre", "barres", "bn", "biscotte", "biscotti",
    "بسكويت", "biskwi", "oreo", "prince", "lu", "cereal", "choco", "gerber",
    "lesulian", "chocolat", "vanille", "fruits", "carré", "crème"
  ],
  "Chocolat": [
    "chocolat", "cacao", "nutella", "pâte à tartiner", "pralin", "praliné",
    "carré de chocolate", "cocoa", "شوكولاتة", "chokola",
    "ferrero", "valrhona", "côte d'or", "milka", "toblerone",
    "nestlé", "cailler", "lindt",
    "noir", "au lait", "blanc", "fourré", "tablette", "barre"
  ],
  "Café": [
    "café", "coffee", "café soluble", "café moulu", "express",
    "espresso", "cappuccino", "ristretto", "قهوة", "2ahwa", "gahwa",
    "nescafé", "nescafe", "tasters choice", "maxwell house", "jacobs",
    "grand mère", "café de paris", "movenpick", "café royal",
    "serrure", "monaco", "décaféiné", "décaf", "classic", "gold"
  ],
  "Thé": [
    "thé", "tea", "infusion", "tisan", "tisane", "camomille",
    "menthe", "verveine", "شاي", "shai", "chai",
    "lippton", "catherine", "dilmah", "lipton", "taybostan",
    "boulevard", "twinning", "malta",
    "vert", "noir", "rouge", "blanc", " BIO", "bio"
  ],
  "Jus": [
    "jus", "juice", "nectar", "sirop", "concentré", "boisson",
    "عصير", "3sir", "alal", "tropicana", "innocent", "fruit", "pulpy",
    "minute maid", "rimbaud", "tritan", "hawaiian", "sun sweet", "frutival",
    "orange", "pomme", "raisin", "pêche", "tomate", "multi-fruits",
    "fruits de la passion", "mangue", "ananas", "citron"
  ],
  "Boisson Gazeuse": [
    "coca", "cola", "soda", "sprite", "fanta", "pepsi", "gazéifiée", "pétillante",
    "مشروب غازي", "coca-cola", "cocacola", "hamoud", "selecto", "hayat", "Pepsi",
    "mirinda", "7up", "zero", "light", "sans sucre", "regular", "cherry"
  ],
  "Sauce": [
    "sauce", "mayonnaise", "ketchup", "moutarde", "vinaigrette",
    "chutney", "curry", "pesto", "صلصة", "salça", "heinz", "amora",
    "tomate", "provençale", "barbecue", "poivre"
  ],
  "Conserve": [
    "conserve", "tomate", "concentré", "boîte", "haricots", "pois",
    "lentilles", "thon", "sardine", "maquereau", "mackerel",
    "محفوظ", "muhafaz", "petit navire", "saupiquet", "connétable",
    "pelé", "en purée", "en dés", "entier", "égoutté"
  ],
  "Confiture": [
    "confiture", "jam", "marmelade", "pâte à tartiner", "مربى", "marabba",
    "hero", "andros", "st dalfour", "bonne maman", "helios",
    "fraise", "abricot", "cerise", "myrtille", "figue", "orange",
    "mangue", "framboise", "groseille", "cassis"
  ],
  "Miel": [
    "miel", "honey", "gelée royale", "عسل", "3asal",
    "acacia", "fleur", "montagne", "forestier", "toutes fleurs",
    "romarin", "eucalyptus", "thym"
  ],
  "Snack": [
    "chips", "snack", "apéritif", "cacahuète", "amande", "noix",
    "popcorn", "croustille", "bretzel", "مقبلات", "مسليات",
    "pringles", "lays", "cheetos", "curly", "tortilla", "swiss",
    "sel", "nature", "arôme", "saveur", "paprika", "fromage"
  ],
  "Détergent": [
    "lessive", "détergent", "lessive liquide", "poudre",
    "ariel", "omo", "persil", "tide", "gain", "dash", "liby",
    "lavage", "machine", "linge", "nettoyant"
  ],
  "Vaisselle": [
    "vaisselle", "liquide vaisselle", "produit vaiselle",
    "isis", "pril", "fairy", "dawn", "bonux", "citrol",
    "nettoyer", "lava", "lave", "plaque", "dosette"
  ],
  "Hygiène": [
    "savon", "soap", "gel douche", "douche", "crème hydratante",
    "lotion", "déodorant", "rouleau", "papier hygiénique",
    "صابون", "saboun", "dove", "nivea", "cif", "lysol", "swan",
    "corps", "visage", "mains", "hygiène", "corporel"
  ],
  "Shampooing": [
    "shampoing", "shampoo", "après-shampoing", "soin", "masque",
    "شامبو", "shampo", "pantene", "head & shoulders", "l'oréal", "garnier",
    "elseve", "natural", "herbal", "schwarzkopf",
    "cheveux", "capillaire", "volume", "réparation", "brillance"
  ],
  "Dentifrice": [
    "dentifrice", "toothpaste", "brosse à dents", "brosse", "fil dental",
    "معجون أسنان", "signal", "colgate", "aquafresh", "elmex", "sensodyne", "oral-b",
    "dents", "fraicheur", "blancheur", "protection", "caries"
  ],
  "Autre": []
};

export { KEYWORDS };

export async function fetchProducts(): Promise<any[]> {
  console.log("[FETCH] Starting product ingestion...");
  const allProducts: any[] = [];
  
  const baseUrl = "https://world.openfoodfacts.org/api/v2/search";
  
  for (let page = 1; page <= 10; page++) {
    const url = new URL(baseUrl);
    url.searchParams.append("countries_tags_en", "algeria");
    url.searchParams.append("fields", "code,product_name,product_name_fr,brands,categories_tags,quantity,image_url");
    url.searchParams.append("page_size", "50");
    url.searchParams.append("page", page.toString());
    
    console.log(`[FETCH] Page ${page}...`);
    
    try {
      const res = await fetch(url.toString(), {
        headers: { "User-Agent": "AlgerianPOSEngine/1.0" }
      });

      if (!res.ok) {
        console.log(`[FETCH] HTTP error: ${res.status}`);
        break;
      }
      
      const data = await res.json();
      console.log(`[FETCH] Page ${page}: ${data.count || 0} total, ${data.products?.length || 0} returned`);
      
      if (!data.products || data.products.length === 0) {
        console.log(`[FETCH] No products on page ${page}`);
        break;
      }

      // Add all products with valid barcodes
      for (const p of data.products) {
        if (p.code && p.code.length >= 8) {
          allProducts.push(p);
        }
      }
      
      // Small delay
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`[FETCH] Error:`, err);
      break;
    }
  }

  console.log(`[FETCH] Total products collected: ${allProducts.length}`);
  return allProducts;
}