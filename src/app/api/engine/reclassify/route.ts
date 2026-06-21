import { NextResponse } from 'next/server';
import { getPool, initSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Comprehensive keyword taxonomy for Algerian products
const SCORE_KEYWORDS: Record<string, string[]> = {
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
  ]
};

interface CategoryScore {
  category: string;
  score: number;
  matchedKeywords: string[];
}

function classifyProduct(productName: string, brand: string): { category: string; confidence: number } {
  const text = `${productName} ${brand}`.toLowerCase();
  
  const scores: CategoryScore[] = [];
  
  for (const [category, keywords] of Object.entries(SCORE_KEYWORDS)) {
    let score = 0;
    const matchedKeywords: string[] = [];
    
    for (const kw of keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(text)) {
        score += 1;
        matchedKeywords.push(kw);
      }
      else if (kw.length <= 4 && text.includes(kw)) {
        score += 0.5;
        matchedKeywords.push(kw);
      }
    }
    
    if (score > 0) {
      scores.push({ category, score, matchedKeywords });
    }
  }
  
  scores.sort((a, b) => b.score - a.score);
  
  if (scores.length === 0) {
    return { category: "Autre", confidence: 0 };
  }
  
  const best = scores[0];
  const keywordBonus = Math.min(best.matchedKeywords.length * 0.15, 0.6);
  const scoreBonus = Math.min(best.score / 5, 0.3);
  const baseline = 0.2;
  
  const confidence = Math.min(baseline + keywordBonus + scoreBonus, 1.0);
  
  return { 
    category: best.category, 
    confidence: Math.round(confidence * 100) / 100 
  };
}

export async function POST() {
  try {
    console.log('[RECLASSIFY] Starting reclassification...');
    await initSchema();
    
    const pool = getPool();
    const client = await pool.connect();

    try {
      // Get all products
      const products = await client.query('SELECT id, product_name, brand, category FROM products');
      console.log(`[RECLASSIFY] Found ${products.rows.length} products to reclassify`);
      
      let updated = 0;
      const stats: Record<string, number> = {};
      
      for (const p of products.rows) {
        const result = classifyProduct(p.product_name, p.brand);
        
        if (result.category !== p.category) {
          await client.query(
            'UPDATE products SET category = $1, classification_confidence = $2, last_updated = $3 WHERE id = $4',
            [result.category, result.confidence, new Date().toISOString(), p.id]
          );
          updated++;
        } else {
          // Still update confidence even if category is the same
          await client.query(
            'UPDATE products SET classification_confidence = $1, last_updated = $2 WHERE id = $3',
            [result.confidence, new Date().toISOString(), p.id]
          );
        }
        
        stats[result.category] = (stats[result.category] || 0) + 1;
      }
      
      // Get new stats
      const newStats = await client.query('SELECT COUNT(*)::int as cnt, AVG(classification_confidence)::float as avg FROM products');
      
      console.log(`[RECLASSIFY] Updated ${updated} products, new avg confidence: ${newStats.rows[0].avg}`);
      
      return NextResponse.json({ 
        success: true, 
        data: { 
          message: `Reclassified ${products.rows.length} products`,
          updated_categories: updated,
          total_products: products.rows.length,
          new_avg_confidence: newStats.rows[0].avg,
          category_distribution: stats
        } 
      });
    } finally { 
      client.release(); 
    }
  } catch (error: any) {
    console.error('[RECLASSIFY] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}