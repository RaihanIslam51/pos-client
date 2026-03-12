"use client";
import { showError, showSuccess, showWarning, showConfirm } from "@/lib/swal";
import { useState, useEffect, useCallback, Suspense } from "react";
import { api } from "@/lib/api";

function ListHoldContent() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchHold = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getSales("?status=hold");
      setSales(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHold(); }, [fetchHold]);

  const handleAction = async (id, action) => {
    const result = await showConfirm(
      action === "complete" ? "Mark this order as completed? This will deduct stock." : "Cancel this order?"
    );
    if (!result.isConfirmed) return;
    setProcessingId(id);
    try {
      if (action === "complete") {
        await api.updateSale(id, { status: "completed" });
      } else {
        await api.cancelSale(id);
      }
      fetchHold();
    } catch (err) {
      showError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">Hold Orders</h2>
          <p className="text-xs text-gray-500 mt-0.5">Invoices currently on hold</p>
        </div>
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0">
          {sales.length} on hold
        </span>
      </div>

      {/* ── Mobile card view ── */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-10"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></div>
        ) : sales.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
            <p className="text-3xl mb-2">📦</p>No hold orders
          </div>
        ) : (
          sales.map((s, idx) => (
            <div key={s._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-mono font-semibold text-gray-800 truncate">{s.invoiceNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{s.customerName}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">{new Date(s.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg py-1.5">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-sm font-semibold text-gray-800">৳{s.totalAmount.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 rounded-lg py-1.5">
                  <p className="text-xs text-gray-400">Paid</p>
                  <p className="text-sm font-semibold text-green-600">৳{s.paidAmount.toFixed(2)}</p>
                </div>
                <div className="bg-red-50 rounded-lg py-1.5">
                  <p className="text-xs text-gray-400">Due</p>
                  <p className="text-sm font-semibold text-red-600">৳{s.dueAmount.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction(s._id, "complete")}
                  disabled={processingId === s._id}
                  className="flex-1 bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  Complete
                </button>
                <button
                  onClick={() => handleAction(s._id, "cancel")}
                  disabled={processingId === s._id}
                  className="flex-1 bg-red-500 text-white text-sm py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Invoice</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Paid</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Due</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                </td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">📦</p>No hold orders
                </td></tr>
              ) : (
                sales.map((s, idx) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-800">{s.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.customerName}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">৳{s.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-green-600">৳{s.paidAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-red-600">৳{s.dueAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(s._id, "complete")}
                          disabled={processingId === s._id}
                          className="bg-green-600 text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleAction(s._id, "cancel")}
                          disabled={processingId === s._id}
                          className="bg-red-500 text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
                        >
                          Cancel
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

export default function ListHoldPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <ListHoldContent />
    </Suspense>
  );
}
