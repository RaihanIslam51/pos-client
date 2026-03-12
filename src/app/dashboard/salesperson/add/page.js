"use client";
import { showError, showSuccess, showWarning } from "@/lib/swal";
import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

function AddSalesPersonContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", commissionRate: 0, notes: "" });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createSalesPerson(form);
      router.push("/dashboard/salesperson/list");
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-lg w-full">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Sales Person Details</h3>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Full Name <span className="text-red-500">*</span></label>
          <input required type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
            placeholder="Sales person full name"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Phone</label>
          <input type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)}
            placeholder="01XXXXXXXXX"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Email</label>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
            placeholder="salesperson@email.com"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Address</label>
          <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)}
            placeholder="Sales person address"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Commission Rate (%)</label>
          <input type="number" min="0" max="100" step="0.1" value={form.commissionRate}
            onChange={(e) => set("commissionRate", parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
          <p className="text-xs text-gray-400 mt-1">Percentage of each sale credited as commission</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Notes</label>
          <textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)}
            placeholder="Any additional notes..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none" />
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3">
        <button type="submit" disabled={loading}
          className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60 w-full sm:w-auto">
          {loading ? "Saving..." : "Add Sales Person"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors w-full sm:w-auto">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function AddSalesPersonPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <AddSalesPersonContent />
    </Suspense>
  );
}
