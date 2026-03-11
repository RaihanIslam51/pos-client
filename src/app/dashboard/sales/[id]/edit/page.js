"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function SaleEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ status: "", paidAmount: "", notes: "" });

  useEffect(() => {
    api.getSale(id)
      .then((r) => {
        const s = r.data;
        setSale(s);
        setForm({ status: s.status, paidAmount: String(s.paidAmount), notes: s.notes || "" });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await api.updateSale(id, {
        status: form.status,
        paidAmount: parseFloat(form.paidAmount) || 0,
        notes: form.notes,
      });
      router.push("/dashboard/sales/list");
    } catch (err) {
      setError(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-[#1E3A8A]" />
    </div>
  );
  if (!sale) return (
    <div className="text-center py-20 text-gray-400">Sale not found</div>
  );

  const newDue = Math.max(0, sale.totalAmount - (parseFloat(form.paidAmount) || 0));

  return (
    <div className="max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-[#1E3A8A]">Edit Sale</h1>
          <p className="text-sm text-gray-500 font-mono">{sale.invoiceNumber}</p>
        </div>
        <Link href={`/dashboard/sales/${id}`}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1E3A8A] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Invoice
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {/* Summary banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 text-sm">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total</p>
            <p className="font-bold text-[#1E3A8A]">৳{sale.totalAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Paid</p>
            <p className="font-bold text-green-600">৳{sale.paidAmount.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Due</p>
            <p className="font-bold text-red-500">৳{sale.dueAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] bg-white">
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="hold">Hold</option>
            <option value="instalment">Instalment</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Paid Amount */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Paid Amount</label>
          <input type="number" min="0" step="0.01" value={form.paidAmount}
            onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
          <p className="text-xs text-gray-500 mt-1">
            After update — Due: <span className={`font-medium ${newDue > 0 ? "text-red-500" : "text-green-600"}`}>৳{newDue.toFixed(2)}</span>
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3} placeholder="Add a note..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] resize-none" />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
            {saving ? "Saving..." : "Update Sale"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
