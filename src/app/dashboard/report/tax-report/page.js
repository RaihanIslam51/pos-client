"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line,
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

const TAX_RATE = 0.15;
const fmtK = (v) => v >= 1000 ? `৳${(v / 1000).toFixed(1)}k` : `৳${Math.round(v)}`;

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

export default function TaxReportPage() {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 640;
  const chartH = isMobile ? 200 : 260;
  const yAxisW = isMobile ? 52 : 64;

  useEffect(() => {
    Promise.all([api.getSales(), api.getPurchases()])
      .then(([sRes, pRes]) => { setSales(sRes.data || []); setPurchases(pRes.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const filterByYear = (arr) => arr.filter((r) => new Date(r.createdAt || r.purchaseDate).getFullYear() === Number(year));

  const filteredSales = filterByYear(sales).filter((s) => s.status !== "cancelled");
  const filteredPurchases = filterByYear(purchases);

  const totalSalesTax = filteredSales.reduce((sum, s) => sum + (s.taxAmount || s.totalAmount * TAX_RATE), 0);
  const totalPurchaseTax = filteredPurchases.reduce((sum, p) => sum + (p.taxAmount || (p.totalAmount || p.total || 0) * TAX_RATE), 0);
  const netTaxPayable = totalSalesTax - totalPurchaseTax;

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const byMonth = monthLabels.map((month, i) => {
    const mSales = filteredSales.filter((s) => new Date(s.createdAt).getMonth() === i);
    const mPurch = filteredPurchases.filter((p) => new Date(p.createdAt || p.purchaseDate).getMonth() === i);
    const salesTax = mSales.reduce((s, r) => s + (r.taxAmount || r.totalAmount * TAX_RATE), 0);
    const purchTax = mPurch.reduce((s, r) => s + (r.taxAmount || (r.totalAmount || r.total || 0) * TAX_RATE), 0);
    return { month, salesTax: +salesTax.toFixed(2), purchTax: +purchTax.toFixed(2), net: +(salesTax - purchTax).toFixed(2) };
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header + Year filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Tax Report</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Year:</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-gray-500">Output Tax (Sales)</p>
          <p className="text-xl font-bold text-blue-700">৳{totalSalesTax.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">Tax collected from customers</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <p className="text-xs text-gray-500">Input Tax (Purchases)</p>
          <p className="text-xl font-bold text-orange-600">৳{totalPurchaseTax.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">Tax paid to suppliers</p>
        </div>
        <div className={`rounded-xl p-4 border ${netTaxPayable >= 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
          <p className="text-xs text-gray-500">Net Tax Payable</p>
          <p className={`text-xl font-bold ${netTaxPayable >= 0 ? "text-red-600" : "text-green-700"}`}>৳{Math.abs(netTaxPayable).toFixed(2)}</p>
          <p className="text-xs text-gray-400 mt-1">{netTaxPayable >= 0 ? "payable to government" : "tax credit available"}</p>
        </div>
      </div>

      {/* Charts */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ChartCard title={`Output vs Input Tax — ${year}`}>
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={byMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: isMobile ? 9 : 11 }} interval={isMobile ? "preserveStartEnd" : 0} />
                <YAxis width={yAxisW} tickFormatter={fmtK} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`৳${v.toFixed(2)}`, ""]} />
                <Legend />
                <Bar dataKey="salesTax" name="Output Tax" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="purchTax" name="Input Tax" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title={`Net Tax Payable by Month — ${year}`}>
            <ResponsiveContainer width="100%" height={chartH}>
              <LineChart data={byMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: isMobile ? 9 : 11 }} interval={isMobile ? "preserveStartEnd" : 0} />
                <YAxis width={yAxisW} tickFormatter={fmtK} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`৳${v.toFixed(2)}`, "Net Tax"]} />
                <Line type="monotone" dataKey="net" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Monthly Table */}
      {loading ? (
        <div className="flex items-center justify-center h-24 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-sm">Monthly Tax Breakdown — {year}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left border-b">
                  <th className="px-4 py-3 font-semibold text-gray-600">Month</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Output Tax (৳)</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Input Tax (৳)</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Net Tax (৳)</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {byMonth.map((row) => (
                  <tr key={row.month} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.month} {year}</td>
                    <td className="px-4 py-3 text-blue-600">৳{row.salesTax.toFixed(2)}</td>
                    <td className="px-4 py-3 text-orange-600">৳{row.purchTax.toFixed(2)}</td>
                    <td className={`px-4 py-3 font-semibold ${row.net >= 0 ? "text-red-600" : "text-green-600"}`}>৳{Math.abs(row.net).toFixed(2)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {row.salesTax > 0 || row.purchTax > 0 ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.net >= 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                          {row.net >= 0 ? "Payable" : "Credit"}
                        </span>
                      ) : <span className="text-gray-400 text-xs">No activity</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
