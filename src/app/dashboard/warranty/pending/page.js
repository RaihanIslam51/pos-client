"use client";
import { showError, showSuccess, showWarning } from "@/lib/swal";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function PendingWarrantyContent() {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getWarranties("?status=pending");
      setWarranties(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleAction = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.updateWarranty(id, { status });
      fetchPending();
    } catch (err) {
      showError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Pending Warranties</h2>
          <p className="text-xs text-gray-500 mt-0.5">Warranties awaiting activation</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {warranties.length} pending
          </span>
          <Link href="/dashboard/warranty/create"
            className="bg-[#1E3A8A] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors">
            + New
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="block md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></div>
          ) : warranties.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm"><p className="text-3xl mb-2">✅</p>No pending warranties</div>
          ) : warranties.map((w) => (
            <div key={w._id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="text-xs font-mono font-bold text-gray-800">{w.warrantyNumber}</p>
                  <p className="text-sm text-gray-700 mt-0.5">{w.customerName || "—"}</p>
                  {w.customerPhone && <p className="text-xs text-gray-400">{w.customerPhone}</p>}
                </div>
                <p className="text-xs text-gray-400 shrink-0">{new Date(w.expiryDate).toLocaleDateString()}</p>
              </div>
              <div className="text-xs text-gray-600 mb-3 space-y-0.5">
                <p><span className="text-gray-400">Item: </span>{w.productName}</p>
                <p><span className="text-gray-400">Invoice: </span>{w.saleInvoice || "—"}</p>
                <p><span className="text-gray-400">Period: </span>{w.warrantyPeriod}m</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAction(w._id, "active")} disabled={updatingId === w._id}
                  className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 disabled:opacity-60 font-semibold transition-colors">
                  Activate
                </button>
                <button onClick={() => handleAction(w._id, "claimed")} disabled={updatingId === w._id}
                  className="flex-1 bg-blue-500 text-white text-sm py-2 rounded-lg hover:bg-blue-600 disabled:opacity-60 font-semibold transition-colors">
                  Claimed
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Warranty #</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Product</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Period</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Expiry Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Invoice</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                </td></tr>
              ) : warranties.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">✅</p>No pending warranties
                </td></tr>
              ) : (
                warranties.map((w, idx) => (
                  <tr key={w._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-800">{w.warrantyNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{w.customerName || "—"}</p>
                      {w.customerPhone && <p className="text-xs text-gray-400">{w.customerPhone}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{w.productName}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{w.warrantyPeriod}m</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(w.expiryDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{w.saleInvoice || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(w._id, "active")}
                          disabled={updatingId === w._id}
                          className="bg-green-600 text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleAction(w._id, "claimed")}
                          disabled={updatingId === w._id}
                          className="bg-blue-500 text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60"
                        >
                          Claimed
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
    </div>
  );
}

export default function PendingWarrantyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <PendingWarrantyContent />
    </Suspense>
  );
}
