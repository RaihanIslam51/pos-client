"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { api } from "@/lib/api";

function BulkUpdateContent() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [action, setAction] = useState("markImportant");
  const [processing, setProcessing] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.getCustomers(params);
      setCustomers(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  const toggleSelect = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(selected.length === customers.length ? [] : customers.map((c) => c._id));

  const handleBulkAction = async () => {
    if (selected.length === 0) return alert("Select at least one customer");
    const confirmMsg = {
      markImportant: `Mark ${selected.length} customer(s) as VIP?`,
      unmarkImportant: `Remove VIP status from ${selected.length} customer(s)?`,
      delete: `Delete ${selected.length} customer(s)? This cannot be undone.`,
    }[action];
    if (!confirm(confirmMsg)) return;

    setProcessing(true);
    try {
      if (action === "markImportant") {
        await api.bulkUpdateCustomers({ ids: selected, update: { isImportant: true } });
      } else if (action === "unmarkImportant") {
        await api.bulkUpdateCustomers({ ids: selected, update: { isImportant: false } });
      } else if (action === "delete") {
        await api.bulkUpdateCustomers({ ids: selected, update: { isActive: false } });
      }
      setSelected([]);
      fetchCustomers();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
        />
        {selected.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">{selected.length} selected</span>
            <select value={action} onChange={(e) => setAction(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]">
              <option value="markImportant">Mark as VIP</option>
              <option value="unmarkImportant">Remove VIP</option>
              <option value="delete">Delete</option>
            </select>
            <button onClick={handleBulkAction} disabled={processing}
              className={`text-white text-xs px-3 py-2 rounded-lg font-semibold transition-colors disabled:opacity-60 ${action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-[#1E3A8A] hover:bg-blue-800"}`}>
              {processing ? "Processing..." : "Apply"}
            </button>
            <button onClick={() => setSelected([])} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 w-10">
                  <input type="checkbox" checked={customers.length > 0 && selected.length === customers.length}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer" />
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Phone</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Total Purchase</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">VIP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                </td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">👥</p>No customers found
                </td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c._id}
                    onClick={() => toggleSelect(c._id)}
                    className={`cursor-pointer transition-colors ${selected.includes(c._id) ? "bg-blue-50" : "hover:bg-gray-50"}`}>
                    <td className="px-5 py-3">
                      <input type="checkbox" checked={selected.includes(c._id)} onChange={() => {}}
                        className="w-4 h-4 rounded border-gray-300 text-[#1E3A8A] focus:ring-[#1E3A8A] cursor-pointer" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {c.isImportant && <span className="text-yellow-400 text-sm">★</span>}
                        <span className="text-sm font-medium text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.email || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">৳{(c.totalPurchase || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {c.isImportant
                        ? <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-semibold">VIP</span>
                        : <span className="text-xs text-gray-300">—</span>}
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

export default function CustomerBulkUpdatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <BulkUpdateContent />
    </Suspense>
  );
}
