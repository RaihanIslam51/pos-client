"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function InvoiceReportPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

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

  const filtered = sales.filter((s) =>
    !search ||
    s.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const total = filtered.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
  const paid = filtered.filter((s) => s.paymentStatus === "paid").length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Invoice Report</h1>
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice/customer..." className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52" />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <button onClick={fetchSales} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Filter</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100"><p className="text-xs text-gray-500">Total Invoices</p><p className="text-2xl font-bold text-blue-700">{filtered.length}</p></div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100"><p className="text-xs text-gray-500">Paid</p><p className="text-2xl font-bold text-green-700">{paid}</p></div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100"><p className="text-xs text-gray-500">Total Value (৳)</p><p className="text-2xl font-bold text-purple-700">৳{total.toLocaleString()}</p></div>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Invoice No.</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Items</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Total (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Paid (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">No invoices found</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-mono text-blue-600">#{s.invoiceNumber || s._id.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-3">{new Date(s.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">{s.customer?.name || "Walk-in"}</td>
                <td className="px-4 py-3">{s.items?.length || 0}</td>
                <td className="px-4 py-3 font-semibold">৳{s.totalAmount?.toLocaleString()}</td>
                <td className="px-4 py-3">৳{s.paidAmount?.toLocaleString() || "0"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.paymentStatus === "paid" ? "bg-green-100 text-green-700" : s.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {s.paymentStatus || s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
