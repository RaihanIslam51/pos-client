"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function ProductsListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get("search") || "";
  const filterCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    api.getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filterCategory) params.append("category", filterCategory);
      const res = await api.getProducts(params.toString() ? `?${params}` : "");
      setProducts(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    setDeletingId(id);
    try {
      await api.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <input
              type="text"
              placeholder="Search products..."
              defaultValue={search}
              onChange={(e) => setParam("search", e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setParam("category", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
        <Link
          href="/dashboard/products/create"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Product</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Code</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Brand</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Buy Price</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Sell Price</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Stock</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-14 text-gray-400 text-sm">
                    <p className="text-4xl mb-2">📦</p>
                    <p>No products found</p>
                    <Link href="/dashboard/products/create" className="mt-3 inline-block text-[#1E3A8A] font-semibold text-sm hover:underline">
                      + Create your first product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                      {product.barcode && <p className="text-xs text-gray-400">{product.barcode}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 font-mono">{product.productCode || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.category?.name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.brand?.name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">৳{product.purchasePrice}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#1E3A8A]">৳{product.sellingPrice}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock <= product.alertQuantity ? "text-red-600" : "text-green-600"}`}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <Link href={`/dashboard/products/create?edit=${product._id}`} className="text-[#1E3A8A] hover:underline text-xs font-medium">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id)}
                          disabled={deletingId === product._id}
                          className="text-red-500 hover:underline text-xs font-medium"
                        >
                          {deletingId === product._id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {products.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
            {products.length} product{products.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsListPage() {
  return (
    <Suspense fallback={
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded-lg w-80" />
        <div className="bg-white rounded-xl border border-gray-200 h-64" />
      </div>
    }>
      <ProductsListContent />
    </Suspense>
  );
}
