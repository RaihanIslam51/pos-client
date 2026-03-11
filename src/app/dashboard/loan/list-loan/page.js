"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function ListLoanPage() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter) params.set("status", statusFilter);
      const q = params.toString() ? `?${params}` : "";
      const res = await api.getLoans(q);
      setLoans(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLoans(); }, [statusFilter]);

  const handleSearch = (e) => { e.preventDefault(); fetchLoans(); };

  const handleDelete = async (id) => {
    if (!confirm("Delete this loan?")) return;
    try {
      await api.deleteLoan(id);
      fetchLoans();
    } catch (err) {
      alert(err.message);
    }
  };

  const statusColor = {
    active: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700",
    overdue: "bg-red-100 text-red-700",
  };

  const totalAmount = loans.reduce((s, l) => s + (l.amount || 0), 0);
  const totalPaid = loans.reduce((s, l) => s + (l.paidAmount || 0), 0);
  const totalDue = totalAmount - totalPaid;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Loan Management</h1>
        <Link href="/dashboard/loan/add-loan" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium">
          + Add Loan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">Total Lent</p>
          <p className="text-2xl font-bold text-blue-700">৳{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-gray-500 mb-1">Total Recovered</p>
          <p className="text-2xl font-bold text-green-700">৳{totalPaid.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-xs text-gray-500 mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-red-600">৳{totalDue.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search borrower..." className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">Search</button>
        </form>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Borrower</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Type</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Phone</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Amount (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Paid (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Due (৳)</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Due Date</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : loans.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-8 text-center text-gray-400">No loans found</td></tr>
            ) : loans.map((loan, i) => (
              <tr key={loan._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3 font-medium">{loan.borrowerName}</td>
                <td className="px-4 py-3 capitalize">{loan.borrowerType}</td>
                <td className="px-4 py-3 text-gray-500">{loan.phone || "—"}</td>
                <td className="px-4 py-3 font-semibold">৳{loan.amount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-green-600">৳{(loan.paidAmount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-red-600">৳{((loan.amount || 0) - (loan.paidAmount || 0)).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[loan.status] || "bg-gray-100 text-gray-700"}`}>
                    {loan.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(loan._id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
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
