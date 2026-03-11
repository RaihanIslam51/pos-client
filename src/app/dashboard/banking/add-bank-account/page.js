"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function AddBankAccountContent() {
  const router = useRouter();
  const [form, setForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    branchName: "",
    balance: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bankName.trim()) return setError("Bank name is required");
    if (!form.accountName.trim()) return setError("Account name is required");
    if (!form.accountNumber.trim()) return setError("Account number is required");
    setLoading(true); setError("");
    try {
      await api.createBankAccount({ ...form, balance: Number(form.balance) || 0 });
      router.push("/dashboard/banking/list-bank-account");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Add Bank Account</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name <span className="text-red-500">*</span></label>
              <input name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. Dutch-Bangla Bank"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Name <span className="text-red-500">*</span></label>
              <input name="accountName" value={form.accountName} onChange={handleChange} placeholder="Account holder name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number <span className="text-red-500">*</span></label>
              <input name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Account number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
              <input name="branchName" value={form.branchName} onChange={handleChange} placeholder="Branch"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Opening Balance (৳)</label>
            <input name="balance" type="number" min="0" step="0.01" value={form.balance} onChange={handleChange} placeholder="0.00"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Optional notes..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#1E3A8A] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 transition-colors">
              {loading ? "Saving..." : "Add Bank Account"}
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

export default function AddBankAccountPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <AddBankAccountContent />
    </Suspense>
  );
}
