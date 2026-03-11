"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "cashier" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setSaving(true);
    try {
      await api.createAppUser(form);
      router.push("/dashboard/user-management/user-list");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New User</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 max-w-lg">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input name="name" required value={form.name} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input name="email" type="email" required value={form.email} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="user@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input name="password" type="password" required value={form.password} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Min. 6 characters" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {saving ? "Creating..." : "Create User"}
          </button>
          <button type="button" onClick={() => router.back()} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
