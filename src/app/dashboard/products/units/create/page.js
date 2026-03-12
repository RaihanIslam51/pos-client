"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const PRESETS = [
  { name: "Pieces", shortName: "pcs" },
  { name: "Kilogram", shortName: "kg" },
  { name: "Gram", shortName: "gram" },
  { name: "Litre", shortName: "ltr" },
  { name: "Millilitre", shortName: "ml" },
  { name: "Box", shortName: "box" },
  { name: "Pack", shortName: "pack" },
  { name: "Dozen", shortName: "doz" },
  { name: "Meter", shortName: "mtr" },
  { name: "Strip", shortName: "strip" },
  { name: "Bottle", shortName: "btl" },
  { name: "Tablet", shortName: "tab" },
];

export default function CreateUnitPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", shortName: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handlePreset = (preset) => {
    setForm({ name: preset.name, shortName: preset.shortName });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.createUnit(form);
      router.push("/dashboard/products/units/list");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/products/units/list" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">Create Unit</h2>
          <p className="text-sm text-gray-400">Add a measurement unit for products</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Quick Presets */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-600 mb-3">Quick Presets</h3>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.shortName}
                type="button"
                onClick={() => handlePreset(p)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  form.name === p.name
                    ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[#1E3A8A] hover:text-[#1E3A8A]"
                }`}
              >
                {p.name} <span className="opacity-60">({p.shortName})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Unit Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Kilogram, Pieces, Box"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Short Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.shortName}
                onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                placeholder="e.g. kg, pcs, box"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
              <p className="mt-1 text-xs text-gray-400">This will appear next to quantities in the system</p>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/dashboard/products/units/list"
                className="flex-1 text-center border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-[#1E3A8A] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {saving ? "Creating..." : "Create Unit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
