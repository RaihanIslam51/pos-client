"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function GstPurchaseReportPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const q = params.toString() ? `?${params}` : "";
      const res = await api.getPurchases(q);
      setPurchases(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPurchases(); }, []);

  const GST_RATE = 0.15;
  const totalPurchases = purchases.reduce((sum, p) => sum + (p.totalAmount || p.total || 0), 0);
  const totalGst = purchases.reduce((sum, p) => sum + ((p.taxAmount || (p.totalAmount || p.total || 0) * GST_RATE) || 0), 0);
  const totalExcl = totalPurchases - totalGst;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5">GST Purchase Report</h1>

      <div className="bg-white rounded-xl shadow p-3 sm:p-4 mb-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
          </div>
        </div>
        <button onClick={fetchPurchases} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 sm:self-end">Filter</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">Total Purchases (Incl. GST)</p>
          <p className="text-2xl font-bold text-blue-700">৳{totalPurchases.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <p className="text-xs text-gray-500 mb-1">GST Paid</p>
          <p className="text-2xl font-bold text-orange-600">৳{totalGst.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-gray-500 mb-1">Purchases (Excl. GST)</p>
          <p className="text-2xl font-bold text-green-700">৳{totalExcl.toFixed(2)}</p>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">Loading...</div>
        ) : purchases.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">No purchase data found</div>
        ) : purchases.map((p, i) => {
          const total = p.totalAmount || p.total || 0;
          const gst = p.taxAmount || total * GST_RATE;
          const sub = total - gst;
          return (
            <div key={p._id} className="bg-white rounded-xl shadow p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-blue-600 text-sm font-semibold">#{p.referenceNo || p._id.slice(-6).toUpperCase()}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {p.paymentStatus || p.status || "received"}
                </span>
              </div>
              <p className="text-sm text-gray-700">{p.supplier?.name || "—"} · {new Date(p.purchaseDate || p.createdAt).toLocaleDateString()}</p>
              <div className="grid grid-cols-3 gap-2 text-xs border-t border-gray-100 pt-2">
                <div><p className="text-gray-400">Subtotal</p><p className="font-semibold text-gray-700">৳{sub.toFixed(2)}</p></div>
                <div><p className="text-gray-400">GST</p><p className="font-semibold text-orange-600">৳{gst.toFixed(2)}</p></div>
                <div><p className="text-gray-400">Total</p><p className="font-semibold text-gray-800">৳{total.toLocaleString()}</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Reference</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Supplier</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Subtotal (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">GST (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Total (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : purchases.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No purchase data found</td></tr>
            ) : purchases.map((p, i) => {
              const total = p.totalAmount || p.total || 0;
              const gst = p.taxAmount || total * GST_RATE;
              const sub = total - gst;
              return (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-blue-600">#{p.referenceNo || p._id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3">{new Date(p.purchaseDate || p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{p.supplier?.name || "—"}</td>
                  <td className="px-4 py-3">৳{sub.toFixed(2)}</td>
                  <td className="px-4 py-3 text-orange-600">৳{gst.toFixed(2)}</td>
                  <td className="px-4 py-3 font-semibold">৳{total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {p.paymentStatus || p.status || "received"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {purchases.length > 0 && (
            <tfoot>
              <tr className="bg-gray-100 font-semibold border-t-2">
                <td colSpan={4} className="px-4 py-3">Total</td>
                <td className="px-4 py-3">৳{totalExcl.toFixed(2)}</td>
                <td className="px-4 py-3 text-orange-600">৳{totalGst.toFixed(2)}</td>
                <td className="px-4 py-3 text-blue-700">৳{totalPurchases.toLocaleString()}</td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
        </div>
      </div>
    </div>
  );
}
