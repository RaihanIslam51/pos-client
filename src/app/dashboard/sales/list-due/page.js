"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { api } from "@/lib/api";

function ListDueContent() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payMap, setPayMap] = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const fetchDue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getSales("?due=true");
      setSales(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDue(); }, [fetchDue]);

  const handlePay = async (sale) => {
    const amount = parseFloat(payMap[sale._id]);
    if (!amount || amount <= 0) return alert("Enter a valid amount");
    if (amount > sale.dueAmount) return alert(`Amount exceeds due (৳${sale.dueAmount.toFixed(2)})`);
    setProcessingId(sale._id);
    try {
      await api.updateSale(sale._id, { paidAmount: sale.paidAmount + amount });
      setSuccessId(sale._id);
      setPayMap((m) => ({ ...m, [sale._id]: "" }));
      setTimeout(() => setSuccessId(null), 2000);
      fetchDue();
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
          <h2 className="text-base font-semibold text-gray-800">Due Invoices</h2>
          <p className="text-xs text-gray-500 mt-0.5">Invoices with outstanding due amounts</p>
        </div>
        <span className="bg-red-100 text-red-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {sales.length} pending
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
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Pay Now</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                </td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">✅</p>No due invoices
                </td></tr>
              ) : (
                sales.map((s, idx) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono font-semibold text-gray-800">{s.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.customerName}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">৳{s.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-green-600">৳{s.paidAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-bold">৳{s.dueAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {successId === s._id ? (
                        <span className="text-green-600 text-xs font-semibold">Paid ✓</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Amount"
                            value={payMap[s._id] || ""}
                            onChange={(e) => setPayMap((m) => ({ ...m, [s._id]: e.target.value }))}
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs w-24 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                          />
                          <button
                            onClick={() => handlePay(s)}
                            disabled={processingId === s._id}
                            className="bg-[#1E3A8A] text-white text-xs px-2.5 py-1.5 rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-60"
                          >
                            {processingId === s._id ? "..." : "Pay"}
                          </button>
                        </div>
                      )}
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
