"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  hold: "bg-blue-100 text-blue-700",
  instalment: "bg-purple-100 text-purple-700",
};

function InvoiceListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const startDate = searchParams.get("from") || "";
  const endDate = searchParams.get("to") || "";
  const statusFilter = searchParams.get("status") || "";

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [printingId, setPrintingId] = useState(null);

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (statusFilter) params.append("status", statusFilter);
      const res = await api.getSales(params.toString() ? `?${params}` : "");
      setSales(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, statusFilter]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this invoice?")) return;
    setDeletingId(id);
    try {
      await api.deleteSale(id);
      fetchSales();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrint = (id) => {
    setPrintingId(id);
    const w = window.open(`/dashboard/sales/${id}?print=1`, "_blank");
    if (w) w.onload = () => setPrintingId(null);
    else setPrintingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">From</label>
            <input type="date" value={startDate} onChange={(e) => setParam("from", e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">To</label>
            <input type="date" value={endDate} onChange={(e) => setParam("to", e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => setParam("status", e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]">
              <option value="">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="hold">Hold</option>
              <option value="instalment">Instalment</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <Link
          href="/dashboard/sales/create"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Invoice
        </Link>
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
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                </td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">🧾</p>No invoices found
                </td></tr>
              ) : (
                sales.map((s, idx) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-800">{s.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.customerName}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">৳{s.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-green-600">৳{s.paidAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">৳{s.dueAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[s.status] || "bg-gray-100 text-gray-600"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        {/* View */}
                        <Link href={`/dashboard/sales/${s._id}`}>
                          <IconBtn title="View" colorClass="text-[#1E3A8A] hover:bg-blue-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </IconBtn>
                        </Link>
                        {/* Edit */}
                        <Link href={`/dashboard/sales/${s._id}/edit`}>
                          <IconBtn title="Edit" colorClass="text-green-600 hover:bg-green-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </IconBtn>
                        </Link>
                        {/* Print */}
                        <IconBtn title="Print" onClick={() => handlePrint(s._id)}
                          disabled={printingId === s._id}
                          colorClass="text-purple-600 hover:bg-purple-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        </IconBtn>
                        {/* PDF */}
                        <IconBtn title="Download PDF" onClick={() => handlePrint(s._id)}
                          disabled={printingId === s._id}
                          colorClass="text-orange-500 hover:bg-orange-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6" /></svg>
                        </IconBtn>
                        {/* Delete */}
                        <IconBtn title="Delete" onClick={() => handleDelete(s._id)}
                          disabled={deletingId === s._id}
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

export default function InvoiceListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <InvoiceListContent />
    </Suspense>
  );
}
