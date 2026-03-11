"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function SalarySheetPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchSheet = async () => {
    setLoading(true);
    try {
      const params = `?month=${month}&year=${year}`;
      const res = await api.getSalarySheet(params);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSheet(); }, [month, year]);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const shortMonths = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const salaries = data?.data || [];
  const summary = data?.summary || {};

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Salary Sheet</h1>

      <div className="bg-white rounded-xl shadow p-4 mb-4 flex gap-4 items-end flex-wrap">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={fetchSheet} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Refresh</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Employees", value: summary.count || 0, color: "blue" },
          { label: "Total Basic (৳)", value: `৳${(summary.totalBasic || 0).toLocaleString()}`, color: "purple" },
          { label: "Total Net (৳)", value: `৳${(summary.totalNet || 0).toLocaleString()}`, color: "green" },
          { label: "Paid", value: summary.paidCount || 0, color: "emerald" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-${stat.color}-50 rounded-xl p-4 border border-${stat.color}-100`}>
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold text-${stat.color}-700`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Sheet Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50 font-semibold text-gray-700">
          Salary Sheet — {months[month - 1]} {year}
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left border-b">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Employee</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Department</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Basic (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Bonus (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Deductions (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Net (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Paid At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : salaries.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No records for this period</td></tr>
            ) : salaries.map((s, i) => (
              <tr key={s._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{s.employee?.name || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{s.employee?.department || "—"}</td>
                <td className="px-4 py-3">৳{s.basicSalary?.toLocaleString()}</td>
                <td className="px-4 py-3 text-green-600">+৳{s.bonus?.toLocaleString()}</td>
                <td className="px-4 py-3 text-red-500">-৳{s.deductions?.toLocaleString()}</td>
                <td className="px-4 py-3 font-bold text-blue-700">৳{s.netSalary?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {s.paidAt ? new Date(s.paidAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
          {salaries.length > 0 && (
            <tfoot>
              <tr className="bg-gray-100 font-semibold border-t-2">
                <td colSpan={3} className="px-4 py-3 text-gray-700">Total</td>
                <td className="px-4 py-3">৳{(summary.totalBasic || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-green-600">+৳{(summary.totalBonus || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-red-500">-৳{(summary.totalDeductions || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-blue-700">৳{(summary.totalNet || 0).toLocaleString()}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
