"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function PendingQuotationContent() {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getQuotations("?status=pending");
      setQuotations(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleAction = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.updateQuotation(id, { status });
      fetchPending();
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Pending Quotations</h2>
          <p className="text-xs text-gray-500 mt-0.5">Awaiting approval or rejection</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {quotations.length} pending
          </span>
          <Link href="/dashboard/quotation/create"
            className="bg-[#1E3A8A] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors">
            + New
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Quotation #</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Valid Until</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Items</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                </td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">✅</p>No pending quotations
                </td></tr>
              ) : (
                quotations.map((q, idx) => (
                  <tr key={q._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-800">{q.quotationNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{q.customerName}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">৳{q.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{q.items?.length || 0}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(q._id, "approved")}
                          disabled={updatingId === q._id}
                          className="bg-green-600 text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleAction(q._id, "rejected")}
                          disabled={updatingId === q._id}
                          className="bg-red-500 text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-60"
                        >
                          Reject
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

export default function PendingQuotationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <PendingQuotationContent />
    </Suspense>
  );
}
