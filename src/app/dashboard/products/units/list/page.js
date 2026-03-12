"use client";
import { showError, showSuccess, showWarning, showConfirm } from "@/lib/swal";
import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ListUnitsPage() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", shortName: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const res = await api.getUnits();
      setUnits(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchUnits(); }, []);

  const openEdit = (unit) => {
    setEditItem(unit);
    setEditForm({ name: unit.name, shortName: unit.shortName });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateUnit(editItem._id, editForm);
      setEditItem(null);
      fetchUnits();
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("Delete this unit?");
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      await api.deleteUnit(id);
      fetchUnits();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">Units</h2>
          <p className="text-sm text-gray-400">{units.length} unit{units.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/products/units/create"
          className="bg-[#1E3A8A] text-white px-3 lg:px-4 py-2 lg:py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Unit</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[360px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Unit Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Short Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]" />
              </td></tr>
            ) : units.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-14 text-gray-400 text-sm">
                <p className="text-4xl mb-2">📏</p>
                <p>No units found</p>
                <Link href="/dashboard/products/units/create" className="mt-2 inline-block text-[#1E3A8A] font-semibold hover:underline">
                  + Add a unit
                </Link>
              </td></tr>
            ) : (
              units.map((unit, idx) => (
                <tr key={unit._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{unit.name}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-mono font-bold">{unit.shortName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${unit.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {unit.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <button onClick={() => openEdit(unit)} className="text-[#1E3A8A] hover:underline text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(unit._id)} disabled={deletingId === unit._id} className="text-red-500 hover:underline text-xs font-medium">
                        {deletingId === unit._id ? "..." : "Delete"}
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

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#1E3A8A]">Edit Unit</h3>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Unit Name *</label>
                <input required value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Short Name *</label>
                <input required value={editForm.shortName} onChange={(e) => setEditForm({ ...editForm, shortName: e.target.value })}
                  className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
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
