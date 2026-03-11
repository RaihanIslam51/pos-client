"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function BankingTransactionContent() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAccount, setFilterAccount] = useState("");
  const [filterType, setFilterType] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterAccount) params.set("bankAccount", filterAccount);
      if (filterType) params.set("type", filterType);
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await api.getBankTransactions(query);
      setTransactions(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [filterAccount, filterType]);

  useEffect(() => {
    api.getBankAccounts().then((res) => setAccounts(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction? The balance will be reversed.")) return;
    setDeletingId(id);
    try {
      await api.deleteBankTransaction(id);
      fetchTransactions();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const totalDeposit = transactions.filter((t) => t.type === "deposit").reduce((s, t) => s + t.amount, 0);
  const totalWithdraw = transactions.filter((t) => t.type === "withdraw").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]">
            <option value="">All Accounts</option>
            {accounts.map((a) => <option key={a._id} value={a._id}>{a.bankName} — {a.accountName}</option>)}
          </select>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]">
            <option value="">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
          </select>
        </div>
        <Link href="/dashboard/banking/deposit-withdraw"
          className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Transaction
        </Link>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-100 rounded-xl px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-green-700">Total Deposit</span>
            <span className="text-base font-bold text-green-700">৳{totalDeposit.toFixed(2)}</span>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-red-700">Total Withdraw</span>
            <span className="text-base font-bold text-red-700">৳{totalWithdraw.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Bank Account</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Amount</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Reference</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm"><p className="text-3xl mb-2">💳</p>No transactions found</td></tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${tx.type === "deposit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {tx.type === "deposit" ? "↑ Deposit" : "↓ Withdraw"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {tx.bankAccount ? `${tx.bankAccount.bankName} — ${tx.bankAccount.accountName}` : "—"}
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold ${tx.type === "deposit" ? "text-green-600" : "text-red-600"}`}>
                      {tx.type === "deposit" ? "+" : "-"}৳{tx.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{tx.reference || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(tx._id)} disabled={deletingId === tx._id}
                        className="text-red-500 hover:underline text-xs font-medium">
                        {deletingId === tx._id ? "..." : "Delete"}
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

export default function BankingTransactionPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <BankingTransactionContent />
    </Suspense>
  );
}
