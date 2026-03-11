"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function UpdateCostPage() {
  const [products, setProducts] = useState([]);
  const [costs, setCosts] = useState({});
  const [sellPrices, setSellPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [search, setSearch] = useState("");
  const [successIds, setSuccessIds] = useState([]);

  useEffect(() => {
    api.getProducts().then((r) => {
      setProducts(r.data);
      const c = {}, s = {};
      r.data.forEach((p) => { c[p._id] = p.purchasePrice; s[p._id] = p.sellingPrice; });
      setCosts(c);
      setSellPrices(s);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleUpdate = async (product) => {
    setSaving((prev) => ({ ...prev, [product._id]: true }));
    try {
      await api.updateProduct(product._id, {
        purchasePrice: Number(costs[product._id]),
        sellingPrice: Number(sellPrices[product._id]),
      });
      setSuccessIds((prev) => [...prev, product._id]);
      setTimeout(() => setSuccessIds((prev) => prev.filter((id) => id !== product._id)), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Update Cost & Price</h2>
        <p className="text-sm text-gray-400">Quickly update purchase cost and selling price for all products</p>
      </div>

      <div className="relative max-w-xs">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Product</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Current Cost</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">New Cost (৳)</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">New Sell Price (৳)</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]" /></td></tr>
              ) : filtered.map((p, idx) => (
                <tr key={p._id} className={`hover:bg-gray-50 transition-colors ${successIds.includes(p._id) ? "bg-green-50" : ""}`}>
                  <td className="px-5 py-3 text-sm text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.productCode || "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">৳{p.purchasePrice}</td>
                  <td className="px-4 py-2.5">
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-2 text-xs text-gray-400">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={costs[p._id] ?? ""}
                        onChange={(e) => setCosts({ ...costs, [p._id]: e.target.value })}
                        className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-2 text-xs text-gray-400">৳</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={sellPrices[p._id] ?? ""}
                        onChange={(e) => setSellPrices({ ...sellPrices, [p._id]: e.target.value })}
                        className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {successIds.includes(p._id) ? (
                      <span className="text-green-600 text-xs font-semibold flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Saved
                      </span>
                    ) : (
                      <button
                        onClick={() => handleUpdate(p)}
                        disabled={saving[p._id]}
                        className="bg-[#1E3A8A] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
                      >
                        {saving[p._id] ? "..." : "Update"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
