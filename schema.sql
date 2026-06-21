-- ==================== ALGERIAN POS ENGINE SCHEMA ====================
-- This schema defines the database structure for the product classification system

-- Products table: stores classified products
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    barcode TEXT UNIQUE NOT NULL,
    product_name TEXT NOT NULL,
    brand TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity TEXT,
    image_url TEXT,
    classification_confidence REAL,
    weight_version INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    last_updated TEXT NOT NULL
);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_confidence ON products(classification_confidence);

-- Customers table: POS system customers who provide feedback
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    type TEXT CHECK(type IN ('chain', 'pharmacy', 'shop', 'unknown')) DEFAULT 'unknown',
    trust_score REAL DEFAULT 0.2,
    created_at TEXT NOT NULL
);

-- Feedback table: classification corrections from customers
CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    barcode TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    predicted_category TEXT NOT NULL,
    correct_category TEXT NOT NULL,
    trust_score REAL DEFAULT 0.2,
    applied INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(id)
);

-- Indexes for feedback
CREATE INDEX IF NOT EXISTS idx_customer_feedback ON feedback(customer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_applied ON feedback(applied);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at);

-- Classifier state table: stores learned weights
CREATE TABLE IF NOT EXISTS classifier_state (
    id TEXT PRIMARY KEY,
    weights TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Dataset versions table: export history
CREATE TABLE IF NOT EXISTS dataset_versions (
    version TEXT PRIMARY KEY,
    product_count INTEGER,
    avg_confidence REAL,
    exported_at TEXT NOT NULL
);

-- ==================== TRUST SCORE DEFAULTS ====================
-- chain: 1.0 (100%) - Supermarket chains, high reliability
-- pharmacy: 0.7 (70%) - Pharmacies, moderate reliability
-- shop: 0.5 (50%) - Local shops, lower reliability
-- unknown: 0.2 (20%) - Unverified sources, minimum weight

-- ==================== SAMPLE DATA ====================
-- Insert sample customers for testing
INSERT OR IGNORE INTO customers (id, name, email, type, trust_score, created_at) VALUES
    ('cust-chain-001', 'Carrefour Algeria', 'contact@carrefour.dz', 'chain', 1.0, datetime('now')),
    ('cust-chain-002', 'Metro Algeria', 'info@metro.dz', 'chain', 1.0, datetime('now')),
    ('cust-pharmacy-001', 'Pharmacie centrale', 'pharmacie@email.dz', 'pharmacy', 0.7, datetime('now')),
    ('cust-shop-001', 'Epicerie du quartier', 'epicerie@email.dz', 'shop', 0.5, datetime('now'));

-- ==================== TAXONOMY (28 categories) ====================
-- Eau, Lait, Yaourt, Fromage, Beurre, Huile, Sucre,
-- Farine, Riz, Semoule, Pâtes, Biscuit, Chocolat, Café,
-- Thé, Jus, Boisson Gazeuse, Sauce, Conserve, Confiture,
-- Miel, Snack, Détergent, Vaisselle, Hygiène, Shampooing,
-- Dentifrice, Autre