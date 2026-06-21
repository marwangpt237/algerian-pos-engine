import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Algerian POS Engine - Product Classification Dashboard",
  description: "Data engine for classifying Algerian products with trust-based feedback system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50 min-h-screen">
        <div className="flex h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-gray-900 text-white p-6 hidden lg:block">
            <div className="mb-8">
              <h1 className="text-xl font-bold text-emerald-400">POS Engine</h1>
              <p className="text-sm text-gray-400">Algerian Products</p>
            </div>
            <nav className="space-y-2">
              <a href="/" className="block px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-emerald-600 transition">
                📊 Dashboard
              </a>
              <a href="/products" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition">
                📦 Products
              </a>
              <a href="/feedback" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition">
                🔄 Feedback
              </a>
              <a href="/customers" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition">
                👥 Customers
              </a>
              <a href="/classify" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition">
                🔍 Classify
              </a>
              <a href="/export" className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition">
                📤 Export
              </a>
            </nav>
          </aside>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}