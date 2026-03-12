"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, RadialBarChart, RadialBar,
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

export default function OverviewReportPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 640;
  const chartH = isMobile ? 200 : 240;

  useEffect(() => {
    api.getDashboardStats()
      .then((res) => setStats(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-48 text-gray-400">Loading overview...</div>;

  const totalSales = stats?.totalSales || 0;
  const totalPurchases = stats?.totalPurchases || 0;
  const totalExpenses = stats?.totalExpenses || 0;
  const netProfit = totalSales - totalPurchases - totalExpenses;

  const revenueBreakdown = [
    { name: "Sales", amount: totalSales, fill: "#10B981" },
    { name: "Purchases", amount: totalPurchases, fill: "#EF4444" },
    { name: "Expenses", amount: totalExpenses, fill: "#F59E0B" },
  ];

  const radialData = [
    { name: "Sales", value: totalSales, fill: "#10B981" },
    { name: "Purchases", value: totalPurchases, fill: "#EF4444" },
    { name: "Expenses", value: totalExpenses, fill: "#F59E0B" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Overview Report</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Sales", value: `৳${totalSales.toLocaleString()}`, cls: "bg-green-50 border-green-100 text-green-700" },
          { label: "Total Purchases", value: `৳${totalPurchases.toLocaleString()}`, cls: "bg-blue-50 border-blue-100 text-blue-700" },
          { label: "Total Expenses", value: `৳${totalExpenses.toLocaleString()}`, cls: "bg-red-50 border-red-100 text-red-600" },
          { label: "Net Profit", value: `৳${netProfit.toLocaleString()}`, cls: netProfit >= 0 ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-700" },
        ].map((c) => (
          <div key={c.label} className={`rounded-xl p-4 border ${c.cls.split(" ")[0]} ${c.cls.split(" ")[1]}`}>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.cls.split(" ")[2]}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Total Products", value: stats?.totalProducts || 0, cls: "bg-indigo-50 border-indigo-100 text-indigo-700" },
          { label: "Total Customers", value: stats?.totalCustomers || 0, cls: "bg-teal-50 border-teal-100 text-teal-700" },
          { label: "Total Suppliers", value: stats?.totalSuppliers || 0, cls: "bg-orange-50 border-orange-100 text-orange-600" },
          { label: "Low Stock Items", value: stats?.lowStockCount || 0, cls: "bg-yellow-50 border-yellow-100 text-yellow-700" },
        ].map((c) => (
          <div key={c.label} className={`rounded-xl p-4 border ${c.cls.split(" ")[0]} ${c.cls.split(" ")[1]}`}>
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-xl font-bold ${c.cls.split(" ")[2]}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard title="Financial Overview">
          <ResponsiveContainer width="100%" height={chartH}>
            <BarChart data={revenueBreakdown} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis width={isMobile ? 52 : 64} tickFormatter={fmtK} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, "Amount"]} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {revenueBreakdown.map((d) => <Bar key={d.name} dataKey="amount" fill={d.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* P&L Summary */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h3 className="font-semibold text-gray-700 text-sm mb-4">Profit & Loss Statement</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Gross Revenue</span>
              <span className="font-semibold text-green-700">৳{totalSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Cost of Goods</span>
              <span className="font-semibold text-red-600">-৳{totalPurchases.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Gross Profit</span>
              <span className={`font-semibold ${(totalSales - totalPurchases) >= 0 ? "text-blue-700" : "text-red-600"}`}>
                ৳{(totalSales - totalPurchases).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">Operating Expenses</span>
              <span className="font-semibold text-red-600">-৳{totalExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 pt-3 border-t-2 border-gray-300">
              <span className="font-bold text-gray-800 text-base">Net Profit / Loss</span>
              <span className={`text-lg font-bold ${netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>
                {netProfit >= 0 ? "" : "-"}৳{Math.abs(netProfit).toLocaleString()}
              </span>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-gray-50">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Profit Margin</span>
                <span className={`font-semibold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
