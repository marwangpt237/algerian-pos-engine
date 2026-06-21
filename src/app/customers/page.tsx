'use client';

import { useEffect, useState } from 'react';
import { UserPlus, Trash2, Building, Pill, Store, HelpCircle } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  type: 'chain' | 'pharmacy' | 'shop' | 'unknown';
  trust_score: number;
  created_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    type: 'shop' as Customer['type']
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function addCustomer() {
    if (!newCustomer.name || !newCustomer.email) return;
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer)
      });
      const data = await res.json();
      if (data.success) {
        setCustomers([...customers, data.data]);
        setNewCustomer({ name: '', email: '', type: 'shop' });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteCustomer(id: string) {
    if (!confirm('Supprimer ce client ?')) return;
    try {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      setCustomers(customers.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  const typeIcons = {
    chain: Building,
    pharmacy: Pill,
    shop: Store,
    unknown: HelpCircle
  };

  const typeLabels = {
    chain: 'Chaîne',
    pharmacy: 'Pharmacie',
    shop: 'Magasin',
    unknown: 'Non vérifié'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500">Clients du système de feedback</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary flex items-center gap-2"
        >
          <UserPlus size={18} />
          Ajouter un client
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold mb-4">Nouveau client</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nom du client"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={newCustomer.type}
              onChange={(e) => setNewCustomer({...newCustomer, type: e.target.value as Customer['type']})}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="chain">Chaîne de supermarchés (100%)</option>
              <option value="pharmacy">Pharmacie (70%)</option>
              <option value="shop">Magasin (50%)</option>
              <option value="unknown">Non vérifié (20%)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAddForm(false)} className="btn btn-secondary">
              Annuler
            </button>
            <button onClick={addCustomer} className="btn btn-primary">
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400">
            Aucun client enregistré
          </div>
        ) : (
          customers.map(customer => {
            const Icon = typeIcons[customer.type];
            return (
              <div key={customer.id} className="stat-card relative">
                <button
                  onClick={() => deleteCustomer(customer.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${
                    customer.type === 'chain' ? 'bg-emerald-100' :
                    customer.type === 'pharmacy' ? 'bg-blue-100' :
                    customer.type === 'shop' ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={
                      customer.type === 'chain' ? 'text-emerald-600' :
                      customer.type === 'pharmacy' ? 'text-blue-600' :
                      customer.type === 'shop' ? 'text-yellow-600' : 'text-gray-500'
                    } size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{customer.name}</h3>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`trust-badge ${customer.type}`}>
                    {typeLabels[customer.type]}
                  </span>
                  <span className="text-2xl font-bold text-emerald-600">
                    {(customer.trust_score * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}