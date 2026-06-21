'use client';

import { useEffect, useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Database } from 'lucide-react';

interface ExportVersion {
  version: string;
  product_count: number;
  avg_confidence: number;
  exported_at: string;
}

export default function ExportPage() {
  const [versions, setVersions] = useState<ExportVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchVersions();
  }, []);

  async function fetchVersions() {
    setLoading(true);
    try {
      const res = await fetch('/api/export');
      const data = await res.json();
      if (data.success) {
        setVersions(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function triggerExport() {
    setExporting(true);
    try {
      const res = await fetch('/api/export', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await fetchVersions();
        alert('Export réussi !');
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (err) {
      alert('Erreur: ' + err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Export</h1>
          <p className="text-gray-500">Exporter les données du système</p>
        </div>
        <button
          onClick={triggerExport}
          disabled={exporting}
          className="btn btn-primary flex items-center gap-2"
        >
          <Download size={18} />
          {exporting ? 'Export en cours...' : 'Nouvel export'}
        </button>
      </div>

      {/* Export Formats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileJson className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">JSON</h3>
              <p className="text-sm text-gray-500">Données structurées</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileSpreadsheet className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">CSV</h3>
              <p className="text-sm text-gray-500">Pour Excel / Sheets</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Database className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold">SQLite</h3>
              <p className="text-sm text-gray-500">Base de données portable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Historique des versions</h2>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Nombre de produits</th>
              <th>Confiance moyenne</th>
              <th>Date d'export</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                </td>
              </tr>
            ) : versions.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">
                  Aucun export disponible
                </td>
              </tr>
            ) : (
              versions.map(v => (
                <tr key={v.version}>
                  <td className="font-mono font-medium">{v.version}</td>
                  <td>{v.product_count.toLocaleString()}</td>
                  <td>{(v.avg_confidence * 100).toFixed(1)}%</td>
                  <td className="text-gray-500">
                    {new Date(v.exported_at).toLocaleDateString('fr-DZ')}
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline text-sm">
                        JSON
                      </button>
                      <button className="text-green-600 hover:underline text-sm">
                        CSV
                      </button>
                      <button className="text-purple-600 hover:underline text-sm">
                        DB
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}