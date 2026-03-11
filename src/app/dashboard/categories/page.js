"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Swal from "sweetalert2";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      setCategories(res.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditCategory(null);
    setForm({ name: "", description: "" });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditCategory(cat);
    setForm({ name: cat.name, description: cat.description || "" });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editCategory) {
        await api.updateCategory(editCategory._id, form);
        setShowModal(false);
        fetchCategories();
        Swal.fire({ icon: "success", title: "Updated!", text: `"${form.name}" has been updated.`, timer: 2000, showConfirmButton: false, timerProgressBar: true });
      } else {
        await api.createCategory(form);
        setShowModal(false);
        fetchCategories();
        Swal.fire({ icon: "success", title: "Category Added!", text: `"${form.name}" has been saved.`, timer: 2000, showConfirmButton: false, timerProgressBar: true });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed!", text: err.message || "Could not connect to server. Make sure the server is running." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({ title: "Delete Category?", text: "This cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", cancelButtonColor: "#6b7280", confirmButtonText: "Yes, delete!", cancelButtonText: "Cancel" });
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      await api.deleteCategory(id);
      fetchCategories();
      Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false, timerProgressBar: true });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Failed!", text: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  const colorClasses = [
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-purple-100 text-purple-700",
    "bg-yellow-100 text-yellow-700",
    "bg-pink-100 text-pink-700",
    "bg-orange-100 text-orange-700",
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{categories.length} categories total</p>
        <button
          onClick={openAdd}
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Category
        </button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A8A]"></div></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📂</p>
          <p className="font-medium">No categories yet</p>
          <p className="text-sm mt-1">Start by adding your first category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <div key={cat._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${colorClasses[idx % colorClasses.length]}`}>
                  {cat.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => handleDelete(cat._id)} disabled={deletingId === cat._id} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800">{cat.name}</h3>
              {cat.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>}
              <div className="mt-3 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1E3A8A]">{editCategory ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Category Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" placeholder="e.g., Medicines, Electronics" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none" placeholder="Optional description" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#1E3A8A] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50">
                  {saving ? "Saving..." : editCategory ? "Update" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
