"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function AddExpenseContent() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
    reference: "",
    note: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getExpenseCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return setError("Enter a valid amount");
    setLoading(true); setError("");
    try {
      await api.createExpense({ ...form, amount: Number(form.amount) });
      router.push("/dashboard/accounting/list-expense");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Add Expense</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Expense title"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]">
                <option value="">— Select Category —</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]">
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="mobile_banking">Mobile Banking</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
            <input name="reference" value={form.reference} onChange={handleChange} placeholder="Reference no."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <textarea name="note" value={form.note} onChange={handleChange} rows={3} placeholder="Additional notes..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#1E3A8A] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 transition-colors">
              {loading ? "Saving..." : "Add Expense"}
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

export default function AddExpensePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <AddExpenseContent />
    </Suspense>
  );
}
