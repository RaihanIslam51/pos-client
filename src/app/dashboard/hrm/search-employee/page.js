"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function SearchEmployeeContent() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try {
      const res = await api.getEmployees(`?search=${encodeURIComponent(query.trim())}`);
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Search Employee</h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, ID, phone, email, department or designation..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
          <button type="submit" disabled={loading}
            className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors">
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              <p className="text-3xl mb-2">🔍</p>
              No employees found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">{results.length} result{results.length !== 1 ? "s" : ""} for <span className="font-semibold text-gray-700">&ldquo;{query}&rdquo;</span></p>
                <Link href="/dashboard/hrm/add-employee" className="text-xs text-[#1E3A8A] font-semibold hover:underline">+ Add Employee</Link>
              </div>
              <div className="divide-y divide-gray-100">
                {results.map((emp) => (
                  <div key={emp._id} className="px-5 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{emp.name}</p>
                          <p className="text-xs text-gray-500">{emp.designation || "—"} {emp.department ? `· ${emp.department}` : ""}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-700">৳{(emp.salary || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-400">per month</p>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 ml-13 pl-13">
                      {emp.employeeId && <span className="text-xs text-gray-500">ID: <span className="text-gray-700 font-medium">{emp.employeeId}</span></span>}
                      {emp.phone && <span className="text-xs text-gray-500">📞 {emp.phone}</span>}
                      {emp.email && <span className="text-xs text-gray-500">✉ {emp.email}</span>}
                      {emp.joinDate && <span className="text-xs text-gray-500">Joined: {new Date(emp.joinDate).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!searched && (
        <div className="text-center py-12 text-gray-400 text-sm">
          <p className="text-4xl mb-3">🔎</p>
          <p>Enter a name, ID, phone, or department to search employees</p>
        </div>
      )}
    </div>
  );
}

export default function SearchEmployeePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <SearchEmployeeContent />
    </Suspense>
  );
}
