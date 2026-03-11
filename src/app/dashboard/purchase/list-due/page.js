"use client";
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

function ListDueContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const startDate = searchParams.get("from") || "";
  const endDate   = searchParams.get("to")   || "";

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [payAmount, setPayAmount] = useState({});

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const fetchDue = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("due", "true");
      if (startDate) params.append("startDate", startDate);
      if (endDate)   params.append("endDate",   endDate);
      const res = await api.getPurchases(`?${params}`);
      setPurchases(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchDue(); }, [fetchDue]);

  const handlePay = async (id) => {
    const amount = parseFloat(payAmount[id]);
    if (!amount || amount <= 0) return alert("Enter a valid amount");
    setPayingId(id);
    try {
      const purchase = purchases.find((p) => p._id === id);
      const newPaid = purchase.paidAmount + amount;
      await api.updatePurchase(id, { paidAmount: newPaid });
      fetchDue();
      setPayAmount((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      alert(err.message);
    } finally {
      setPayingId(null);
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
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Purchase
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Invoice</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Supplier</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Paid</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Due</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Pay Now</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                </td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">✅</p>No due purchases
                </td></tr>
              ) : (
                purchases.map((p, idx) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-800">{p.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{p.supplierName}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">৳{p.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-green-600">৳{p.paidAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-bold">৳{p.dueAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 items-center">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Amount"
                          value={payAmount[p._id] || ""}
                          onChange={(e) => setPayAmount((prev) => ({ ...prev, [p._id]: e.target.value }))}
                          className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                        />
                        <button
                          onClick={() => handlePay(p._id)}
                          disabled={payingId === p._id}
                          className="bg-green-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-green-700 disabled:opacity-50"
                        >
                          {payingId === p._id ? "..." : "Pay"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        <Link href={`/dashboard/purchase/${p._id}`}>
                          <IconBtn title="View" colorClass="text-[#1E3A8A] hover:bg-blue-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </IconBtn>
                        </Link>
                        <Link href={`/dashboard/purchase/${p._id}/edit`}>
                          <IconBtn title="Edit" colorClass="text-green-600 hover:bg-green-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </IconBtn>
                        </Link>
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

export default function ListDuePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <ListDueContent />
    </Suspense>
  );
}
