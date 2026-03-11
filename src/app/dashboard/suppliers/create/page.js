"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CreateSupplierPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "",
    state: "", gstin: "", dueAmount: "0", isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.createSupplier({ ...form, dueAmount: parseFloat(form.dueAmount) || 0 });
      router.push("/dashboard/suppliers/list");
    } catch (err) {
      setError(err.message || "Failed to create supplier");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-[#1E3A8A] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/dashboard/suppliers/list" className="hover:text-[#1E3A8A] transition-colors">Supplier</Link>
        <span>/</span>
        <span className="text-[#1E3A8A] font-semibold">Supplier Add</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

        {/* Card header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-[#1E3A8A]">Supplier Information</h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Supplier Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Supplier Name<span className="text-red-500">*</span> :
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Supplier Name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* Initial Due */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Initial Due<span className="text-red-500">*</span> :
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.dueAmount}
                  onChange={(e) => setForm({ ...form, dueAmount: e.target.value })}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address :</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Address :</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Address"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  State<span className="text-red-500">*</span> :
                </label>
                <input
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="State"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">GSTIN :</label>
                <input
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  placeholder="GSTIN"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Mobile number<span className="text-red-500">*</span> :
                </label>
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Mobile number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status :</label>
                <select
                  value={form.isActive ? "active" : "inactive"}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Link
                href="/dashboard/suppliers/list"
                className="px-6 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-8 bg-[#1E3A8A] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
