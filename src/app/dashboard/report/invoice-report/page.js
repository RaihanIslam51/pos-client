"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend,
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

const STATUS_COLORS = { paid: "#10B981", partial: "#F59E0B", unpaid: "#EF4444", cancelled: "#6B7280" };
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

export default function InvoiceReportPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 640;
  const chartH = isMobile ? 200 : 260;
  const yAxisW = isMobile ? 48 : 60;

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
  const unpaid = filtered.filter((s) => !s.paymentStatus || s.paymentStatus === "unpaid").length;
  const cancelled = filtered.filter((s) => s.status === "cancelled").length;

  // Status distribution
  const statusData = [
    { name: "Paid", value: paid, color: "#10B981" },
    { name: "Unpaid", value: unpaid, color: "#EF4444" },
    { name: "Cancelled", value: cancelled, color: "#6B7280" },
  ].filter((d) => d.value > 0);

  // Daily invoice volume (last 10 days)
  const dailyMap = {};
  filtered.forEach((s) => {
    const d = new Date(s.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    dailyMap[d] = (dailyMap[d] || 0) + 1;
  });
  const dailyData = Object.entries(dailyMap).slice(-10).map(([date, count]) => ({ date, count }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Invoice Report</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3 items-end">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search invoice/customer..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-52"
        />
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={fetchSales} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 touch-manipulation">Filter</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-gray-500">Total Invoices</p>
          <p className="text-xl font-bold text-blue-700">{filtered.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-gray-500">Paid</p>
          <p className="text-xl font-bold text-green-700">{paid}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-xs text-gray-500">Unpaid</p>
          <p className="text-xl font-bold text-red-600">{unpaid}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-xs text-gray-500">Total Value (৳)</p>
          <p className="text-xl font-bold text-purple-700">৳{total.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ChartCard title="Daily Invoice Volume">
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={dailyData} margin={{ top: 4, right: 8, left: 0, bottom: isMobile ? 30 : 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: isMobile ? 9 : 11 }} interval={isMobile ? "preserveStartEnd" : 0} />
                <YAxis width={yAxisW - 20} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [v, "Invoices"]} />
                <Bar dataKey="count" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Invoice Status Distribution">
            <ResponsiveContainer width="100%" height={chartH}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 70 : 90}
                  dataKey="value"
                  label={({ name, percent }) => isMobile ? "" : `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-700 text-sm">Invoice List ({filtered.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left border-b">
                <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Invoice No.</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Items</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Total (৳)</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Paid (৳)</th>
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
                  <td className="px-4 py-3 hidden sm:table-cell">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{s.customer?.name || "Walk-in"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{s.items?.length || 0}</td>
                  <td className="px-4 py-3 font-semibold">৳{s.totalAmount?.toLocaleString()}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">৳{s.paidAmount?.toLocaleString() || "0"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.paymentStatus === "paid" ? "bg-green-100 text-green-700" : s.status === "cancelled" ? "bg-gray-100 text-gray-600" : "bg-yellow-100 text-yellow-700"}`}>
                      {s.paymentStatus || s.status || "unpaid"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
