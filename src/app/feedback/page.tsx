'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Feedback {
  id: string;
  barcode: string;
  customer_id: string;
  predicted_category: string;
  correct_category: string;
  trust_score: number;
  applied: boolean;
  created_at: string;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'applied'>('all');

  useEffect(() => {
    fetchFeedback();
  }, [filter]);

  async function fetchFeedback() {
    setLoading(true);
    try {
      const res = await fetch(`/api/feedback?filter=${filter}`);
      const data = await res.json();
      if (data.success) {
        setFeedback(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
          <p className="text-gray-500">Corrections de classification des clients</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-100 inline-flex">
        {(['all', 'pending', 'applied'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === f 
                ? 'bg-emerald-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f === 'all' ? 'Tous' : f === 'pending' ? 'En attente' : 'Appliqués'}
          </button>
        ))}
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Barcode</th>
              <th>Prédit</th>
              <th>Correct</th>
              <th>Confiance client</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                </td>
              </tr>
            ) : feedback.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">
                  Aucun feedback {filter !== 'all' ? filter : ''}
                </td>
              </tr>
            ) : (
              feedback.map(fb => (
                <tr key={fb.id}>
                  <td className="font-mono text-sm">{fb.barcode}</td>
                  <td>
                    <span className="text-red-500 line-through">{fb.predicted_category}</span>
                  </td>
                  <td>
                    <span className="text-emerald-600 font-medium">{fb.correct_category}</span>
                  </td>
                  <td>
                    <span className={`trust-badge ${
                      fb.trust_score >= 0.8 ? 'chain' : 
                      fb.trust_score >= 0.5 ? 'shop' : 'unknown'
                    }`}>
                      {(fb.trust_score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td>
                    {fb.applied ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <CheckCircle size={16} />
                        Appliqué
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600">
                        <AlertCircle size={16} />
                        En attente
                      </span>
                    )}
                  </td>
                  <td className="text-gray-500 text-sm">
                    {new Date(fb.created_at).toLocaleDateString('fr-DZ')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AlertCircle className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{feedback.filter(f => !f.applied).length}</p>
              <p className="text-sm text-gray-500">En attente</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircle className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{feedback.filter(f => f.applied).length}</p>
              <p className="text-sm text-gray-500">Appliqués</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <XCircle className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold">{feedback.length}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}