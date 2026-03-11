"use client";
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
    if (!confirm(action === "complete" ? "Mark this order as completed? This will deduct stock." : "Cancel this order?")) return;
    setProcessingId(id);
    try {
      if (action === "complete") {
        await api.updateSale(id, { status: "completed" });
      } else {
        await api.cancelSale(id);
      }
      fetchHold();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Hold Orders</h2>
          <p className="text-xs text-gray-500 mt-0.5">Invoices currently on hold</p>
        </div>
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {sales.length} on hold
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
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
