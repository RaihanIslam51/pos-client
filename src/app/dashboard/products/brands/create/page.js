"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function CreateBrandPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.createBrand(form);
      router.push("/dashboard/products/brands/list");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/products/brands/list" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Create Brand</h2>
          <p className="text-sm text-gray-400">Add a new product brand</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Samsung, Apple, Unilever"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Optional brand description"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/dashboard/products/brands/list"
              className="flex-1 text-center border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#1E3A8A] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
            >
              {saving ? "Creating..." : "Create Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
