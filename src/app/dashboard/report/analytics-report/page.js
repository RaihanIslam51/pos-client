"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function AnalyticsReportPage() {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    Promise.all([api.getSales(), api.getDashboardStats()])
      .then(([sRes, stRes]) => { setSales(sRes.data || []); setStats(stRes.data || stRes); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const yearlySales = sales.filter((s) => new Date(s.createdAt).getFullYear() === Number(year) && s.status !== "cancelled");

  const monthlyData = months.map((m, i) => {
    const mSales = yearlySales.filter((s) => new Date(s.createdAt).getMonth() === i);
    return {
      month: m,
      count: mSales.length,
      revenue: mSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    };
  });

  const peakMonth = monthlyData.reduce((max, m) => m.revenue > max.revenue ? m : max, monthlyData[0] || { month: "—", revenue: 0 });
  const avgMonthly = monthlyData.reduce((s, m) => s + m.revenue, 0) / 12;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics Report</h1>
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex gap-4 items-center">
        <label className="text-sm font-medium text-gray-700">Year:</label>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100"><p className="text-xs text-gray-500">Year Revenue</p><p className="text-xl font-bold text-blue-700">৳{yearlySales.reduce((s, r) => s + (r.totalAmount || 0), 0).toLocaleString()}</p></div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100"><p className="text-xs text-gray-500">Orders</p><p className="text-xl font-bold text-green-700">{yearlySales.length}</p></div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100"><p className="text-xs text-gray-500">Peak Month</p><p className="text-xl font-bold text-purple-700">{peakMonth.month}</p></div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100"><p className="text-xs text-gray-500">Monthly Avg</p><p className="text-xl font-bold text-orange-600">৳{avgMonthly.toFixed(0)}</p></div>
      </div>

      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 font-semibold text-gray-700 text-sm">Monthly Sales — {year}</div>
          <div className="p-4">
            {monthlyData.map((row) => {
              const max = Math.max(...monthlyData.map((m) => m.revenue));
              const pct = max > 0 ? (row.revenue / max) * 100 : 0;
              return (
                <div key={row.month} className="flex items-center gap-3 mb-2">
                  <span className="w-10 text-xs text-gray-500 text-right">{row.month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-32 text-xs text-gray-700 font-medium">৳{row.revenue.toLocaleString()} ({row.count})</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
