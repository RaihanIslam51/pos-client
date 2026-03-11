"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function CollectionReportPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const q = params.toString() ? `?${params}` : "";
      const res = await api.getSales(q);
      setSales(res.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchSales(); }, []);

  const filtered = sales.filter((s) => {
    if (s.status === "cancelled") return false;
    if (paymentMethod && s.paymentMethod !== paymentMethod) return false;
    return true;
  });

  const totalCollected = filtered.reduce((sum, s) => sum + (s.paidAmount || s.totalAmount || 0), 0);
  const totalDue = filtered.reduce((sum, s) => sum + ((s.totalAmount || 0) - (s.paidAmount || s.totalAmount || 0)), 0);

  const byMethod = filtered.reduce((acc, s) => {
    const m = s.paymentMethod || "cash";
    acc[m] = (acc[m] || 0) + (s.paidAmount || s.totalAmount || 0);
    return acc;
  }, {});

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Collection Report</h1>
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="mobile">Mobile Banking</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
        <button onClick={fetchSales} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Filter</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-xl p-4 border border-green-100"><p className="text-xs text-gray-500">Total Collected</p><p className="text-2xl font-bold text-green-700">৳{totalCollected.toLocaleString()}</p></div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100"><p className="text-xs text-gray-500">Total Due</p><p className="text-2xl font-bold text-red-600">৳{totalDue.toLocaleString()}</p></div>
        {Object.entries(byMethod).map(([method, amount]) => (
          <div key={method} className="bg-blue-50 rounded-xl p-4 border border-blue-100 capitalize">
            <p className="text-xs text-gray-500">{method}</p>
            <p className="text-xl font-bold text-blue-700">৳{amount.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Invoice</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Payment Method</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Total (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Collected (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Due (৳)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No records found</td></tr>
            ) : filtered.map((s, i) => {
              const collected = s.paidAmount || s.totalAmount || 0;
              const due = (s.totalAmount || 0) - collected;
              return (
                <tr key={s._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-mono text-blue-600">#{s.invoiceNumber || s._id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{s.customer?.name || "Walk-in"}</td>
                  <td className="px-4 py-3 capitalize">{s.paymentMethod || "cash"}</td>
                  <td className="px-4 py-3 font-semibold">৳{s.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-green-600 font-semibold">৳{collected.toLocaleString()}</td>
                  <td className="px-4 py-3 text-red-500">৳{due.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
