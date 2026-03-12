"use client";
import { showError, showSuccess, showWarning, showConfirm } from "@/lib/swal";
import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function ListExpenseContent() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.getExpenses(params);
      setExpenses(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchExpenses, 300);
    return () => clearTimeout(t);
  }, [fetchExpenses]);

  const handleDelete = async (id) => {
    const result = await showConfirm("Delete this expense?");
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      await api.deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const totalAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search expenses..."
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        <Link href="/dashboard/accounting/add-expense"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Expense
        </Link>
      </div>

      {!loading && expenses.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-red-700">Total Expense</span>
          <span className="text-lg font-bold text-red-700">৳{totalAmount.toFixed(2)}</span>
        </div>
      )}

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></div>
        ) : expenses.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm"><p className="text-3xl mb-2">&#x1F4B8;</p>No expenses found</div>
        ) : expenses.map((exp, idx) => (
          <div key={exp._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{exp.title}</p>
                <p className="text-xs text-gray-500">{exp.category?.name || "—"}</p>
              </div>
              <p className="text-base font-bold text-red-600">৳{(exp.amount || 0).toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded-full font-medium ${exp.paymentMethod === "cash" ? "bg-green-100 text-green-700" : exp.paymentMethod === "bank" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                {exp.paymentMethod === "mobile_banking" ? "Mobile" : exp.paymentMethod}
              </span>
              <span className="text-gray-400">{new Date(exp.date).toLocaleDateString()}</span>
            </div>
            <button onClick={() => handleDelete(exp._id)} disabled={deletingId === exp._id}
              className="w-full text-red-500 text-xs font-medium py-1.5 border border-red-200 rounded-lg hover:bg-red-50">
              {deletingId === exp._id ? "Deleting..." : "Delete"}
            </button>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Category</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Payment</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm"><p className="text-3xl mb-2">💸</p>No expenses found</td></tr>
              ) : (
                expenses.map((exp, idx) => (
                  <tr key={exp._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{exp.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{exp.category?.name || "—"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600">৳{(exp.amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${exp.paymentMethod === "cash" ? "bg-green-100 text-green-700" : exp.paymentMethod === "bank" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {exp.paymentMethod === "mobile_banking" ? "Mobile" : exp.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(exp.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(exp._id)} disabled={deletingId === exp._id}
                        className="text-red-500 hover:underline text-xs font-medium">
                        {deletingId === exp._id ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ListExpensePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <ListExpenseContent />
    </Suspense>
  );
}
