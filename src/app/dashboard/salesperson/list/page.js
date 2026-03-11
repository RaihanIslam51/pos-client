"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function SalesPersonListContent() {
  const [salesPersons, setSalesPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSalesPersons = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.getSalesPersons(params);
      setSalesPersons(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchSalesPersons, 300);
    return () => clearTimeout(t);
  }, [fetchSalesPersons]);

  const startEdit = (sp) => {
    setEditingId(sp._id);
    setEditForm({ name: sp.name, phone: sp.phone, email: sp.email, commissionRate: sp.commissionRate });
  };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleSave = async (id) => {
    setSavingId(id);
    try {
      await api.updateSalesPerson(id, editForm);
      setEditingId(null);
      fetchSalesPersons();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this sales person?")) return;
    setDeletingId(id);
    try {
      await api.deleteSalesPerson(id);
      fetchSalesPersons();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone or email..."
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
        />
        <Link href="/dashboard/salesperson/add"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Sales Person
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Phone</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Commission</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Total Sales</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                </td></tr>
              ) : salesPersons.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">🧑‍💼</p>No sales persons found
                </td></tr>
              ) : (
                salesPersons.map((sp, idx) => (
                  <tr key={sp._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {editingId === sp._id ? (
                        <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                      ) : (
                        <span className="text-sm font-medium text-gray-800">{sp.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === sp._id ? (
                        <input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-28 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                      ) : (
                        <span className="text-sm text-gray-600">{sp.phone || "—"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{sp.email || "—"}</td>
                    <td className="px-4 py-3">
                      {editingId === sp._id ? (
                        <input type="number" min="0" max="100" step="0.1" value={editForm.commissionRate}
                          onChange={(e) => setEditForm((f) => ({ ...f, commissionRate: parseFloat(e.target.value) || 0 }))}
                          className="border border-gray-300 rounded px-2 py-1 text-sm w-16 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                      ) : (
                        <span className="text-sm text-gray-700">{sp.commissionRate || 0}%</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">৳{(sp.totalSales || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {editingId === sp._id ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleSave(sp._id)} disabled={savingId === sp._id}
                            className="text-green-600 hover:underline text-xs font-medium">
                            {savingId === sp._id ? "..." : "Save"}
                          </button>
                          <button onClick={cancelEdit} className="text-gray-400 hover:underline text-xs">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(sp)} className="text-blue-500 hover:underline text-xs font-medium">Edit</button>
                          <button onClick={() => handleDelete(sp._id)} disabled={deletingId === sp._id}
                            className="text-red-500 hover:underline text-xs font-medium">
                            {deletingId === sp._id ? "..." : "Delete"}
                          </button>
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

export default function SalesPersonListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <SalesPersonListContent />
    </Suspense>
  );
}
