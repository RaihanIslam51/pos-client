"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-green-100 text-green-700 border-green-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-yellow-100 text-yellow-700 border-yellow-200",
  "bg-red-100 text-red-700 border-red-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-orange-100 text-orange-700 border-orange-200",
];

export default function ListCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories();
      setCategories(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchCategories(); }, []);

  const openEdit = (cat) => {
    setEditItem(cat);
    setEditForm({ name: cat.name, description: cat.description || "" });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateCategory(editItem._id, editForm);
      setEditItem(null);
      fetchCategories();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    setDeletingId(id);
    try {
      await api.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Categories</h2>
          <p className="text-sm text-gray-400">{categories.length} categor{categories.length !== 1 ? "ies" : "y"}</p>
        </div>
        <Link
          href="/dashboard/products/categories/create"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Category
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-3">🏷️</p>
          <p className="font-medium">No categories yet</p>
          <Link href="/dashboard/products/categories/create" className="mt-3 inline-block text-[#1E3A8A] font-semibold text-sm hover:underline">
            + Create first category
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {categories.map((cat, idx) => (
            <div
              key={cat._id}
              className={`rounded-xl border p-4 ${COLORS[idx % COLORS.length]}`}
            >
              <p className="font-bold text-sm truncate">{cat.name}</p>
              {cat.description && (
                <p className="text-xs mt-1 opacity-70 line-clamp-2">{cat.description}</p>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => openEdit(cat)}
                  className="text-xs font-medium hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  disabled={deletingId === cat._id}
                  className="text-xs font-medium opacity-60 hover:underline"
                >
                  {deletingId === cat._id ? "..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1E3A8A]">Edit Category</h3>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Category Name *</label>
                <input
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditItem(null)} className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#1E3A8A] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50">
                  {saving ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
