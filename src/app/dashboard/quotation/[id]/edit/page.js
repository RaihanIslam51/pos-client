"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function QuotationEditPage() {
  const { id } = useParams();
  const router = useRouter();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ status: "", validUntil: "", notes: "" });

  useEffect(() => {
    api.getQuotation(id)
      .then((r) => {
        const q = r.data;
        setQuotation(q);
        setForm({
          status: q.status,
          validUntil: q.validUntil ? q.validUntil.slice(0, 10) : "",
          notes: q.notes || "",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      await api.updateQuotation(id, {
        status: form.status,
        validUntil: form.validUntil || null,
        notes: form.notes,
      });
      router.push("/dashboard/quotation/list");
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
  if (!quotation) return (
    <div className="text-center py-20 text-gray-400">Quotation not found</div>
  );

  return (
    <div className="max-w-lg mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-[#1E3A8A]">Edit Quotation</h1>
          <p className="text-sm text-gray-500 font-mono">{quotation.quotationNumber}</p>
        </div>
        <Link href={`/dashboard/quotation/${id}`}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1E3A8A] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          View Quotation
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
      )}

      {/* Summary banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-5 text-sm">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Customer</p>
            <p className="font-bold text-[#1E3A8A] truncate">{quotation.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Items</p>
            <p className="font-bold text-gray-700">{quotation.items?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Total</p>
            <p className="font-bold text-[#1E3A8A]">৳{quotation.totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">

        {/* Status */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] bg-white">
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="converted">Converted</option>
          </select>
        </div>

        {/* Valid Until */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valid Until</label>
          <input type="date" value={form.validUntil}
            onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]" />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
          <textarea rows={3} value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional notes..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] resize-none" />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 bg-[#1E3A8A] hover:bg-blue-900 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
