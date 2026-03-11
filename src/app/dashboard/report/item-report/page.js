"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function ItemReportPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getProducts().then((res) => setProducts(res.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Item Report</h1>
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Item Name</th>
              <th className="px-4 py-3 font-semibold text-gray-600">SKU</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Brand</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Unit</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Cost (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Price (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No items found</td></tr>
            ) : filtered.map((p, i) => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 font-mono text-gray-500">{p.sku || "—"}</td>
                <td className="px-4 py-3">{p.category?.name || "—"}</td>
                <td className="px-4 py-3">{p.brand?.name || "—"}</td>
                <td className="px-4 py-3">{p.unit?.name || "—"}</td>
                <td className="px-4 py-3">৳{p.costPrice?.toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold text-blue-700">৳{p.sellingPrice?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock <= (p.alertQuantity || 5) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {p.stock ?? 0}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
