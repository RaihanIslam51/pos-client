"use client";
import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function ListDepositContent() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.getDeposits(params);
      setDeposits(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchDeposits, 300);
    return () => clearTimeout(t);
  }, [fetchDeposits]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this deposit?")) return;
    setDeletingId(id);
    try {
      await api.deleteDeposit(id);
      fetchDeposits();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const totalAmount = deposits.reduce((s, d) => s + (d.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search deposits..."
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        <Link href="/dashboard/accounting/add-deposit"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Deposit
        </Link>
      </div>

      {!loading && deposits.length > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-green-700">Total Deposit</span>
          <span className="text-lg font-bold text-green-700">৳{totalAmount.toFixed(2)}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Payment</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Reference</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></td></tr>
              ) : deposits.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm"><p className="text-3xl mb-2">🏦</p>No deposits found</td></tr>
              ) : (
                deposits.map((dep, idx) => (
                  <tr key={dep._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{dep.title}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">৳{(dep.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${dep.paymentMethod === "cash" ? "bg-green-100 text-green-700" : dep.paymentMethod === "bank" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {dep.paymentMethod === "mobile_banking" ? "Mobile" : dep.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{dep.reference || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(dep.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(dep._id)} disabled={deletingId === dep._id}
                        className="text-red-500 hover:underline text-xs font-medium">
                        {deletingId === dep._id ? "..." : "Delete"}
                      </button>
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

export default function ListDepositPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <ListDepositContent />
    </Suspense>
  );
}
