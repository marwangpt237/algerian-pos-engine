// ==================== CANONICAL TAXONOMY ====================
// This is IMMUTABLE. All classifications map into this set.
export const TAXONOMY = [
  "Eau",
  "Lait",
  "Yaourt",
  "Fromage",
  "Beurre",
  "Huile",
  "Sucre",
  "Farine",
  "Riz",
  "Semoule",
  "Pâtes",
  "Biscuit",
  "Chocolat",
  "Café",
  "Thé",
  "Jus",
  "Boisson Gazeuse",
  "Sauce",
  "Conserve",
  "Confiture",
  "Miel",
  "Snack",
  "Détergent",
  "Vaisselle",
  "Hygiène",
  "Shampooing",
  "Dentifrice",
  "Autre"
] as const;

export type Category = typeof TAXONOMY[number];

// ==================== TYPES ====================
export interface Product {
  id: string;
  barcode: string;
  product_name: string;
  brand: string;
  category: Category;
  quantity: string | null;
  image_url: string | null;
  classification_confidence: number;
  weight_version: number;
  created_at: string;
  last_updated: string;
}

export interface ClassifierWeights {
  [key: string]: {
    [category in Category]?: number;
  };
}

export interface Feedback {
  id: string;
  barcode: string;
  customer_id: string;
  predicted_category: Category;
  correct_category: Category;
  trust_score: number;
  applied: boolean;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  type: "chain" | "pharmacy" | "shop" | "unknown";
  trust_score: number; // 1.0 = chain, 0.5 = shop, 0.2 = unverified
  created_at: string;
}

export interface DatasetVersion {
  version: string; // YYYY-MM-DD-HHmm
  product_count: number;
  avg_confidence: number;
  changelog: string[];
  exported_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DashboardStats {
  total_products: number;
  avg_confidence: number;
  category_counts: Record<Category, number>;
  recent_feedback: Feedback[];
  last_export?: DatasetVersion;
}

// Customer type for display
export type CustomerType = Customer['type'];
export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  chain: "Chaîne de supermarchés",
  pharmacy: "Pharmacie",
  shop: "Magasin",
  unknown: "Non vérifié"
};

export const TRUST_SCORES: Record<CustomerType, number> = {
  chain: 1.0,
  pharmacy: 0.7,
  shop: 0.5,
  unknown: 0.2
};