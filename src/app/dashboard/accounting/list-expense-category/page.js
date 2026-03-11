"use client";
import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function ListExpenseCategoryContent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.getExpenseCategories(params);
      setCategories(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchCategories, 300);
    return () => clearTimeout(t);
  }, [fetchCategories]);

  const startEdit = (cat) => { setEditingId(cat._id); setEditForm({ name: cat.name, description: cat.description }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleSave = async (id) => {
    setSavingId(id);
    try {
      await api.updateExpenseCategory(id, editForm);
      setEditingId(null);
      fetchCategories();
    } catch (err) { alert(err.message); } finally { setSavingId(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    setDeletingId(id);
    try {
      await api.deleteExpenseCategory(id);
      fetchCategories();
    } catch (err) { alert(err.message); } finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        <Link href="/dashboard/accounting/add-expense-category"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Category
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Description</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="text-center py-10"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400 text-sm"><p className="text-3xl mb-2">🗂️</p>No categories found</td></tr>
              ) : (
                categories.map((cat, idx) => (
                  <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {editingId === cat._id ? (
                        <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-36 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                      ) : <span className="text-sm font-medium text-gray-800">{cat.name}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === cat._id ? (
                        <input value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-48 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                      ) : <span className="text-sm text-gray-500">{cat.description || "—"}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === cat._id ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleSave(cat._id)} disabled={savingId === cat._id}
                            className="text-green-600 hover:underline text-xs font-medium">{savingId === cat._id ? "..." : "Save"}</button>
                          <button onClick={cancelEdit} className="text-gray-400 hover:underline text-xs">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(cat)} className="text-blue-500 hover:underline text-xs font-medium">Edit</button>
                          <button onClick={() => handleDelete(cat._id)} disabled={deletingId === cat._id}
                            className="text-red-500 hover:underline text-xs font-medium">{deletingId === cat._id ? "..." : "Delete"}</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ListExpenseCategoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <ListExpenseCategoryContent />
    </Suspense>
  );
}
