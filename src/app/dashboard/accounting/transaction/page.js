"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function TransactionContent() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [expRes, depRes] = await Promise.all([api.getExpenses(), api.getDeposits()]);
        const expenses = expRes.data.map((e) => ({ ...e, transType: "expense" }));
        const deposits = depRes.data.map((d) => ({ ...d, transType: "deposit" }));
        const merged = [...expenses, ...deposits].sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(merged);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalExpense = transactions.filter((t) => t.transType === "expense").reduce((s, t) => s + (t.amount || 0), 0);
  const totalDeposit = transactions.filter((t) => t.transType === "deposit").reduce((s, t) => s + (t.amount || 0), 0);
  const balance = totalDeposit - totalExpense;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Transaction Ledger</h2>
        <div className="flex gap-2">
          <Link href="/dashboard/accounting/add-expense"
            className="bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors">+ Expense</Link>
          <Link href="/dashboard/accounting/add-deposit"
            className="bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors">+ Deposit</Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-4">
          <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-1">Total Deposit</p>
          <p className="text-2xl font-bold text-green-700">৳{totalDeposit.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-4">
          <p className="text-xs text-red-600 font-medium uppercase tracking-wide mb-1">Total Expense</p>
          <p className="text-2xl font-bold text-red-700">৳{totalExpense.toFixed(2)}</p>
        </div>
        <div className={`border rounded-xl px-5 py-4 ${balance >= 0 ? "bg-blue-50 border-blue-100" : "bg-orange-50 border-orange-100"}`}>
          <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${balance >= 0 ? "text-blue-600" : "text-orange-600"}`}>Balance</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? "text-blue-700" : "text-orange-700"}`}>
            {balance < 0 ? "-" : ""}৳{Math.abs(balance).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Title</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Payment</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm"><p className="text-3xl mb-2">📊</p>No transactions found</td></tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr key={tx._id + tx.transType} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${tx.transType === "deposit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {tx.transType === "deposit" ? "↑ Deposit" : "↓ Expense"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{tx.title}</td>
                    <td className={`px-4 py-3 text-sm font-semibold ${tx.transType === "deposit" ? "text-green-600" : "text-red-600"}`}>
                      {tx.transType === "deposit" ? "+" : "-"}৳{(tx.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${tx.paymentMethod === "cash" ? "bg-green-100 text-green-700" : tx.paymentMethod === "bank" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                        {tx.paymentMethod === "mobile_banking" ? "Mobile" : tx.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{tx.reference || "—"}</td>
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

export default function AccountingTransactionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <TransactionContent />
    </Suspense>
  );
}
