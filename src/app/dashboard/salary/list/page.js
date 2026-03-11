"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function ListSalaryPage() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState("");

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (month) params.set("month", month);
      if (year) params.set("year", year);
      if (statusFilter) params.set("status", statusFilter);
      const q = params.toString() ? `?${params}` : "";
      const res = await api.getSalaries(q);
      setSalaries(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalaries(); }, [month, year, statusFilter]);

  const handleMarkPaid = async (id) => {
    try {
      await api.markSalaryPaid(id);
      fetchSalaries();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this salary record?")) return;
    try {
      await api.deleteSalary(id);
      fetchSalaries();
    } catch (err) {
      alert(err.message);
    }
  };

  const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Salary List</h1>
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Months</option>
            {months.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Employee</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Month/Year</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Basic (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Bonus (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Deductions (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Net (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : salaries.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No salary records found</td></tr>
            ) : salaries.map((s, i) => (
              <tr key={s._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{s.employee?.name || "—"}</td>
                <td className="px-4 py-3">{months[s.month]} {s.year}</td>
                <td className="px-4 py-3">৳{s.basicSalary?.toLocaleString()}</td>
                <td className="px-4 py-3 text-green-600">+৳{s.bonus?.toLocaleString()}</td>
                <td className="px-4 py-3 text-red-500">-৳{s.deductions?.toLocaleString()}</td>
                <td className="px-4 py-3 font-semibold">৳{s.netSalary?.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  {s.status === "pending" && (
                    <button onClick={() => handleMarkPaid(s._id)} className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                      Mark Paid
                    </button>
                  )}
                  <button onClick={() => handleDelete(s._id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
