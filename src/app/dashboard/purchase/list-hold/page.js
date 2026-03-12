"use client";
import { showError, showSuccess, showWarning, showConfirm } from "@/lib/swal";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function IconBtn({ title, onClick, colorClass, children, disabled }) {
  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled}
      className={`p-1.5 rounded transition-colors disabled:opacity-40 ${colorClass}`}>
      {children}
    </button>
  );
}

function ListHoldContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const startDate = searchParams.get("from") || "";
  const endDate   = searchParams.get("to")   || "";

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const fetchHold = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("status", "hold");
      if (startDate) params.append("startDate", startDate);
      if (endDate)   params.append("endDate",   endDate);
      const res = await api.getPurchases(`?${params}`);
      setPurchases(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchHold(); }, [fetchHold]);

  const handleReceive = async (id) => {
    const result = await showConfirm("Mark this purchase as received? This will add items to stock.");
    if (!result.isConfirmed) return;
    setProcessingId(id);
    try {
      await api.updatePurchase(id, { status: "received" });
      fetchHold();
    } catch (err) {
      showError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (id) => {
    const result = await showConfirm("Cancel this purchase order?");
    if (!result.isConfirmed) return;
    setProcessingId(id);
    try {
      await api.updatePurchase(id, { status: "cancelled" });
      fetchHold();
    } catch (err) {
      showError(err.message);
    } finally {
      setProcessingId(null);
    }
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
        </div>
        <Link
          href="/dashboard/purchase/create"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Purchase
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="block md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm"><p className="text-3xl mb-2">⏸️</p>No hold orders</div>
          ) : purchases.map((p) => (
            <div key={p._id} className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="text-xs font-mono font-bold text-gray-800">{p.invoiceNumber}</p>
                  <p className="text-sm text-gray-700 mt-0.5">{p.supplierName}</p>
                </div>
                <p className="text-xs text-gray-400 shrink-0">{new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3 mb-3 text-sm">
                <span className="text-gray-500">{p.items.length} item{p.items.length !== 1 ? "s" : ""}</span>
                <span className="font-bold text-gray-800">৳{p.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <Link href={`/dashboard/purchase/${p._id}`} className="flex-1">
                  <button className="w-full border border-gray-200 rounded-lg py-2 text-sm font-medium text-[#1E3A8A] hover:bg-blue-50 transition-colors">View</button>
                </Link>
                <button onClick={() => handleReceive(p._id)} disabled={processingId === p._id}
                  className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
                  Receive
                </button>
                <button onClick={() => handleCancel(p._id)} disabled={processingId === p._id}
                  className="flex-1 bg-red-500 text-white rounded-lg py-2 text-sm font-semibold hover:bg-red-600 disabled:opacity-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Invoice</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Supplier</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Items</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                </td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">⏸️</p>No hold orders
                </td></tr>
              ) : (
                purchases.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-800">{p.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{p.supplierName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{p.items.length} item{p.items.length !== 1 ? "s" : ""}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">৳{p.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        {/* View */}
                        <Link href={`/dashboard/purchase/${p._id}`}>
                          <IconBtn title="View" colorClass="text-[#1E3A8A] hover:bg-blue-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </IconBtn>
                        </Link>
                        {/* Receive */}
                        <IconBtn title="Mark Received" onClick={() => handleReceive(p._id)}
                          disabled={processingId === p._id}
                          colorClass="text-green-600 hover:bg-green-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </IconBtn>
                        {/* Cancel */}
                        <IconBtn title="Cancel Order" onClick={() => handleCancel(p._id)}
                          disabled={processingId === p._id}
                          colorClass="text-red-500 hover:bg-red-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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

export default function ListHoldPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <ListHoldContent />
    </Suspense>
  );
}
