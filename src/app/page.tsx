'use client';

import { useEffect, useState } from 'react';
import { Package, Users, MessageSquare, TrendingUp, Database, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

// Types for dashboard data
interface DashboardData {
  stats: {
    total_products: number;
    avg_confidence: number;
    total_customers: number;
    pending_feedback: number;
  };
  category_distribution: Record<string, number>;
  recent_feedback: Array<{
    id: string;
    barcode: string;
    predicted_category: string;
    correct_category: string;
    trust_score: number;
    created_at: string;
  }>;
  last_export?: {
    version: string;
    product_count: number;
    avg_confidence: number;
    exported_at: string;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(apiData => {
        if (apiData.success && apiData.data) {
          setData(apiData.data);
        } else {
          setError(apiData.error || 'Failed to load dashboard data');
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h2 className="text-red-800 font-semibold">Erreur de chargement</h2>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 btn btn-secondary"
        >
          Réessayer
        </button>
      </div>
    );
  }

  const stats = data?.stats || { total_products: 0, avg_confidence: 0, total_customers: 0, pending_feedback: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Vue d'ensemble du système de classification</p>
        </div>
        <div className="flex gap-2">
          <Link href="/classify" className="btn btn-primary flex items-center gap-2">
            <Database size={18} />
            Lancer le moteur
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Package className="text-emerald-600" size={24} />
            </div>
            <span className="text-xs text-gray-500">Total</span>
          </div>
          <p className="text-3xl font-bold mt-4">{stats.total_products.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Produits classificès</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <span className="text-xs text-gray-500">Moyenne</span>
          </div>
          <p className="text-3xl font-bold mt-4">{(stats.avg_confidence * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-500">Confiance moyenne</p>
          <div className="confidence-bar mt-2">
            <div 
              className="confidence-fill bg-blue-500" 
              style={{ width: `${stats.avg_confidence * 100}%` }}
            />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
            <span className="text-xs text-gray-500">Clients</span>
          </div>
          <p className="text-3xl font-bold mt-4">{stats.total_customers}</p>
          <p className="text-sm text-gray-500">Clients enregistres</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div className="p-3 bg-amber-100 rounded-lg">
              <MessageSquare className="text-amber-600" size={24} />
            </div>
            <span className="text-xs text-gray-500">En attente</span>
          </div>
          <p className="text-3xl font-bold mt-4">{stats.pending_feedback}</p>
          <p className="text-sm text-gray-500">Feedbacks en attente</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Package className="text-emerald-600" size={20} />
            Distribution par catégorie
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data?.category_distribution && Object.entries(data.category_distribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ 
                          width: `${(count / Math.max(...Object.values(data.category_distribution))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">{count}</span>
                  </div>
                </div>
              ))}
            {(!data?.category_distribution || Object.keys(data.category_distribution).length === 0) && (
              <p className="text-gray-400 text-center py-4">Aucune donnée disponible</p>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="text-emerald-600" size={20} />
              Feedback récent
            </h2>
            <Link href="/feedback" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
              Voir tout <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data?.recent_feedback?.slice(0, 5).map((fb) => (
              <div key={fb.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-mono text-gray-500">{fb.barcode.slice(0, 8)}...</p>
                  <p className="text-sm">
                    <span className="text-red-500 line-through">{fb.predicted_category}</span>
                    {' → '}
                    <span className="text-emerald-600 font-medium">{fb.correct_category}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className={`trust-badge ${fb.trust_score >= 0.8 ? 'chain' : fb.trust_score >= 0.5 ? 'shop' : 'unknown'}`}>
                    {(fb.trust_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
            {(!data?.recent_feedback || data.recent_feedback.length === 0) && (
              <p className="text-gray-400 text-center py-4">Aucun feedback recent</p>
            )}
          </div>
        </div>
      </div>

      {/* Last Export */}
      {data?.last_export && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="font-semibold">Dernier Export</h2>
              <p className="text-sm opacity-80">Version {data.last_export.version}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{data.last_export.product_count.toLocaleString()}</p>
              <p className="text-sm opacity-80">produits exportés</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Nav */}
      <nav className="lg:hidden mobile-nav">
        <a href="/" className="flex flex-col items-center p-2 text-white">
          <Package size={20} />
          <span className="text-xs">Dashboard</span>
        </a>
        <a href="/products" className="flex flex-col items-center p-2 text-gray-400">
          <Package size={20} />
          <span className="text-xs">Products</span>
        </a>
        <a href="/feedback" className="flex flex-col items-center p-2 text-gray-400">
          <MessageSquare size={20} />
          <span className="text-xs">Feedback</span>
        </a>
        <a href="/classify" className="flex flex-col items-center p-2 text-gray-400">
          <Database size={20} />
          <span className="text-xs">Classify</span>
        </a>
      </nav>
    </div>
  );
}