"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function CategoryWiseStockPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("");

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([pRes, cRes]) => { setProducts(pRes.data || []); setCategories(cRes.data || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const categoryStats = categories.map((cat) => {
    const catProducts = products.filter((p) => p.category?._id === cat._id || p.category === cat._id);
    const totalStock = catProducts.reduce((s, p) => s + (p.stock || 0), 0);
    const stockValue = catProducts.reduce((s, p) => s + (p.stock || 0) * (p.costPrice || 0), 0);
    const lowStock = catProducts.filter((p) => (p.stock || 0) <= (p.alertQuantity || 5)).length;
    return { ...cat, productCount: catProducts.length, totalStock, stockValue, lowStock };
  });

  const filteredProducts = selectedCat
    ? products.filter((p) => p.category?._id === selectedCat || p.category === selectedCat)
    : products;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Category Wise Stock</h1>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {categoryStats.map((cat) => (
              <div key={cat._id} onClick={() => setSelectedCat((prev) => prev === cat._id ? "" : cat._id)}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${selectedCat === cat._id ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 hover:border-blue-300"}`}>
                <p className={`text-sm font-semibold mb-2 ${selectedCat === cat._id ? "text-white" : "text-gray-700"}`}>{cat.name}</p>
                <p className={`text-xs ${selectedCat === cat._id ? "text-blue-100" : "text-gray-500"}`}>{cat.productCount} products</p>
                <p className={`text-lg font-bold ${selectedCat === cat._id ? "text-white" : "text-blue-700"}`}>{cat.totalStock} units</p>
                {cat.lowStock > 0 && <p className={`text-xs mt-1 ${selectedCat === cat._id ? "text-yellow-200" : "text-yellow-600"}`}>{cat.lowStock} low stock</p>}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 font-semibold text-gray-700 text-sm">
              {selectedCat ? `${categories.find((c) => c._id === selectedCat)?.name || ""} Products` : "All Products"}
              <span className="ml-2 text-gray-400 font-normal">({filteredProducts.length})</span>
              {selectedCat && (
                <button onClick={() => setSelectedCat("")} className="ml-3 text-xs text-blue-600 hover:underline">Clear filter</button>
              )}
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Product</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">SKU</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Alert Qty</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Stock Value (৳)</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No products found</td></tr>
                ) : filteredProducts.map((p, i) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3 font-mono text-gray-500">{p.sku || "—"}</td>
                    <td className="px-4 py-3 text-orange-600">{p.alertQuantity || 5}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${(p.stock || 0) === 0 ? "bg-red-100 text-red-700" : (p.stock || 0) <= (p.alertQuantity || 5) ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {p.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-blue-700 font-semibold">৳{((p.stock || 0) * (p.costPrice || 0)).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
