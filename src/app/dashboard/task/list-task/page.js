"use client";
import { showError, showSuccess, showWarning, showConfirm } from "@/lib/swal";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function ListTaskPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (priorityFilter) params.set("priority", priorityFilter);
      if (search) params.set("search", search);
      const q = params.toString() ? `?${params}` : "";
      const res = await api.getTasks(q);
      setTasks(res.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [statusFilter, priorityFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.updateTaskStatus(id, { status });
      fetchTasks();
    } catch (err) { showError(err.message); }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("Delete this task?");
    if (!result.isConfirmed) return;
    try {
      await api.deleteTask(id);
      fetchTasks();
    } catch (err) { showError(err.message); }
  };

  const priorityColor = { low: "bg-gray-100 text-gray-600", medium: "bg-yellow-100 text-yellow-700", high: "bg-red-100 text-red-700" };
  const statusColor = { pending: "bg-gray-100 text-gray-600", "in-progress": "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700" };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Task List</h1>
        <Link href="/dashboard/task/add-task" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium w-full sm:w-auto justify-center sm:justify-start">
          <span>+</span> Add Task
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {[
          { label: "Pending", val: tasks.filter((t) => t.status === "pending").length, color: "gray" },
          { label: "In Progress", val: tasks.filter((t) => t.status === "in-progress").length, color: "blue" },
          { label: "Completed", val: tasks.filter((t) => t.status === "completed").length, color: "green" },
        ].map((s) => (
          <div key={s.label} className={`bg-${s.color}-50 rounded-xl p-3 sm:p-4 border border-${s.color}-100`}>
            <p className="text-xs text-gray-500 truncate">{s.label}</p>
            <p className={`text-xl sm:text-2xl font-bold text-${s.color}-700`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-3 sm:p-4 mb-4 flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-end">
        <form onSubmit={(e) => { e.preventDefault(); fetchTasks(); }} className="flex gap-2 w-full sm:w-auto">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..." className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:w-48" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 shrink-0">Search</button>
        </form>
        <div className="flex gap-2 flex-wrap">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none">
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400">No tasks found</div>
        ) : tasks.map((task, i) => (
          <div key={task._id} className="bg-white rounded-xl shadow p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{task.title}</p>
                {task.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{task.description}</p>}
              </div>
              <button onClick={() => handleDelete(task._id)} className="shrink-0 text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full font-medium capitalize ${priorityColor[task.priority] || "bg-gray-100 text-gray-600"}`}>{task.priority}</span>
              <span className="text-gray-500">{task.assignedTo || "Unassigned"}</span>
              {task.dueDate && <span className="text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
            </div>
            <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}
              className={`w-full px-2 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${statusColor[task.status] || "bg-gray-100 text-gray-600"}`}>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">#</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Title</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Assigned To</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Due Date</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Priority</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : tasks.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No tasks found</td></tr>
            ) : tasks.map((task, i) => (
              <tr key={task._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                <td className="px-4 py-3">
                  <p className="font-medium">{task.title}</p>
                  {task.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{task.description}</p>}
                </td>
                <td className="px-4 py-3">{task.assignedTo || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${priorityColor[task.priority] || "bg-gray-100 text-gray-600"}`}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColor[task.status] || "bg-gray-100 text-gray-600"}`}>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(task._id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
