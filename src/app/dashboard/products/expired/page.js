"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ExpiredProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProducts()
      .then((r) => {
        const now = new Date();
        const thirtyDays = new Date();
        thirtyDays.setDate(thirtyDays.getDate() + 30);

        const expiredOrExpiring = r.data.filter((p) => {
          if (!p.expiryDate) return false;
          const exp = new Date(p.expiryDate);
          return exp <= thirtyDays;
        });
        expiredOrExpiring.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
        setProducts(expiredOrExpiring);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getStatus = (expiryDate) => {
    const now = new Date();
    const exp = new Date(expiryDate);
    const days = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: "Expired", cls: "bg-red-100 text-red-700", days };
    if (days <= 7) return { label: `${days}d left`, cls: "bg-orange-100 text-orange-700", days };
    return { label: `${days}d left`, cls: "bg-yellow-100 text-yellow-700", days };
  };

  const expired = products.filter((p) => new Date(p.expiryDate) < new Date());
  const expiring = products.filter((p) => new Date(p.expiryDate) >= new Date());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Expired Products</h2>
        <p className="text-sm text-gray-400 mt-0.5">Products that are expired or expiring within 30 days</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-red-600">{expired.length}</p>
          <p className="text-sm text-red-500 font-medium">Already Expired</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-orange-600">{expiring.filter((p) => {
            const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
            return days <= 7;
          }).length}</p>
          <p className="text-sm text-orange-500 font-medium">Expiring in 7 days</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-2xl font-bold text-yellow-600">{expiring.length}</p>
          <p className="text-sm text-yellow-600 font-medium">Expiring in 30 days</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Product</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Stock</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Expiry Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]" />
                </td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-2">✅</p>
                  <p className="font-medium">No expired or expiring products</p>
                </td></tr>
              ) : (
                products.map((product, idx) => {
                  const status = getStatus(product.expiryDate);
                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                        {product.barcode && <p className="text-xs text-gray-400">{product.barcode}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{product.category?.name || "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{product.stock} {product.unit}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(product.expiryDate).toLocaleDateString("en-BD", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${status.cls}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/products/create?edit=${product._id}`} className="text-[#1E3A8A] hover:underline text-xs font-medium">
                          Edit
                        </Link>
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
