'use client';

import { useState } from 'react';
import { Search, Play, Loader2 } from 'lucide-react';

const TAXONOMY = [
  "Eau", "Lait", "Yaourt", "Fromage", "Beurre", "Huile", "Sucre",
  "Farine", "Riz", "Semoule", "Pâtes", "Biscuit", "Chocolat", "Café",
  "Thé", "Jus", "Boisson Gazeuse", "Sauce", "Conserve", "Confiture",
  "Miel", "Snack", "Détergent", "Vaisselle", "Hygiène", "Shampooing",
  "Dentifrice", "Autre"
];

export default function ClassifyPage() {
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [result, setResult] = useState<{
    category: string;
    confidence: number;
    scores: Record<string, number>;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [engineRunning, setEngineRunning] = useState(false);

  async function classifyProduct() {
    if (!productName) return;
    setLoading(true);
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName, brand })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function runEngine() {
    setEngineRunning(true);
    try {
      const res = await fetch('/api/engine/run', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        alert('Moteur terminé ! ' + data.data.message);
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (err) {
      alert('Erreur: ' + err);
    } finally {
      setEngineRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classification</h1>
          <p className="text-gray-500">Classifier les produits manuellement</p>
        </div>
        <button
          onClick={runEngine}
          disabled={engineRunning}
          className="btn btn-primary flex items-center gap-2"
        >
          {engineRunning ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              En cours...
            </>
          ) : (
            <>
              <Play size={18} />
              Lancer le moteur
            </>
          )}
        </button>
      </div>

      {/* Classify Form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold mb-4">Classifier un produit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nom du produit"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="Marque (optionnel)"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button
          onClick={classifyProduct}
          disabled={loading || !productName}
          className="btn btn-secondary mt-4 flex items-center gap-2"
        >
          <Search size={18} />
          Classifier
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-semibold">Résultat</h2>
              <span className={`category-badge text-lg ${result.category.toLowerCase().replace(' ', '-')}`}>
                {result.category}
              </span>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-600">
                {(result.confidence * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-500">Confiance</p>
            </div>
          </div>

          {/* Score Breakdown */}
          <h3 className="font-medium mb-3">Score par catégorie</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(result.scores)
              .filter(([, score]) => score > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([category, score]) => (
                <div 
                  key={category}
                  className={`p-3 rounded-lg border ${
                    category === result.category 
                      ? 'border-emerald-500 bg-emerald-50' 
                      : 'border-gray-100'
                  }`}
                >
                  <p className="text-sm font-medium">{category}</p>
                  <p className={`text-lg font-bold ${
                    category === result.category ? 'text-emerald-600' : 'text-gray-600'
                  }`}>
                    {score.toFixed(2)}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quick Classify */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold mb-4">Taxonomie disponible</h2>
        <div className="flex flex-wrap gap-2">
          {TAXONOMY.map(cat => (
            <span key={cat} className={`category-badge cursor-pointer hover:opacity-80`}>
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}