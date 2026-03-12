"use client";
import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { api } from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const CHART_COLORS = [
  "#1E3A8A", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316",
  "#6366F1", "#84CC16",
];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmtMoney = (n) =>
  `৳${(n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmtMonth = (yyyymm) => {
  if (!yyyymm) return "";
  const [y, m] = yyyymm.split("-");
  return `${MONTH_NAMES[parseInt(m, 10) - 1]} ${y}`;
};

const fmtDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
};

// ─── Window size hook ─────────────────────────────────────────────────────────
function useWindowSize() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, label, value, bg, textColor, sub }) {
  return (
    <div className={`rounded-xl sm:rounded-2xl border border-white/50 p-3 sm:p-5 flex flex-col gap-1.5 sm:gap-2 shadow-sm hover:shadow-md transition-shadow active:scale-95 sm:active:scale-100 ${bg}`}>
      <span className="text-xl sm:text-2xl">{icon}</span>
      <p className={`text-base sm:text-2xl font-bold leading-tight truncate ${textColor}`}>{value}</p>
      <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">{label}</p>
      {sub && <p className="text-[10px] sm:text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function ChartCard({ title, subtitle, children, action }) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-5 flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col xs:flex-row xs:items-start sm:items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-800 text-sm sm:text-base">{title}</h2>
          {subtitle && <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 leading-tight">{subtitle}</p>}
        </div>
        {action && <div className="no-print shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}

function TabBar({ tabs, active, onChange, activeColor = "bg-[#1E3A8A]" }) {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-[11px] sm:text-xs">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`px-2.5 sm:px-3 py-1.5 sm:py-2 font-semibold capitalize transition touch-manipulation ${
            active === t.value
              ? `${activeColor} text-white`
              : "text-gray-500 hover:bg-gray-50 active:bg-gray-100"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function CustomTooltipMoney({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-35">
      <p className="text-xs font-semibold text-gray-500 mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-4 text-xs">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-bold text-gray-800">
            {typeof p.value === "number" && p.name?.toLowerCase().includes("order")
              ? p.value
              : fmtMoney(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ComprehensiveReportPage() {
  const windowWidth = useWindowSize();
  const isMobile    = windowWidth < 640;

  // ── Chart dimensions (responsive) ───────────────────────────────────────
  const chartH      = isMobile ? 200 : 260;
  const yAxisW      = isMobile ? 44  : 58;
  const xTickSz     = isMobile ? 9   : 10;
  const barMax      = isMobile ? 22  : 28;
  const stockYW     = isMobile ? 72  : 90;

  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [salesTab,   setSalesTab]   = useState("monthly");
  const [perfTab,    setPerfTab]    = useState("top");
  const [startDate,  setStartDate]  = useState("");
  const [endDate,    setEndDate]    = useState("");
  const [categories, setCategories] = useState([]);
  const [products,   setProducts]   = useState([]);
  const [selCategory, setSelCategory] = useState("");
  const [selProduct,  setSelProduct]  = useState("");

  // Load filter lists once
  useEffect(() => {
    api.getCategories().then((r) => setCategories(r.data || [])).catch(() => {});
    api.getProducts().then((r)   => setProducts(r.data   || [])).catch(() => {});
  }, []);

  // Fetch report data whenever filters change
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams();
      if (startDate)   params.append("startDate", startDate);
      if (endDate)     params.append("endDate",   endDate);
      if (selCategory) params.append("category",  selCategory);
      if (selProduct)  params.append("productId", selProduct);
      const qs  = params.toString() ? `?${params}` : "";
      const res = await api.getComprehensiveReport(qs);
      if (res?.data) {
        setData(res.data);
      } else {
        throw new Error(res?.message || "Invalid response from server");
      }
    } catch (err) {
      console.error("Report fetch error:", err);
      setFetchError(err.message || "Failed to load report data");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selCategory, selProduct]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── CSV export ──────────────────────────────────────────────────────────
  const handleDownloadCSV = () => {
    if (!data) return;
    const rows = [];

    rows.push(["COMPREHENSIVE REPORT", `Generated: ${new Date().toLocaleString()}`]);
    rows.push([]);
    rows.push(["=== SUMMARY ==="]);
    rows.push(["Metric", "Value"]);
    rows.push(["Total Products",        data.summary.totalProducts]);
    rows.push(["Total Sales Amount",    data.summary.totalSalesAmount.toFixed(2)]);
    rows.push(["Total Sales Count",     data.summary.totalSalesCount]);
    rows.push(["Total Purchase Amount", data.summary.totalPurchaseAmount.toFixed(2)]);
    rows.push(["Total Profit",          data.summary.totalProfit.toFixed(2)]);
    rows.push(["Low Stock Alerts",      data.summary.lowStockCount]);
    rows.push(["Today Sales Amount",    data.summary.todaysSales.total.toFixed(2)]);
    rows.push(["Today Sales Count",     data.summary.todaysSales.count]);

    rows.push([]);
    rows.push(["=== MONTHLY SALES TREND ==="]);
    rows.push(["Month", "Sales (BDT)", "Orders"]);
    data.salesTrends.monthly.forEach((r) =>
      rows.push([fmtMonth(r._id), r.sales.toFixed(2), r.count])
    );

    rows.push([]);
    rows.push(["=== TOP SELLING PRODUCTS ==="]);
    rows.push(["Product", "Qty Sold", "Revenue (BDT)"]);
    data.productPerformance.topSelling.forEach((r) =>
      rows.push([r.productName || r._id, r.totalQuantity, r.totalRevenue.toFixed(2)])
    );

    rows.push([]);
    rows.push(["=== LEAST SELLING PRODUCTS ==="]);
    rows.push(["Product", "Qty Sold", "Revenue (BDT)"]);
    data.productPerformance.leastSelling.forEach((r) =>
      rows.push([r.productName || r._id, r.totalQuantity, r.totalRevenue.toFixed(2)])
    );

    rows.push([]);
    rows.push(["=== CATEGORY ANALYSIS ==="]);
    rows.push(["Category", "Sales (BDT)", "Qty", "Percentage"]);
    data.categoryAnalysis.forEach((r) =>
      rows.push([r.categoryName, r.totalSales.toFixed(2), r.totalQty, `${r.percentage}%`])
    );

    rows.push([]);
    rows.push(["=== STOCK MONITORING ==="]);
    rows.push(["Product", "Category", "Current Stock", "Alert Qty", "Status"]);
    data.stockMonitoring.forEach((r) =>
      rows.push([r.name, r.category, r.stock, r.alertQuantity, r.isLow ? "LOW STOCK" : "OK"])
    );

    rows.push([]);
    rows.push(["=== PURCHASE VS SALES (LAST 12 MONTHS) ==="]);
    rows.push(["Month", "Purchases (BDT)", "Sales (BDT)"]);
    data.purchaseVsSales.forEach((r) =>
      rows.push([fmtMonth(r.month), r.purchases.toFixed(2), r.sales.toFixed(2)])
    );

    rows.push([]);
    rows.push(["=== PROFIT ANALYSIS (LAST 12 MONTHS) ==="]);
    rows.push(["Month", "Sales (BDT)", "Purchases (BDT)", "Profit (BDT)"]);
    data.profitAnalysis.forEach((r) =>
      rows.push([fmtMonth(r.month), r.sales.toFixed(2), r.purchases.toFixed(2), r.profit.toFixed(2)])
    );

    rows.push([]);
    rows.push(["=== LOW STOCK PRODUCTS ==="]);
    rows.push(["Product", "Category", "Current Stock", "Alert Qty"]);
    data.lowStockProducts.forEach((r) =>
      rows.push([r.name, r.category, r.stock, r.alertQuantity])
    );

    const csv = rows
      .map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `comprehensive-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── PDF / Print ─────────────────────────────────────────────────────────
  const handlePrint = () => window.print();

  // ── Derived chart data ───────────────────────────────────────────────────
  const salesChartData = data
    ? salesTab === "daily"
      ? (data.salesTrends?.daily   || []).map((d) => ({ name: fmtDate(d._id), sales: d.sales, orders: d.count }))
      : salesTab === "weekly"
      ? (data.salesTrends?.weekly  || []).map((d) => ({ name: d.week,         sales: d.sales, orders: d.count }))
      : (data.salesTrends?.monthly || []).map((d) => ({ name: fmtMonth(d._id), sales: d.sales, orders: d.count }))
    : [];

  const perfChartData = data
    ? perfTab === "top"
      ? (data.productPerformance?.topSelling   || []).map((p) => ({ name: (p.productName || "Unknown").slice(0, 18), qty: p.totalQuantity, revenue: p.totalRevenue }))
      : (data.productPerformance?.leastSelling || []).map((p) => ({ name: (p.productName || "Unknown").slice(0, 18), qty: p.totalQuantity, revenue: p.totalRevenue }))
    : [];

  const pieData    = data ? (data.categoryAnalysis || []).slice(0, 10).map((c) => ({ name: c.categoryName, value: c.totalSales, percentage: c.percentage })) : [];
  const stockData  = data ? (data.stockMonitoring  || []).slice(0, 15).map((p) => ({ name: p.name.slice(0, 20), stock: p.stock, alert: p.alertQuantity, isLow: p.isLow })) : [];
  const pvsData    = data ? (data.purchaseVsSales   || []).map((d) => ({ name: fmtMonth(d.month), purchases: d.purchases, sales: d.sales })) : [];
  const profitData = data ? (data.profitAnalysis    || []).map((d) => ({ name: fmtMonth(d.month), profit: d.profit, sales: d.sales, purchases: d.purchases })) : [];

  const summary = data?.summary || {};
  const profitPositive = (summary.totalProfit || 0) >= 0;

  const statCards = [
    {
      icon: "📦", label: "Total Products",
      value: (summary.totalProducts || 0).toLocaleString(),
      bg: "bg-blue-50", textColor: "text-blue-700",
    },
    {
      icon: "💵", label: "Total Sales",
      value: fmtMoney(summary.totalSalesAmount),
      sub: `${summary.totalSalesCount || 0} orders`,
      bg: "bg-emerald-50", textColor: "text-emerald-700",
    },
    {
      icon: "🛒", label: "Total Purchase",
      value: fmtMoney(summary.totalPurchaseAmount),
      bg: "bg-purple-50", textColor: "text-purple-700",
    },
    {
      icon: profitPositive ? "📈" : "📉", label: "Total Profit",
      value: fmtMoney(summary.totalProfit),
      bg: profitPositive ? "bg-teal-50" : "bg-red-50",
      textColor: profitPositive ? "text-teal-700" : "text-red-600",
    },
    {
      icon: "⚠️", label: "Low Stock Alerts",
      value: (summary.lowStockCount || 0).toString(),
      bg: "bg-orange-50", textColor: "text-orange-600",
    },
    {
      icon: "🕐", label: "Today's Sales",
      value: fmtMoney(summary.todaysSales?.total),
      sub: `${summary.todaysSales?.count || 0} orders`,
      bg: "bg-pink-50", textColor: "text-pink-700",
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print   { display: none !important; }
          .print-break { break-before: page; }
          body { background: #fff; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .recharts-wrapper { overflow: visible !important; }
        }
      `}</style>

      <div className="space-y-4 sm:space-y-6 max-w-400 mx-auto">

        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Comprehensive Report</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Full business analytics — all charts, filters &amp; exports</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              disabled={!data || loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm touch-manipulation"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden xs:inline">Download </span>CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#1e3a8a]/90 transition shadow-sm touch-manipulation"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden xs:inline">Download </span>PDF
            </button>
          </div>
        </div>

        {/* ── Filters ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4 no-print">
          <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 sm:mb-3">Filters</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <div>
              <label className="text-[10px] sm:text-xs font-medium text-gray-600 block mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A]"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs font-medium text-gray-600 block mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A]"
              />
            </div>
            <div>
              <label className="text-[10px] sm:text-xs font-medium text-gray-600 block mb-1">Category</label>
              <select
                value={selCategory}
                onChange={(e) => setSelCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A]"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] sm:text-xs font-medium text-gray-600 block mb-1">Product</label>
              <select
                value={selProduct}
                onChange={(e) => setSelProduct(e.target.value)}
                className="w-full border border-gray-200 rounded-lg sm:rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30 focus:border-[#1E3A8A]"
              >
                <option value="">All Products</option>
                {products
                  .filter((p) => !selCategory || p.category?._id === selCategory || p.category === selCategory)
                  .map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
              </select>
            </div>
          </div>
          {(startDate || endDate || selCategory || selProduct) && (
            <button
              onClick={() => { setStartDate(""); setEndDate(""); setSelCategory(""); setSelProduct(""); }}
              className="mt-2 sm:mt-3 px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-500 hover:bg-gray-50 transition font-medium touch-manipulation"
            >
              Clear All
            </button>
          )}
        </div>

        {/* ── Loading ──────────────────────────────────────────── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-12 h-12 border-4 border-[#1E3A8A]/20 border-t-[#1E3A8A] rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading report data…</p>
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-2xl border border-red-100">
            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50 text-2xl">⚠️</div>
            <div className="text-center">
              <p className="font-semibold text-gray-700 mb-1">Failed to load report</p>
              <p className="text-sm text-red-500 max-w-sm">{fetchError}</p>
            </div>
            <button
              onClick={fetchData}
              className="px-5 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:bg-[#1e3a8a]/90 transition"
            >
              Retry
            </button>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 bg-white rounded-2xl border border-gray-100">
            <span className="text-4xl">📊</span>
            <p className="text-gray-400 text-sm">No report data found for the selected filters.</p>
            <button
              onClick={fetchData}
              className="px-5 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition"
            >
              Reload
            </button>
          </div>
        ) : (
          <>
            {/* ── Summary Cards ──────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4">
              {statCards.map((card, i) => (
                <StatCard key={i} {...card} />
              ))}
            </div>

            {/* ── Row 1: Sales Analytics + Product Performance ─ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

              {/* 1. Sales Analytics – Line Chart */}
              <ChartCard
                title="Sales Analytics"
                subtitle="Revenue trend over time"
                action={
                  <TabBar
                    tabs={[
                      { value: "daily",   label: "Daily"   },
                      { value: "weekly",  label: "Weekly"  },
                      { value: "monthly", label: "Monthly" },
                    ]}
                    active={salesTab}
                    onChange={setSalesTab}
                  />
                }
              >
                {salesChartData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 sm:h-65 text-gray-300 text-sm">No data for this range</div>
                ) : (
                  <ResponsiveContainer width="100%" height={chartH}>
                    <LineChart data={salesChartData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: xTickSz }} tickLine={false} interval={isMobile ? "preserveStartEnd" : 0} />
                      <YAxis
                        tick={{ fontSize: xTickSz }}
                        width={yAxisW}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v >= 1000 ? `৳${(v / 1000).toFixed(0)}k` : `৳${v}`}
                      />
                      <Tooltip content={<CustomTooltipMoney />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Line
                        type="monotone" dataKey="sales" stroke="#1E3A8A"
                        strokeWidth={2.5} dot={false} name="Sales (৳)"
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                      <Line
                        type="monotone" dataKey="orders" stroke="#10B981"
                        strokeWidth={2} dot={false} name="Orders"
                        activeDot={{ r: 5, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* 2. Product Performance – Bar Chart */}
              <ChartCard
                title="Product Performance"
                subtitle="By quantity sold"
                action={
                  <TabBar
                    tabs={[
                      { value: "top",   label: "Top Selling"   },
                      { value: "least", label: "Least Selling" },
                    ]}
                    active={perfTab}
                    onChange={setPerfTab}
                    activeColor={perfTab === "top" ? "bg-[#1E3A8A]" : "bg-orange-500"}
                  />
                }
              >
                {perfChartData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 sm:h-65 text-gray-300 text-sm">No sales data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={chartH}>
                    <BarChart
                      data={perfChartData}
                      margin={{ top: 5, right: 8, left: 0, bottom: isMobile ? 35 : 45 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: xTickSz }}
                        tickLine={false}
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: xTickSz }} tickLine={false} axisLine={false} width={30} />
                      <Tooltip
                        formatter={(v, name) =>
                          name === "qty" ? [v, "Qty Sold"] : [fmtMoney(v), "Revenue"]
                        }
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Bar
                        dataKey="qty"
                        name="Qty Sold"
                        fill={perfTab === "top" ? "#1E3A8A" : "#F59E0B"}
                        radius={[6, 6, 0, 0]}
                        maxBarSize={40}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* ── Row 2: Category Analysis + Stock Monitoring ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

              {/* 3. Category Analysis – Pie Chart */}
              <ChartCard title="Category Analysis" subtitle="Sales distribution by category">
                {pieData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 sm:h-65 text-gray-300 text-sm">No category data</div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={95}
                          innerRadius={40}
                          paddingAngle={2}
                          label={false}
                        >
                          {pieData.map((_, idx) => (
                            <Cell
                              key={idx}
                              fill={CHART_COLORS[idx % CHART_COLORS.length]}
                              stroke="white"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => [fmtMoney(v), "Sales"]} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="flex sm:flex-col flex-wrap gap-x-3 gap-y-1.5 sm:gap-2 w-full sm:w-auto sm:min-w-37.5 sm:max-h-60 overflow-y-auto pr-1">
                      {pieData.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <span
                            className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                          />
                          <span className="text-[10px] sm:text-xs text-gray-600 truncate flex-1">{item.name}</span>
                          <span className="text-[10px] sm:text-xs font-bold text-gray-800 ml-auto">{item.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ChartCard>

              {/* 4. Stock Monitoring – Horizontal Bar Chart */}
              <ChartCard
                title="Stock Monitoring"
                subtitle={
                  <span>
                    Current stock levels –{" "}
                    <span className="text-red-500 font-medium">red = low stock</span>
                  </span>
                }
              >
                {stockData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 sm:h-65 text-gray-300 text-sm">No stock data</div>
                ) : (
                  <div className="overflow-x-auto -mx-3 sm:mx-0">
                  <div style={{ minWidth: isMobile ? 280 : "auto" }}>
                  <ResponsiveContainer width="100%" height={Math.max(isMobile ? 200 : 240, stockData.length * (isMobile ? 24 : 28))}>
                    <BarChart
                      data={stockData}
                      layout="vertical"
                      margin={{ top: 5, right: isMobile ? 24 : 40, left: 4, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: xTickSz }} tickLine={false} axisLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: xTickSz }}
                        width={stockYW}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(v, name) => [
                          v,
                          name === "stock" ? "Current Stock" : "Alert Level",
                        ]}
                      />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="stock" name="Current Stock" radius={[0, 6, 6, 0]} maxBarSize={18}>
                        {stockData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.isLow ? "#EF4444" : "#10B981"} />
                        ))}
                      </Bar>
                      <Bar
                        dataKey="alert"
                        name="Alert Level"
                        fill="#F59E0B"
                        radius={[0, 6, 6, 0]}
                        maxBarSize={18}
                        opacity={0.45}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                  </div>
                )}
              </ChartCard>
            </div>

            {/* ── Row 3: Purchase vs Sales + Profit Analysis ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 print-break">

              {/* 5. Purchase vs Sales – Grouped Bar Chart */}
              <ChartCard title="Purchase vs Sales" subtitle="Monthly comparison – last 12 months">
                {pvsData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 sm:h-65 text-gray-300 text-sm">No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={chartH}>
                    <BarChart data={pvsData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: xTickSz }} tickLine={false} interval={isMobile ? "preserveStartEnd" : 0} />
                      <YAxis
                        tick={{ fontSize: xTickSz }}
                        width={yAxisW}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v >= 1000 ? `৳${(v / 1000).toFixed(0)}k` : `৳${v}`}
                      />
                      <Tooltip formatter={(v) => [fmtMoney(v), ""]} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="purchases" name="Purchase"  fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={barMax} />
                      <Bar dataKey="sales"     name="Sales"     fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={barMax} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              {/* 6. Profit Analysis – Area Chart */}
              <ChartCard title="Profit Analysis" subtitle="Monthly profit trend – last 12 months">
                {profitData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 sm:h-65 text-gray-300 text-sm">No data</div>
                ) : (
                  <ResponsiveContainer width="100%" height={chartH}>
                    <AreaChart data={profitData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#10B981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="salesGradA" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#1E3A8A" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: xTickSz }} tickLine={false} interval={isMobile ? "preserveStartEnd" : 0} />
                      <YAxis
                        tick={{ fontSize: xTickSz }}
                        width={yAxisW}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => v >= 1000 ? `৳${(v / 1000).toFixed(0)}k` : `৳${v}`}
                      />
                      <Tooltip content={<CustomTooltipMoney />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                      <Area
                        type="monotone" dataKey="sales" stroke="#1E3A8A"
                        fill="url(#salesGradA)" strokeWidth={2} name="Sales"
                      />
                      <Area
                        type="monotone" dataKey="profit" stroke="#10B981"
                        fill="url(#profitGrad)" strokeWidth={2.5} name="Profit"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* ── Low Stock Products Table ──────────────────────── */}
            {(data.lowStockProducts?.length > 0) && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-orange-100 bg-linear-to-r from-orange-50 to-amber-50 flex items-center gap-2">
                  <span className="text-base sm:text-lg">⚠️</span>
                  <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Low Stock Products</h2>
                  <span className="ml-auto text-[10px] sm:text-xs font-semibold text-orange-600 bg-orange-100 px-2 sm:px-2.5 py-0.5 rounded-full">
                    {data.lowStockProducts.length} items
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                        <th className="px-2 sm:px-5 py-2 sm:py-3 text-left font-semibold hidden sm:table-cell">#</th>
                        <th className="px-2 sm:px-5 py-2 sm:py-3 text-left font-semibold">Product</th>
                        <th className="px-2 sm:px-5 py-2 sm:py-3 text-left font-semibold hidden sm:table-cell">Category</th>
                        <th className="px-2 sm:px-5 py-2 sm:py-3 text-center font-semibold">Stock</th>
                        <th className="px-2 sm:px-5 py-2 sm:py-3 text-center font-semibold hidden xs:table-cell">Alert</th>
                        <th className="px-2 sm:px-5 py-2 sm:py-3 text-center font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.lowStockProducts.map((prod, i) => (
                        <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-2 sm:px-5 py-2 sm:py-3 text-gray-400 hidden sm:table-cell">{i + 1}</td>
                          <td className="px-2 sm:px-5 py-2 sm:py-3 font-semibold text-gray-800 max-w-30 sm:max-w-none truncate">{prod.name}</td>
                          <td className="px-2 sm:px-5 py-2 sm:py-3 text-gray-500 hidden sm:table-cell">{prod.category}</td>
                          <td className="px-2 sm:px-5 py-2 sm:py-3 text-center font-bold text-red-600 text-sm sm:text-base">{prod.stock}</td>
                          <td className="px-2 sm:px-5 py-2 sm:py-3 text-center text-gray-500 hidden xs:table-cell">{prod.alertQuantity}</td>
                          <td className="px-2 sm:px-5 py-2 sm:py-3 text-center">
                            {prod.stock === 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-red-100 text-red-700 rounded-full font-semibold whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                                <span className="hidden sm:inline">Out of </span>Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs px-1.5 sm:px-2.5 py-0.5 sm:py-1 bg-orange-100 text-orange-700 rounded-full font-semibold whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                                Low
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Print Footer ─────────────────────────────────── */}
            <div className="hidden print:block text-center text-xs text-gray-400 pt-4 border-t">
              Generated on {new Date().toLocaleString()} · POS Pro Comprehensive Report
            </div>
          </>
        )}
      </div>
    </>
  );
}
