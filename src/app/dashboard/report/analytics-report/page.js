"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import {
  ResponsiveContainer, ComposedChart, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart,
} from "recharts";

function useWindowSize() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    let t; const h = () => { clearTimeout(t); t = setTimeout(() => setW(window.innerWidth), 100); };
    window.addEventListener("resize", h); return () => { clearTimeout(t); window.removeEventListener("resize", h); };
  }, []);
  return w;
}

function StatCard({ label, value, sub, color = "blue" }) {
  const cls = {
    blue: "bg-blue-50 border-blue-100 text-blue-700",
    green: "bg-emerald-50 border-emerald-100 text-emerald-700",
    purple: "bg-purple-50 border-purple-100 text-purple-700",
    orange: "bg-orange-50 border-orange-100 text-orange-600",
  }[color] || "bg-blue-50 border-blue-100 text-blue-700";
  return (
    <div className={`rounded-xl p-4 border ${cls.split(" ").slice(0,2).join(" ")}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-xl sm:text-2xl font-bold ${cls.split(" ")[2]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AnalyticsReportPage() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const windowWidth = useWindowSize();

  useEffect(() => {
    Promise.all([api.getSales(), api.getDashboardStats()])
      .then(([sRes, stRes]) => { setSales(sRes.data || []); setStats(stRes.data || stRes); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const isMobile = windowWidth < 640;
  const chartH = isMobile ? 220 : 280;
  const yAxisW = isMobile ? 48 : 64;

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const yearlySales = sales.filter((s) => new Date(s.createdAt).getFullYear() === Number(year) && s.status !== "cancelled");

  const monthlyData = months.map((m, i) => {
    const mSales = yearlySales.filter((s) => new Date(s.createdAt).getMonth() === i);
    return {
      month: m,
      Orders: mSales.length,
      Revenue: Math.round(mSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0)),
    };
  });

  const peakMonth = monthlyData.reduce((max, m) => m.Revenue > max.Revenue ? m : max, monthlyData[0] || { month: "—", Revenue: 0 });
  const avgMonthly = monthlyData.reduce((s, m) => s + m.Revenue, 0) / 12;
  const totalRevenue = yearlySales.reduce((s, r) => s + (r.totalAmount || 0), 0);

  const fmtK = (v) => v >= 1000 ? `৳${(v/1000).toFixed(0)}k` : `৳${v}`;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Analytics Report</h1>
        <div className="flex items-center gap-2 bg-white rounded-xl shadow px-3 py-2 w-fit">
          <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Year:</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}
            className="border-0 text-sm font-semibold text-blue-700 focus:outline-none bg-transparent touch-manipulation">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Year Revenue" value={`৳${totalRevenue.toLocaleString()}`} color="blue" />
        <StatCard label="Total Orders" value={yearlySales.length} color="green" />
        <StatCard label="Peak Month" value={peakMonth.month} sub={`৳${peakMonth.Revenue.toLocaleString()}`} color="purple" />
        <StatCard label="Monthly Avg" value={`৳${Math.round(avgMonthly).toLocaleString()}`} color="orange" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">Loading data...</div>
      ) : (
        <>
          {/* Revenue Area Chart */}
          <div className="bg-white rounded-xl shadow">
            <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
              <h2 className="font-semibold text-gray-700 text-sm">Monthly Revenue — {year}</h2>
            </div>
            <div className="p-3 sm:p-4">
              <ResponsiveContainer width="100%" height={chartH}>
                <AreaChart data={monthlyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: isMobile ? 9 : 11 }} interval={isMobile ? "preserveStartEnd" : 0} />
                  <YAxis width={yAxisW} tickFormatter={fmtK} tick={{ fontSize: isMobile ? 9 : 11 }} />
                  <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, "Revenue"]} />
                  <Area type="monotone" dataKey="Revenue" stroke="#1E3A8A" strokeWidth={2} fill="url(#revGrad)" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders Bar + Combined */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow">
              <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                <h2 className="font-semibold text-gray-700 text-sm">Monthly Orders — {year}</h2>
              </div>
              <div className="p-3 sm:p-4">
                <ResponsiveContainer width="100%" height={chartH}>
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: isMobile ? 9 : 11 }} interval={isMobile ? "preserveStartEnd" : 0} />
                    <YAxis allowDecimals={false} tick={{ fontSize: isMobile ? 9 : 11 }} width={36} />
                    <Tooltip formatter={(v) => [v, "Orders"]} />
                    <Bar dataKey="Orders" fill="#10B981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow">
              <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                <h2 className="font-semibold text-gray-700 text-sm">Revenue vs Orders — {year}</h2>
              </div>
              <div className="p-3 sm:p-4">
                <ResponsiveContainer width="100%" height={chartH}>
                  <ComposedChart data={monthlyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: isMobile ? 9 : 11 }} interval={isMobile ? "preserveStartEnd" : 0} />
                    <YAxis yAxisId="left" width={yAxisW} tickFormatter={fmtK} tick={{ fontSize: isMobile ? 9 : 11 }} />
                    <YAxis yAxisId="right" orientation="right" allowDecimals={false} width={32} tick={{ fontSize: isMobile ? 9 : 11 }} />
                    <Tooltip formatter={(v, n) => [n === "Revenue" ? `৳${v.toLocaleString()}` : v, n]} />
                    <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                    <Bar yAxisId="left" dataKey="Revenue" fill="#1E3A8A" radius={[3, 3, 0, 0]} opacity={0.85} />
                    <Line yAxisId="right" type="monotone" dataKey="Orders" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Monthly table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-700 text-sm">Monthly Breakdown — {year}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left border-b">
                    <th className="px-4 py-3 font-semibold text-gray-600">Month</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Orders</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Revenue (৳)</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right hidden sm:table-cell">Avg/Order (৳)</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right hidden sm:table-cell">% of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((row) => (
                    <tr key={row.month} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{row.month} {year}</td>
                      <td className="px-4 py-3 text-right">{row.Orders}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-700">৳{row.Revenue.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-600">
                        ৳{row.Orders > 0 ? Math.round(row.Revenue / row.Orders).toLocaleString() : 0}
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-500">
                        {totalRevenue > 0 ? ((row.Revenue / totalRevenue) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
