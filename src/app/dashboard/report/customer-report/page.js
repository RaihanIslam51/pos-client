"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function CustomerReportPage() {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([api.getCustomers(), api.getSales()])
      .then(([cRes, sRes]) => { setCustomers(cRes.data || []); setSales(sRes.data || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  const getCustomerStats = (customerId) => {
    const custSales = sales.filter((s) => s.customer?._id === customerId || s.customer === customerId);
    const total = custSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const count = custSales.length;
    return { total, count };
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Customer Report</h1>
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex gap-3 items-end">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer..." className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100"><p className="text-xs text-gray-500">Total Customers</p><p className="text-2xl font-bold text-blue-700">{customers.length}</p></div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100"><p className="text-xs text-gray-500">Active (w/ Purchases)</p><p className="text-2xl font-bold text-green-700">{customers.filter((c) => getCustomerStats(c._id).count > 0).length}</p></div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100"><p className="text-xs text-gray-500">Total Revenue</p><p className="text-2xl font-bold text-purple-700">৳{sales.filter((s) => s.customer).reduce((s, r) => s + (r.totalAmount || 0), 0).toLocaleString()}</p></div>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Phone</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Total Purchases</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Total Spent (৳)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No customers found</td></tr>
            ) : filtered.map((c, i) => {
              const { total, count } = getCustomerStats(c._id);
              return (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email || "—"}</td>
                  <td className="px-4 py-3">{count}</td>
                  <td className="px-4 py-3 font-semibold text-blue-700">৳{total.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
