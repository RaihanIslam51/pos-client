"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function OverviewReportPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats().then((res) => setStats(res.data || res)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-gray-400">Loading overview...</div>;

  const cards = [
    { label: "Total Sales", value: `৳${(stats?.totalSales || 0).toLocaleString()}`, color: "blue" },
    { label: "Total Purchases", value: `৳${(stats?.totalPurchases || 0).toLocaleString()}`, color: "purple" },
    { label: "Total Expenses", value: `৳${(stats?.totalExpenses || 0).toLocaleString()}`, color: "red" },
    { label: "Net Profit", value: `৳${((stats?.totalSales || 0) - (stats?.totalPurchases || 0) - (stats?.totalExpenses || 0)).toLocaleString()}`, color: "green" },
    { label: "Total Products", value: stats?.totalProducts || 0, color: "indigo" },
    { label: "Total Customers", value: stats?.totalCustomers || 0, color: "teal" },
    { label: "Total Suppliers", value: stats?.totalSuppliers || 0, color: "orange" },
    { label: "Low Stock Items", value: stats?.lowStockCount || 0, color: "yellow" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Overview Report</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className={`bg-${c.color}-50 rounded-xl p-5 border border-${c.color}-100`}>
            <p className="text-xs text-gray-500 mb-2">{c.label}</p>
            <p className={`text-2xl font-bold text-${c.color}-700`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Business Summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Gross Revenue</span>
            <span className="font-semibold text-blue-700">৳{(stats?.totalSales || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Cost of Goods</span>
            <span className="font-semibold text-red-600">-৳{(stats?.totalPurchases || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-600">Operating Expenses</span>
            <span className="font-semibold text-red-600">-৳{(stats?.totalExpenses || 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-base">
            <span className="text-gray-800">Net Profit / Loss</span>
            <span className={`${((stats?.totalSales || 0) - (stats?.totalPurchases || 0) - (stats?.totalExpenses || 0)) >= 0 ? "text-green-700" : "text-red-700"}`}>
              ৳{((stats?.totalSales || 0) - (stats?.totalPurchases || 0) - (stats?.totalExpenses || 0)).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
