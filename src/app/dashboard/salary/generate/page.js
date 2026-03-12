"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function SalaryGeneratePage() {
  const [employees, setEmployees] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [bonusMap, setBonusMap] = useState({});
  const [deductionMap, setDeductionMap] = useState({});
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEmployees("?isActive=true").then((res) => setEmployees(res.data || [])).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    setMessage(null);
    try {
      const res = await api.generateSalary({ month: Number(month), year: Number(year), bonusMap, deductionMap });
      setMessage({ type: "success", text: `${res.message || "Salary generated"} (${res.count || 0} records)` });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setGenerating(false);
    }
  };

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5">Generate Salary</h1>
      <form onSubmit={handleGenerate} className="bg-white rounded-xl shadow p-4 sm:p-6 max-w-3xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 text-sm mb-4">Loading employees...</p>
        ) : (
          <>
          {/* Mobile card view for employees */}
          <div className="md:hidden space-y-3 mb-6">
            {employees.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">No active employees found</p>
            ) : employees.map((emp) => {
              const basic = emp.basicSalary || 0;
              const bonus = Number(bonusMap[emp._id] || 0);
              const ded = Number(deductionMap[emp._id] || 0);
              return (
                <div key={emp._id} className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800 text-sm">{emp.name}</p>
                    <p className="text-sm font-bold text-green-700">৳{(basic + bonus - ded).toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-gray-500">Basic: ৳{basic.toLocaleString()}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">Bonus (৳)</label>
                      <input type="number" min="0" value={bonusMap[emp._id] || ""} onChange={(e) => setBonusMap((prev) => ({ ...prev, [emp._id]: e.target.value }))} placeholder="0" className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Deductions (৳)</label>
                      <input type="number" min="0" value={deductionMap[emp._id] || ""} onChange={(e) => setDeductionMap((prev) => ({ ...prev, [emp._id]: e.target.value }))} placeholder="0" className="w-full border rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto mb-6">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-4 py-2 font-semibold text-gray-600">Employee</th>
                  <th className="px-4 py-2 font-semibold text-gray-600">Basic Salary (৳)</th>
                  <th className="px-4 py-2 font-semibold text-gray-600">Bonus (৳)</th>
                  <th className="px-4 py-2 font-semibold text-gray-600">Deductions (৳)</th>
                  <th className="px-4 py-2 font-semibold text-gray-600">Net (৳)</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const basic = emp.basicSalary || 0;
                  const bonus = Number(bonusMap[emp._id] || 0);
                  const ded = Number(deductionMap[emp._id] || 0);
                  return (
                    <tr key={emp._id} className="border-t">
                      <td className="px-4 py-2">{emp.name}</td>
                      <td className="px-4 py-2">৳{basic.toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <input type="number" min="0" value={bonusMap[emp._id] || ""} onChange={(e) => setBonusMap((prev) => ({ ...prev, [emp._id]: e.target.value }))} placeholder="0" className="w-24 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </td>
                      <td className="px-4 py-2">
                        <input type="number" min="0" value={deductionMap[emp._id] || ""} onChange={(e) => setDeductionMap((prev) => ({ ...prev, [emp._id]: e.target.value }))} placeholder="0" className="w-24 border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </td>
                      <td className="px-4 py-2 font-semibold text-green-700">৳{(basic + bonus - ded).toLocaleString()}</td>
                    </tr>
                  );
                })}
                {employees.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-400">No active employees found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          </>
        )}

        <button type="submit" disabled={generating || employees.length === 0} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
          {generating ? "Generating..." : "Generate Salary"}
        </button>
      </form>
    </div>
  );
}
