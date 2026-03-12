"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, LineChart, Line,
} from "recharts";

function useWindowSize() {
  const [w, setW] = useState(768);
  useEffect(() => {
    setW(window.innerWidth);
    let t;
    const handler = () => { clearTimeout(t); t = setTimeout(() => setW(window.innerWidth), 100); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w;
}

const fmtK = (v) => v >= 1000 ? `৳${(v / 1000).toFixed(1)}k` : `৳${v}`;

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow">
      <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
        <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}

export default function CustomerReportPage() {
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 640;
  const chartH = isMobile ? 200 : 260;
  const yAxisW = isMobile ? 48 : 60;

  useEffect(() => {
    Promise.all([api.getCustomers(), api.getSales()])
      .then(([cRes, sRes]) => { setCustomers(cRes.data || []); setSales(sRes.data || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const getCustomerStats = (customerId) => {
    const custSales = sales.filter((s) => s.customer?._id === customerId || s.customer === customerId);
    const total = custSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    return { total, count: custSales.length };
  };

  const filtered = customers
    .filter((c) => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search))
    .map((c) => ({ ...c, ...getCustomerStats(c._id) }))
    .sort((a, b) => b.total - a.total);

  // Top 10 customers for chart
  const topCustomers = filtered.slice(0, 10);

  // Monthly new customers (last 6 months)
  const now = new Date();
  const monthlyNew = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const label = d.toLocaleDateString("en-GB", { month: "short", year: "2-digit" });
    const count = customers.filter((c) => {
      const cd = new Date(c.createdAt);
      return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
    }).length;
    return { month: label, count };
  });

  const totalRevenue = sales.filter((s) => s.customer).reduce((s, r) => s + (r.totalAmount || 0), 0);
  const activeCount = customers.filter((c) => getCustomerStats(c._id).count > 0).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Customer Report</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customer..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-gray-500">Total Customers</p>
          <p className="text-xl font-bold text-blue-700">{customers.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-green-700">{activeCount}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-xs text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold text-purple-700">৳{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <p className="text-xs text-gray-500">Avg/Customer</p>
          <p className="text-xl font-bold text-orange-600">
            ৳{customers.length > 0 ? Math.round(totalRevenue / customers.length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ChartCard title="Top 10 Customers by Revenue">
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={topCustomers} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" width={isMobile ? 60 : 80} tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="total" fill="#1E3A8A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="New Customers (Last 6 Months)">
            <ResponsiveContainer width="100%" height={chartH}>
              <LineChart data={monthlyNew} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: isMobile ? 9 : 11 }} />
                <YAxis width={yAxisW - 20} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [v, "New Customers"]} />
                <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-700 text-sm">Customer List ({filtered.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left border-b">
                <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Phone</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Purchases</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Total Spent (৳)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No customers found</td></tr>
              ) : filtered.map((c, i) => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.phone || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{c.email || "—"}</td>
                  <td className="px-4 py-3">{c.count}</td>
                  <td className="px-4 py-3 font-semibold text-blue-700">৳{c.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
