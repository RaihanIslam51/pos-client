"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

function SalesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Filters synced to URL
  const startDate = searchParams.get("from") || "";
  const endDate = searchParams.get("to") || "";
  const statusFilter = searchParams.get("status") || "";

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);

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
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, statusFilter]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this sale?")) return;
    try {
      await api.cancelSale(id);
      fetchSales();
    } catch (err) {
      alert(err.message);
    }
  };

  const completedTotal = sales.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.totalAmount, 0);

  const statusColors = {
    completed: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const paymentColors = {
    cash: "bg-emerald-100 text-emerald-700",
    card: "bg-blue-100 text-blue-700",
    mobile: "bg-purple-100 text-purple-700",
    credit: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setParam("from", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setParam("to", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setParam("status", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {(startDate || endDate || statusFilter) && (
          <button
            onClick={() => router.replace(pathname)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        )}
        <div className="ml-auto bg-blue-50 px-4 py-2 rounded-lg">
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-lg font-bold text-[#1E3A8A]">৳{completedTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Invoice</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Customer</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Items</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Total</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Payment</th>
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
              ) : sales.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">🧾</p>No sales found
                </td></tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-semibold text-[#1E3A8A]">{sale.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{sale.customerName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{sale.items?.length || 0} items</td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">৳{sale.totalAmount?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${paymentColors[sale.paymentMethod] || "bg-gray-100 text-gray-600"}`}>
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[sale.status] || "bg-gray-100 text-gray-600"}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(sale.createdAt).toLocaleDateString("en-BD", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedSale(sale)}
                          className="text-[#1E3A8A] hover:underline text-xs font-medium"
                        >
                          View
                        </button>
                        {sale.status === "completed" && (
                          <button
                            onClick={() => handleCancel(sale._id)}
                            className="text-red-500 hover:underline text-xs font-medium"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-[#1E3A8A]">Invoice #{selectedSale.invoiceNumber}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(selectedSale.createdAt).toLocaleString("en-BD")}</p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="font-semibold text-gray-800">{selectedSale.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Payment Method</p>
                  <p className="font-semibold text-gray-800 capitalize">{selectedSale.paymentMethod}</p>
                </div>
              </div>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs text-gray-500 font-semibold">Product</th>
                      <th className="text-right px-4 py-2 text-xs text-gray-500 font-semibold">Qty</th>
                      <th className="text-right px-4 py-2 text-xs text-gray-500 font-semibold">Price</th>
                      <th className="text-right px-4 py-2 text-xs text-gray-500 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedSale.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-gray-700">{item.product?.name || item.productName}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-2 text-right text-gray-600">৳{item.unitPrice?.toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-gray-800">৳{item.total?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-1 text-sm border-t border-gray-100 pt-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>৳{selectedSale.subtotal?.toFixed(2)}</span>
                </div>
                {selectedSale.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>−৳{selectedSale.discountAmount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-[#1E3A8A] text-base border-t border-gray-100 pt-1 mt-1">
                  <span>Total</span>
                  <span>৳{selectedSale.totalAmount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Paid</span>
                  <span>৳{selectedSale.paidAmount?.toFixed(2)}</span>
                </div>
                {selectedSale.paidAmount > selectedSale.totalAmount && (
                  <div className="flex justify-between text-green-600">
                    <span>Change</span>
                    <span>৳{(selectedSale.paidAmount - selectedSale.totalAmount).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-xl border border-gray-200 p-4 h-20"></div>
        <div className="bg-white rounded-xl border border-gray-200 h-64"></div>
      </div>
    }>
      <SalesContent />
    </Suspense>
  );
}
