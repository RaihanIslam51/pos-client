"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

function ReportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const startDate = searchParams.get("from") || "";
  const endDate = searchParams.get("to") || "";

  const [report, setReport] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const [repRes, topRes] = await Promise.all([
        api.getSalesReport(params.toString() ? `?${params}` : ""),
        api.getTopProducts(),
      ]);
      setReport(repRes.data);
      setTopProducts(topRes.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const paymentColors = {
    cash: "bg-emerald-500",
    card: "bg-blue-500",
    mobile: "bg-purple-500",
    credit: "bg-orange-500",
  };

  const maxSales = report?.salesByDay?.length
    ? Math.max(...report.salesByDay.map((d) => d.totalSales), 1)
    : 1;

  const statCards = [
    { label: "Total Revenue", value: `৳${report?.totalRevenue?.toFixed(0) || 0}`, icon: "💰", color: "text-[#1E3A8A] bg-blue-50" },
    { label: "Total Sales", value: report?.totalSales || 0, icon: "🧾", color: "text-green-700 bg-green-50" },
    { label: "Avg Order Value", value: `৳${report?.avgOrderValue?.toFixed(0) || 0}`, icon: "📊", color: "text-purple-700 bg-purple-50" },
    { label: "Total Items Sold", value: report?.totalItemsSold || 0, icon: "📦", color: "text-orange-700 bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">From Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setParam("from", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">To Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setParam("to", e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
        </div>
        {(startDate || endDate) && (
          <button
            onClick={() => router.replace(pathname)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A8A]"></div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className={`rounded-xl p-4 ${s.color.split(" ")[1]} border border-gray-100`}>
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sales by Day bar chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Daily Sales Trend</h3>
              {report?.salesByDay?.length ? (
                <div className="space-y-2">
                  {report.salesByDay.slice(-10).map((day) => (
                    <div key={day._id} className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 w-20 shrink-0">{new Date(day._id).toLocaleDateString("en-BD", { month: "short", day: "numeric" })}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full bg-[#1E3A8A] rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(5, (day.totalSales / maxSales) * 100)}%` }}
                        >
                          <span className="text-white text-xs font-medium">{day.count}</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700 w-20 text-right">৳{day.totalSales?.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-8">No data available</p>
              )}
            </div>

            {/* Payment methods breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Payment Methods</h3>
              {report?.paymentBreakdown?.length ? (
                <div className="space-y-3">
                  {report.paymentBreakdown.map((p) => {
                    const pct = report.totalRevenue > 0 ? ((p.total / report.totalRevenue) * 100).toFixed(1) : 0;
                    return (
                      <div key={p._id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm capitalize font-medium text-gray-700">{p._id}</span>
                          <span className="text-sm font-bold text-gray-800">৳{p.total?.toFixed(0)} <span className="text-xs text-gray-400 font-normal">({pct}%)</span></span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${paymentColors[p._id] || "bg-gray-400"}`}
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-8">No data available</p>
              )}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Selling Products</h3>
            {topProducts.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">#</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Product</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Qty Sold</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topProducts.slice(0, 10).map((p, i) => (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-500">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800">{p.productName}</td>
                        <td className="px-4 py-2.5 text-right text-gray-700">{p.totalQuantity}</td>
                        <td className="px-4 py-2.5 text-right font-semibold text-[#1E3A8A]">৳{p.totalRevenue?.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-400 text-sm py-8">No product data</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 animate-pulse">
        <div className="bg-white rounded-xl border border-gray-200 p-4 h-16"></div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    }>
      <ReportsContent />
    </Suspense>
  );
}
