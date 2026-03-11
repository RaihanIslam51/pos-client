"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AddLoanPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    borrowerName: "",
    borrowerType: "other",
    phone: "",
    amount: "",
    interestRate: "",
    startDate: "",
    dueDate: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.createLoan(form);
      router.push("/dashboard/loan/list-loan");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Loan</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 max-w-2xl">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Borrower Name *</label>
            <input name="borrowerName" required value={form.borrowerName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Borrower Type</label>
            <select name="borrowerType" value={form.borrowerType} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="employee">Employee</option>
              <option value="customer">Customer</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="01XXXXXXXXX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (৳) *</label>
            <input name="amount" type="number" min="1" required value={form.amount} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
            <input name="interestRate" type="number" min="0" step="0.1" value={form.interestRate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input name="startDate" type="date" value={form.startDate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea name="notes" rows={3} value={form.notes} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Additional notes..." />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {saving ? "Saving..." : "Add Loan"}
          </button>
          <button type="button" onClick={() => router.back()} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
