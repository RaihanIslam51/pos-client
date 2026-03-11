"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import PageSkeleton from "@/components/ui/PageSkeleton";
import Swal from "sweetalert2";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get("search") || "";
  const filterCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({
    name: "", barcode: "", category: "", description: "",
    purchasePrice: "", sellingPrice: "", unit: "pcs",
    stock: "", alertQuantity: "10", expiryDate: "",
  });
  const [saving, setSaving] = useState(false);
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
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ name: "", barcode: "", category: "", description: "", purchasePrice: "", sellingPrice: "", unit: "pcs", stock: "", alertQuantity: "10", expiryDate: "" });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      barcode: product.barcode || "",
      category: product.category?._id || product.category || "",
      description: product.description || "",
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      unit: product.unit,
      stock: product.stock,
      alertQuantity: product.alertQuantity,
      expiryDate: product.expiryDate ? product.expiryDate.split("T")[0] : "",
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        stock: Number(form.stock),
        alertQuantity: Number(form.alertQuantity),
      };
      if (!data.barcode) delete data.barcode;
      if (!data.expiryDate) delete data.expiryDate;
      if (editProduct) {
        await api.updateProduct(editProduct._id, data);
        setShowModal(false);
        fetchProducts();
        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: `"${data.name}" successfully updated.`,
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      } else {
        await api.createProduct(data);
        setShowModal(false);
        fetchProducts();
        Swal.fire({
          icon: "success",
          title: "Product Added!",
          text: `"${data.name}" has been saved to the database.`,
          timer: 2500,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      await api.deleteProduct(id);
      fetchProducts();
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Product has been removed.",
        timer: 1800,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: err.message || "Could not delete the product.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
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
        <button
          onClick={openAdd}
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Product</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Buy Price</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Sell Price</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Stock</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                </td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">📦</p>No products found
                </td></tr>
              ) : (
                products.map((product, idx) => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{product.name}</p>
                      {product.barcode && <p className="text-xs text-gray-400">{product.barcode}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.category?.name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">৳{product.purchasePrice}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#1E3A8A]">৳{product.sellingPrice}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock <= product.alertQuantity ? "text-red-600" : "text-green-600"}`}>
                        {product.stock} {product.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {product.stock > 0 ? "In Stock" : "Out"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(product)} className="text-[#1E3A8A] hover:underline text-xs font-medium">Edit</button>
                        <button onClick={() => handleDelete(product._id)} disabled={deletingId === product._id} className="text-red-500 hover:underline text-xs font-medium">
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
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1E3A8A]">{editProduct ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Product Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" placeholder="Enter product name" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Barcode</label>
                  <input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" placeholder="Optional" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Category *</label>
                  <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Purchase Price *</label>
                  <input required type="number" min="0" step="0.01" value={form.purchasePrice} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Selling Price *</label>
                  <input required type="number" min="0" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white">
                    {["pcs", "kg", "gram", "litre", "ml", "box", "pack", "dozen", "meter"].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Stock Quantity</label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Alert Qty</label>
                  <input type="number" min="0" value={form.alertQuantity} onChange={(e) => setForm({ ...form, alertQuantity: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" placeholder="10" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Expiry Date</label>
                  <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none" placeholder="Optional" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#1E3A8A] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50">
                  {saving ? "Saving..." : editProduct ? "Update" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<PageSkeleton rows={8} hasToolbar />}>
      <ProductsContent />
    </Suspense>
  );
}
