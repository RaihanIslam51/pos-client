"use client";
import { showError, showSuccess, showWarning, showConfirm } from "@/lib/swal";
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
      showError(err.message);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("Delete this salary record?");
    if (!result.isConfirmed) return;
    try {
      await api.deleteSalary(id);
      fetchSalaries();
    } catch (err) {
      showError(err.message);
    }
  };

  const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5">Salary List</h1>
      <div className="bg-white rounded-xl shadow p-3 sm:p-4 mb-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
        <div className="flex gap-2 flex-wrap">
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
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">Loading...</div>
        ) : salaries.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">No salary records found</div>
        ) : salaries.map((s, i) => (
          <div key={s._id} className="bg-white rounded-xl shadow p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{s.employee?.name || "—"}</p>
                <p className="text-xs text-gray-500">{months[s.month]} {s.year}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{s.status}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-xs border-t border-gray-100 pt-2">
              <div><p className="text-gray-400">Basic</p><p className="font-semibold text-gray-700">৳{s.basicSalary?.toLocaleString()}</p></div>
              <div><p className="text-gray-400">Bonus</p><p className="font-semibold text-green-600">+৳{s.bonus?.toLocaleString()}</p></div>
              <div><p className="text-gray-400">Deduct</p><p className="font-semibold text-red-500">-৳{s.deductions?.toLocaleString()}</p></div>
              <div><p className="text-gray-400">Net</p><p className="font-bold text-blue-700">৳{s.netSalary?.toLocaleString()}</p></div>
            </div>
            <div className="flex gap-2 pt-1">
              {s.status === "pending" && (
                <button onClick={() => handleMarkPaid(s._id)} className="flex-1 text-green-600 text-xs font-medium py-1.5 border border-green-200 rounded-lg hover:bg-green-50">Mark Paid</button>
              )}
              <button onClick={() => handleDelete(s._id)} className="flex-1 text-red-500 text-xs font-medium py-1.5 border border-red-200 rounded-lg hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
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
    </div>
  );
}
