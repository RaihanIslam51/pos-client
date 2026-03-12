"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend, AreaChart, Area,
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

const PIE_COLORS = ["#EF4444", "#F59E0B", "#8B5CF6", "#1E3A8A", "#10B981", "#06B6D4", "#F97316"];
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

export default function ExpenseOverviewPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [catFilter, setCatFilter] = useState("");
  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 640;
  const chartH = isMobile ? 200 : 260;
  const yAxisW = isMobile ? 48 : 60;

  useEffect(() => {
    Promise.all([api.getExpenses(), api.getExpenseCategories()])
      .then(([eRes, cRes]) => { setExpenses(eRes.data || []); setCategories(cRes.data || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const monthNames = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const filtered = expenses.filter((e) => {
    const d = new Date(e.date || e.createdAt);
    if (month && d.getMonth() + 1 !== Number(month)) return false;
    if (year && d.getFullYear() !== Number(year)) return false;
    if (catFilter && e.category?._id !== catFilter && e.category !== catFilter) return false;
    return true;
  });

  const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);

  const byCategory = categories.map((cat) => ({
    ...cat,
    amount: filtered.filter((e) => e.category?._id === cat._id || e.category === cat._id).reduce((s, e) => s + (e.amount || 0), 0),
  })).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);

  // Monthly expense trend
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyTrend = monthLabels.map((m, i) => {
    const amt = expenses
      .filter((e) => new Date(e.date || e.createdAt).getFullYear() === Number(year) && new Date(e.date || e.createdAt).getMonth() === i)
      .reduce((s, e) => s + (e.amount || 0), 0);
    return { month: m, amount: amt };
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Expense Overview</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Months</option>
            {monthNames.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
          <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-xs text-gray-500">Total Expenses</p>
          <p className="text-xl font-bold text-red-600">৳{total.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-gray-500">Transactions</p>
          <p className="text-xl font-bold text-blue-700">{filtered.length}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-xs text-gray-500">Categories Used</p>
          <p className="text-xl font-bold text-purple-700">{byCategory.length}</p>
        </div>
      </div>

      {/* Charts */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ChartCard title={`Monthly Expense Trend — ${year}`}>
            <ResponsiveContainer width="100%" height={chartH}>
              <AreaChart data={monthlyTrend} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: isMobile ? 9 : 11 }} interval={isMobile ? "preserveStartEnd" : 0} />
                <YAxis width={yAxisW} tickFormatter={fmtK} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, "Expense"]} />
                <Area type="monotone" dataKey="amount" stroke="#EF4444" fill="url(#expGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Expense by Category">
            <ResponsiveContainer width="100%" height={chartH}>
              <PieChart>
                <Pie
                  data={byCategory}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 70 : 90}
                  dataKey="amount"
                  nameKey="name"
                  label={({ name, percent }) => isMobile ? "" : `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, "Amount"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Category Breakdown + Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-sm">By Category</h3>
          </div>
          {byCategory.length === 0 ? (
            <p className="px-4 py-6 text-gray-400 text-sm text-center">No data</p>
          ) : byCategory.map((cat) => (
            <div key={cat._id} className="flex justify-between items-center px-4 py-3 border-b last:border-0 hover:bg-gray-50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium truncate">{cat.name}</span>
              </div>
              <div className="text-right shrink-0 ml-2">
                <span className="font-semibold text-red-600">৳{cat.amount.toLocaleString()}</span>
                <span className="text-xs text-gray-400 ml-1">({total > 0 ? ((cat.amount / total) * 100).toFixed(1) : 0}%)</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-700 text-sm">Recent Expenses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left border-b">
                  <th className="px-4 py-2 font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-2 font-semibold text-gray-600">Title</th>
                  <th className="px-4 py-2 font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                  <th className="px-4 py-2 font-semibold text-gray-600">Amount (৳)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
                ) : filtered.slice(0, 10).map((e) => (
                  <tr key={e._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{new Date(e.date || e.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 font-medium truncate max-w-[120px]">{e.title || e.description}</td>
                    <td className="px-4 py-2 text-gray-500 hidden sm:table-cell">{e.category?.name || "—"}</td>
                    <td className="px-4 py-2 font-semibold text-red-600">৳{e.amount?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
