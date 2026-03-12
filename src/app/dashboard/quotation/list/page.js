"use client";
import { showError, showSuccess, showWarning, showConfirm } from "@/lib/swal";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// ── Action icon buttons ────────────────────────────────────────────────────────
function IconBtn({ title, onClick, colorClass, children, disabled }) {
  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled}
      className={`p-1.5 rounded transition-colors disabled:opacity-40 ${colorClass}`}>
      {children}
    </button>
  );
}

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-500",
  converted: "bg-blue-100 text-blue-700",
};

function QuotationListContent() {
  const router = useRouter();
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [printingId, setPrintingId] = useState(null);

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await api.getQuotations(params);
      setQuotations(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchQuotations(); }, [fetchQuotations]);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.updateQuotation(id, { status });
      fetchQuotations();
    } catch (err) {
      showError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("Delete this quotation?");
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      await api.deleteQuotation(id);
      fetchQuotations();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrint = (id) => {
    setPrintingId(id);
    const w = window.open(`/dashboard/quotation/${id}?print=1`, "_blank");
    if (w) w.onload = () => setPrintingId(null);
    else setPrintingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Filter by Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="converted">Converted</option>
          </select>
        </div>
        <Link href="/dashboard/quotation/create"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Quotation
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="block md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></div>
          ) : quotations.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm"><p className="text-3xl mb-2">📋</p>No quotations found</div>
          ) : quotations.map((q) => (
            <div key={q._id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-xs font-mono font-bold text-gray-800">{q.quotationNumber}</p>
                  <p className="text-sm text-gray-700 mt-0.5">{q.customerName}</p>
                </div>
                <select value={q.status} onChange={(e) => handleStatusChange(q._id, e.target.value)}
                  disabled={updatingId === q._id}
                  className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none shrink-0 ${STATUS_COLORS[q.status] || "bg-gray-100 text-gray-600"}`}>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-600 mb-3">
                <div><span className="text-gray-400">Total: </span><span className="font-bold text-gray-800">৳{q.totalAmount.toFixed(2)}</span></div>
                <div><span className="text-gray-400">Valid: </span>{q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "—"}</div>
                <div><span className="text-gray-400">Date: </span>{new Date(q.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center justify-end gap-1">
                <IconBtn title="View" onClick={() => router.push(`/dashboard/quotation/${q._id}`)} colorClass="text-[#1E3A8A] hover:bg-blue-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </IconBtn>
                <IconBtn title="Edit" onClick={() => router.push(`/dashboard/quotation/${q._id}/edit`)} colorClass="text-green-600 hover:bg-green-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </IconBtn>
                <IconBtn title="Print" onClick={() => handlePrint(q._id)} disabled={printingId === q._id} colorClass="text-purple-600 hover:bg-purple-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                </IconBtn>
                <IconBtn title="Delete" onClick={() => handleDelete(q._id)} disabled={deletingId === q._id} colorClass="text-red-500 hover:bg-red-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </IconBtn>
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
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Quotation #</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Valid Until</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
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
                  <p className="text-3xl mb-2">📋</p>No quotations found
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
                    <td className="px-4 py-3">
                      <select
                        value={q.status}
                        onChange={(e) => handleStatusChange(q._id, e.target.value)}
                        disabled={updatingId === q._id}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] ${STATUS_COLORS[q.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="expired">Expired</option>
                        <option value="converted">Converted</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {/* View */}
                        <IconBtn title="View" onClick={() => router.push(`/dashboard/quotation/${q._id}`)}
                          colorClass="text-[#1E3A8A] hover:bg-blue-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </IconBtn>
                        {/* Edit */}
                        <IconBtn title="Edit" onClick={() => router.push(`/dashboard/quotation/${q._id}/edit`)}
                          colorClass="text-green-600 hover:bg-green-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </IconBtn>
                        {/* Print */}
                        <IconBtn title="Print" onClick={() => handlePrint(q._id)}
                          disabled={printingId === q._id}
                          colorClass="text-purple-600 hover:bg-purple-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        </IconBtn>
                        {/* Delete */}
                        <IconBtn title="Delete" onClick={() => handleDelete(q._id)}
                          disabled={deletingId === q._id}
                          colorClass="text-red-500 hover:bg-red-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </IconBtn>
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

export default function QuotationListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <QuotationListContent />
    </Suspense>
  );
}
