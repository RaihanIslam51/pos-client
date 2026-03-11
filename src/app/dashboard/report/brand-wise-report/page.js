"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function BrandWiseReportPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState("");

  useEffect(() => {
    Promise.all([api.getProducts(), api.getBrands(), api.getSales()])
      .then(([pRes, bRes, sRes]) => { setProducts(pRes.data || []); setBrands(bRes.data || []); setSales(sRes.data || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const brandStats = brands.map((brand) => {
    const brandProducts = products.filter((p) => p.brand?._id === brand._id || p.brand === brand._id);
    const productIds = new Set(brandProducts.map((p) => p._id));
    const brandSales = sales.filter((s) => s.items?.some((item) => productIds.has(item.product?._id || item.product)));
    const revenue = brandSales.reduce((sum, s) => sum + (s.items || []).filter((item) => productIds.has(item.product?._id || item.product)).reduce((ss, item) => ss + (item.total || item.quantity * item.price || 0), 0), 0);
    const totalStock = brandProducts.reduce((s, p) => s + (p.stock || 0), 0);
    return { ...brand, productCount: brandProducts.length, totalStock, revenue };
  });

  const filteredProducts = selectedBrand
    ? products.filter((p) => p.brand?._id === selectedBrand || p.brand === selectedBrand)
    : products;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Brand Wise Report</h1>
      {loading ? <p className="text-gray-400">Loading...</p> : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {brandStats.map((brand) => (
              <div key={brand._id} onClick={() => setSelectedBrand((prev) => prev === brand._id ? "" : brand._id)}
                className={`rounded-xl p-4 border cursor-pointer transition-all ${selectedBrand === brand._id ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 hover:border-blue-300"}`}>
                <p className={`text-sm font-semibold mb-1 ${selectedBrand === brand._id ? "text-white" : "text-gray-700"}`}>{brand.name}</p>
                <p className={`text-xs ${selectedBrand === brand._id ? "text-blue-100" : "text-gray-500"}`}>{brand.productCount} products</p>
                <p className={`text-lg font-bold ${selectedBrand === brand._id ? "text-white" : "text-blue-700"}`}>{brand.totalStock} units</p>
                <p className={`text-xs font-medium mt-1 ${selectedBrand === brand._id ? "text-blue-200" : "text-green-600"}`}>Rev: ৳{brand.revenue.toLocaleString()}</p>
              </div>
            ))}
            {brands.length === 0 && <p className="col-span-4 text-gray-400 text-sm">No brands found</p>}
          </div>

          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 font-semibold text-gray-700 text-sm">
              {selectedBrand ? `${brands.find((b) => b._id === selectedBrand)?.name || ""} Products` : "All Products"}
              <span className="ml-2 text-gray-400 font-normal">({filteredProducts.length})</span>
              {selectedBrand && (
                <button onClick={() => setSelectedBrand("")} className="ml-3 text-xs text-blue-600 hover:underline">Clear</button>
              )}
            </div>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Product</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Brand</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Price (৳)</th>
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
                    <td className="px-4 py-3">{p.brand?.name || "—"}</td>
                    <td className="px-4 py-3">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${(p.stock || 0) === 0 ? "bg-red-100 text-red-700" : (p.stock || 0) <= (p.alertQuantity || 5) ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                        {p.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-blue-700 font-semibold">৳{p.sellingPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3">৳{((p.stock || 0) * (p.costPrice || 0)).toLocaleString()}</td>
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
