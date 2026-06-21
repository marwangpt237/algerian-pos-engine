# 🛒 Algerian POS Engine

A product classification data engine for Algerian POS (Point of Sale) systems with trust-based feedback learning.

![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![License](https://img.shields.io/badge/License-MIT-green)

## 🎯 Features

- **Product Classification**: Automatically classify products into 28 categories (Eau, Lait, Fromage, etc.)
- **Open Food Facts Integration**: Fetch and ingest product data from the Open Food Facts API
- **Trust-Based Feedback**: Machine learning-like system that adjusts classifications based on customer corrections
- **Deduplication**: Remove duplicate products using barcode matching and fuzzy matching
- **Versioned Exports**: Export datasets as JSON, CSV, and SQLite snapshots
- **Admin Dashboard**: Full-featured web interface for managing products, feedback, and customers

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── page.tsx           # Dashboard
│   │   ├── products/          # Products management
│   │   ├── feedback/          # Feedback management
│   │   ├── customers/         # Customer management
│   │   ├── classify/          # Manual classification
│   │   └── export/            # Data export
│   ├── stages/                # Data engine stages
│   │   ├── fetch.ts           # Open Food Facts ingestion
│   │   ├── normalize.ts       # Text normalization
│   │   ├── classify.ts        # Product classification
│   │   ├── deduplicate.ts     # Deduplication
│   │   ├── reweight.ts        # Weight adjustment
│   │   ├── feedback.ts        # Feedback recording
│   │   └── export.ts          # Dataset export
│   ├── engine.ts              # Main orchestrator
│   └── types.ts               # Type definitions
├── exports/                   # Exported datasets
├── products.db                # SQLite database
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd algerian-pos-engine

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
```

### Development

```bash
# Run the development server
npm run dev

# Run the data engine manually
npm run engine:run
```

### Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📊 Dashboard

The dashboard provides:

- **Overview Stats**: Total products, average confidence, customers, pending feedback
- **Category Distribution**: Visual breakdown of products by category
- **Recent Feedback**: Latest classification corrections
- **Export History**: Track dataset versions

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/api/products` | List products (paginated) |
| GET | `/api/feedback` | List feedback |
| POST | `/api/feedback` | Record new feedback |
| GET | `/api/customers` | List customers |
| POST | `/api/customers` | Add customer |
| DELETE | `/api/customers/[id]` | Delete customer |
| POST | `/api/classify` | Classify a product |
| POST | `/api/engine/run` | Run the data engine |
| GET | `/api/export` | List export versions |
| POST | `/api/export` | Trigger new export |

## 📚 Categories (Taxonomy)

| Category | Keywords |
|----------|----------|
| Eau | eau, water, mineral, spring |
| Lait | lait, milk, poudre de lait |
| Yaourt | yaourt, yogurt |
| Fromage | fromage, cheese |
| Beurre | beurre, butter |
| Huile | huile, oil, tournesol, olive |
| ... | (28 total categories) |

## 🤝 Trust Scores

Customer feedback is weighted by trust score:

| Type | Trust Score | Description |
|------|-------------|-------------|
| chain | 100% | Supermarket chains |
| pharmacy | 70% | Pharmacies |
| shop | 50% | Local shops |
| unknown | 20% | Unverified |

## 🔒 Environment Variables

```env
DATABASE_PATH=./products.db
EXPORT_DIR=./exports
NODE_ENV=development
```

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add `VERCEL_TOKEN` to GitHub Secrets
4. Deploy automatically via GitHub Actions

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📝 License

This project is licensed under the MIT License.

---

Built with ❤️ for the Algerian POS community