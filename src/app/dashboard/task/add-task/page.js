"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function AddTaskPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium",
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
      await api.createTask(form);
      router.push("/dashboard/task/list-task");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add Task</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 max-w-2xl">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
            <input name="title" required value={form.title} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter task title" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe the task..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
            <input name="assignedTo" value={form.assignedTo} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Assignee name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <input name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Additional notes" />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium">
            {saving ? "Saving..." : "Add Task"}
          </button>
          <button type="button" onClick={() => router.back()} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
