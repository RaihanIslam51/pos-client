"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function DepositWithdrawContent() {
  const router = useRouter();
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({
    bankAccount: "",
    type: "deposit",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    reference: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getBankAccounts().then((res) => setAccounts(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const selectedAccount = accounts.find((a) => a._id === form.bankAccount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bankAccount) return setError("Please select a bank account");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return setError("Enter a valid amount");
    if (form.type === "withdraw" && selectedAccount && Number(form.amount) > selectedAccount.balance) {
      return setError(`Insufficient balance. Available: ৳${selectedAccount.balance.toFixed(2)}`);
    }
    setLoading(true); setError("");
    try {
      await api.createBankTransaction({ ...form, amount: Number(form.amount) });
      router.push("/dashboard/banking/transaction");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Deposit / Withdraw</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {/* Type toggle */}
        <div className="flex gap-2 mb-5">
          {["deposit", "withdraw"].map((t) => (
            <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, type: t }))}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors ${form.type === t ? (t === "deposit" ? "bg-green-600 text-white" : "bg-red-500 text-white") : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {t === "deposit" ? "↑ Deposit" : "↓ Withdraw"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account <span className="text-red-500">*</span></label>
            <select name="bankAccount" value={form.bankAccount} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]">
              <option value="">— Select Account —</option>
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>{a.bankName} — {a.accountName} (৳{(a.balance || 0).toFixed(2)})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳) <span className="text-red-500">*</span></label>
              <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleChange} placeholder="0.00"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input name="reference" value={form.reference} onChange={handleChange} placeholder="Reference no."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea name="note" value={form.note} onChange={handleChange} rows={3} placeholder="Optional notes..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className={`flex-1 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 transition-colors ${form.type === "deposit" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
              {loading ? "Processing..." : form.type === "deposit" ? "Confirm Deposit" : "Confirm Withdraw"}
            </button>
            <button type="button" onClick={() => router.back()}
              className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DepositWithdrawPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <DepositWithdrawContent />
    </Suspense>
  );
}
