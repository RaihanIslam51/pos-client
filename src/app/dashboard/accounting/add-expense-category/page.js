"use client";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function AddExpenseCategoryContent() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Category name is required");
    setLoading(true); setError("");
    try {
      await api.createExpenseCategory(form);
      router.push("/dashboard/accounting/list-expense-category");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">Add Expense Category</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name <span className="text-red-500">*</span></label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Office Supplies"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Optional description..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#1E3A8A] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 transition-colors">
              {loading ? "Saving..." : "Add Category"}
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

export default function AddExpenseCategoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <AddExpenseCategoryContent />
    </Suspense>
  );
}
