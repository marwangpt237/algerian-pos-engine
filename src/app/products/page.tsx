'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

interface Product {
  id: string;
  barcode: string;
  product_name: string;
  brand: string;
  category: string;
  quantity: string | null;
  image_url: string | null;
  classification_confidence: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 20;

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(categoryFilter && { category: categoryFilter }),
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
        setTotalPages(data.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [
    'Eau', 'Lait', 'Yaourt', 'Fromage', 'Beurre', 'Huile', 'Sucre',
    'Farine', 'Riz', 'Semoule', 'Pâtes', 'Biscuit', 'Chocolat', 'Café',
    'Thé', 'Jus', 'Boisson Gazeuse', 'Sauce', 'Conserve', 'Confiture',
    'Miel', 'Snack', 'Détergent', 'Vaisselle', 'Hygiène', 'Shampooing',
    'Dentifrice', 'Autre'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Gérer les produits classificès</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par nom, barcode ou marque..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Toutes les catégories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Nom du produit</th>
              <th>Marque</th>
              <th>Catégorie</th>
              <th>Quantité</th>
              <th>Confiance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  Aucun produit trouvé
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id}>
                  <td className="font-mono text-sm">{product.barcode}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.product_name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                          📦
                        </div>
                      )}
                      <span className="font-medium">{product.product_name}</span>
                    </div>
                  </td>
                  <td className="text-gray-600">{product.brand}</td>
                  <td>
                    <span className={`category-badge ${product.category.toLowerCase().replace(' ', '-')}`}>
                      {product.category}
                    </span>
                  </td>
                  <td className="text-gray-500">{product.quantity || '-'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            product.classification_confidence >= 0.8 ? 'bg-emerald-500' :
                            product.classification_confidence >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${product.classification_confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500">
                        {(product.classification_confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="btn btn-secondary disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-gray-600">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="btn btn-secondary disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}