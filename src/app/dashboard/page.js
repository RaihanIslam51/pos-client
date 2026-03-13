"use client";
import { useState, useEffect } from "react";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentSales from "@/components/dashboard/RecentSales";
import LowStockAlert from "@/components/dashboard/LowStockAlert";
import MonthlySalesChart from "@/components/dashboard/MonthlySalesChart";
import Link from "next/link";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, lowStockRes, chartRes, salesReportRes] = await Promise.all([
          api.getDashboardStats(true),
          api.getLowStock(),
          api.getMonthlySalesChart(`?year=${now.getFullYear()}&month=${now.getMonth() + 1}`),
          api.getSalesReport(),
        ]);

        const dashboardData = statsRes?.data || {};
        const fallbackTotals = salesReportRes?.data?.totals || {};

        setStats({
          ...dashboardData,
          totalSales: dashboardData.totalSales || {
            total: fallbackTotals.totalRevenue || 0,
            count: fallbackTotals.totalTransactions || 0,
          },
        });
        setLowStock(lowStockRes.data);
        setChartData(chartRes.data || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { label: "New Sale", href: "/dashboard/pos", icon: "🛒", color: "bg-[#1E3A8A] text-white" },
    { label: "Add Product", href: "/dashboard/products", icon: "📦", color: "bg-green-600 text-white" },
    { label: "Add Customer", href: "/dashboard/customers", icon: "👤", color: "bg-purple-600 text-white" },
    { label: "Purchase Stock", href: "/dashboard/inventory", icon: "🏪", color: "bg-orange-500 text-white" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E3A8A]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Welcome Banner */}
      {/* <div className="bg-linear-to-r from-[#1E3A8A] to-blue-600 rounded-xl p-4 lg:p-6 text-white shadow-lg">
        <h2 className="text-lg lg:text-xl font-bold">Welcome back, Admin! 👋</h2>
        <p className="text-blue-200 text-sm mt-1">Here's what's happening in your store today.</p>
        <div className="flex gap-3 mt-4 flex-wrap">
          <Link
            href="/dashboard/pos"
            className="bg-white text-[#1E3A8A] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            Start Selling
          </Link>
          <Link
            href="/dashboard/reports"
            className="border border-blue-400 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            View Reports
          </Link>
        </div>
      </div> */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Today's Sales"
          value={`৳${stats?.todaySales?.total?.toFixed(0) || 0}`}
          subtitle={`${stats?.todaySales?.count || 0} transactions`}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Monthly Revenue"
          value={`৳${stats?.monthSales?.total?.toFixed(0) || 0}`}
          subtitle={`${stats?.monthSales?.count || 0} this month`}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <StatsCard
          title="Total Sales"
          value={`৳${stats?.totalSales?.total?.toFixed(0) || 0}`}
          subtitle={`${stats?.totalSales?.count || 0} all transactions`}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2M5 9h14l-1 10H6L5 9z" />
            </svg>
          }
        />
        <StatsCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          subtitle="Active products"
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <StatsCard
          title="Low Stock"
          value={stats?.lowStockCount || 0}
          subtitle="Need restocking"
          color="red"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      {/* <div>
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`${action.color} rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity shadow-sm`}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm font-semibold">{action.label}</span>
            </Link>
          ))}
        </div>
      </div> */}

       {/* Monthly Sales Chart */}
      <MonthlySalesChart
        data={chartData}
        month={currentMonth}
        year={currentYear}
      />

      {/* Recent Sales & Low Stock */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <div className="xl:col-span-2">
          <RecentSales sales={stats?.recentSales || []} />
        </div>
        <div>
          <LowStockAlert products={lowStock} />
        </div>
      </div>

     
    </div>
  );
}
