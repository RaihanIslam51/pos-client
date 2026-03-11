"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function PriceAllPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getProducts().then((r) => setProducts(r.data)),
      api.getCategories().then((r) => setCategories(r.data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !category || p.category?._id === category;
    return matchSearch && matchCat;
  });

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Price List</h2>
          <p className="text-sm text-gray-400">{filtered.length} products</p>
        </div>
        <button
          onClick={handlePrint}
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Price List
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
          <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Product</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Brand</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Unit</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Buy Price</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Sell Price</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Wholesale</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-14 text-gray-400 text-sm"><p className="text-4xl mb-2">💰</p>No products found</td></tr>
              ) : (
                filtered.map((p, idx) => {
                  const margin = p.purchasePrice > 0
                    ? (((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100).toFixed(1)
                    : "—";
                  return (
                    <tr key={p._id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.productCode || p.barcode || ""}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.category?.name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.brand?.name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.unit || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 text-right">৳{p.purchasePrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm font-bold text-[#1E3A8A] text-right">৳{p.sellingPrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-right">৳{(p.wholeSellPrice || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-semibold ${Number(margin) > 0 ? "text-green-600" : "text-red-600"}`}>
                          {margin !== "—" ? `${margin}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
