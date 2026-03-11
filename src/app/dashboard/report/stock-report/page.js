"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function StockReportPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    api.getProducts().then((res) => setProducts(res.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    if (filter === "low") return (p.stock ?? 0) <= (p.alertQuantity || 5) && (p.stock ?? 0) > 0;
    if (filter === "out") return (p.stock ?? 0) === 0;
    if (filter === "ok") return (p.stock ?? 0) > (p.alertQuantity || 5);
    return true;
  });

  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const totalValue = products.reduce((s, p) => s + (p.stock || 0) * (p.costPrice || 0), 0);
  const lowStockCount = products.filter((p) => (p.stock ?? 0) <= (p.alertQuantity || 5) && (p.stock ?? 0) > 0).length;
  const outOfStockCount = products.filter((p) => (p.stock ?? 0) === 0).length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Stock Report</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100"><p className="text-xs text-gray-500">Total Products</p><p className="text-2xl font-bold text-blue-700">{products.length}</p></div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100"><p className="text-xs text-gray-500">Total Stock Units</p><p className="text-2xl font-bold text-purple-700">{totalStock.toLocaleString()}</p></div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100"><p className="text-xs text-gray-500">Low Stock</p><p className="text-2xl font-bold text-yellow-700">{lowStockCount}</p></div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100"><p className="text-xs text-gray-500">Out of Stock</p><p className="text-2xl font-bold text-red-600">{outOfStockCount}</p></div>
      </div>
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex gap-2">
        {["all","ok","low","out"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>
            {f === "all" ? "All" : f === "ok" ? "In Stock" : f === "low" ? "Low Stock" : "Out of Stock"}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500 self-center">Stock Value: ৳{totalValue.toLocaleString()}</span>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Product</th>
              <th className="px-4 py-3 font-semibold text-gray-600">SKU</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Alert Qty</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Current Stock</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Cost/Unit (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Stock Value (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No products found</td></tr>
            ) : filtered.map((p, i) => {
              const stock = p.stock ?? 0;
              const alert = p.alertQuantity || 5;
              const statusLabel = stock === 0 ? "Out of Stock" : stock <= alert ? "Low Stock" : "In Stock";
              const statusCls = stock === 0 ? "bg-red-100 text-red-700" : stock <= alert ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";
              return (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{p.sku || "—"}</td>
                  <td className="px-4 py-3">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3 text-orange-600">{alert}</td>
                  <td className="px-4 py-3 font-bold">{stock}</td>
                  <td className="px-4 py-3">৳{p.costPrice?.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-blue-700">৳{(stock * (p.costPrice || 0)).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCls}`}>{statusLabel}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
