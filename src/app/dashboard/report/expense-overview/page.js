"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function ExpenseOverviewPage() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [catFilter, setCatFilter] = useState("");

  useEffect(() => {
    Promise.all([api.getExpenses(), api.getExpenseCategories()])
      .then(([eRes, cRes]) => { setExpenses(eRes.data || []); setCategories(cRes.data || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const months = ["","January","February","March","April","May","June","July","August","September","October","November","December"];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const filtered = expenses.filter((e) => {
    const d = new Date(e.date || e.createdAt);
    if (month && d.getMonth() + 1 !== Number(month)) return false;
    if (year && d.getFullYear() !== Number(year)) return false;
    if (catFilter && e.category?._id !== catFilter && e.category !== catFilter) return false;
    return true;
  });

  const total = filtered.reduce((s, e) => s + (e.amount || 0), 0);
  const byCategory = categories.map((cat) => {
    const amount = filtered.filter((e) => e.category?._id === cat._id || e.category === cat._id).reduce((s, e) => s + (e.amount || 0), 0);
    return { ...cat, amount };
  }).filter((c) => c.amount > 0).sort((a, b) => b.amount - a.amount);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Expense Overview</h1>
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Months</option>
            {months.slice(1).map((m, i) => <option key={m} value={i+1}>{m}</option>)}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 rounded-xl p-4 border border-red-100"><p className="text-xs text-gray-500">Total Expenses</p><p className="text-2xl font-bold text-red-600">৳{total.toLocaleString()}</p></div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100"><p className="text-xs text-gray-500">No. of Transactions</p><p className="text-2xl font-bold text-blue-700">{filtered.length}</p></div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100"><p className="text-xs text-gray-500">Categories Used</p><p className="text-2xl font-bold text-purple-700">{byCategory.length}</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 font-semibold text-gray-700 text-sm">By Category</div>
          {byCategory.length === 0 ? (
            <p className="px-4 py-6 text-gray-400 text-sm text-center">No data</p>
          ) : byCategory.map((cat) => (
            <div key={cat._id} className="flex justify-between items-center px-4 py-3 border-b last:border-0 hover:bg-gray-50">
              <span className="text-sm font-medium">{cat.name}</span>
              <div className="text-right">
                <span className="font-semibold text-red-600">৳{cat.amount.toLocaleString()}</span>
                <span className="text-xs text-gray-400 ml-2">({total > 0 ? ((cat.amount / total) * 100).toFixed(1) : 0}%)</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 font-semibold text-gray-700 text-sm">Recent Expenses</div>
          <table className="min-w-full text-sm">
            <thead><tr className="bg-gray-50 text-left border-b">
              <th className="px-4 py-2 font-semibold text-gray-600">Date</th>
              <th className="px-4 py-2 font-semibold text-gray-600">Title</th>
              <th className="px-4 py-2 font-semibold text-gray-600">Category</th>
              <th className="px-4 py-2 font-semibold text-gray-600">Amount (৳)</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.slice(0, 10).map((e) => (
                <tr key={e._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{new Date(e.date || e.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2 font-medium">{e.title || e.description}</td>
                  <td className="px-4 py-2 text-gray-500">{e.category?.name || "—"}</td>
                  <td className="px-4 py-2 font-semibold text-red-600">৳{e.amount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
