"use client";
import { showError, showSuccess, showWarning, showConfirm } from "@/lib/swal";
import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function ListEmployeeContent() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.getEmployees(params);
      setEmployees(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(t);
  }, [fetchEmployees]);

  const startEdit = (emp) => {
    setEditingId(emp._id);
    setEditForm({ name: emp.name, department: emp.department, designation: emp.designation, salary: emp.salary, phone: emp.phone });
  };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleSave = async (id) => {
    setSavingId(id);
    try {
      await api.updateEmployee(id, { ...editForm, salary: Number(editForm.salary) || 0 });
      setEditingId(null);
      fetchEmployees();
    } catch (err) { showError(err.message); } finally { setSavingId(null); }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("Delete this employee?");
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      await api.deleteEmployee(id);
      fetchEmployees();
    } catch (err) { showError(err.message); } finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        <Link href="/dashboard/hrm/add-employee"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Employee
        </Link>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></div>
        ) : employees.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm"><p className="text-3xl mb-2">👥</p>No employees found</div>
        ) : employees.map((emp, idx) => (
          <div key={emp._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{emp.name}</p>
                <p className="text-xs text-gray-400">{emp.employeeId || ""} {emp.designation ? `· ${emp.designation}` : ""}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(emp)} className="text-blue-500 text-xs font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50">Edit</button>
                <button onClick={() => handleDelete(emp._id)} disabled={deletingId === emp._id} className="text-red-500 text-xs font-medium px-2 py-1 border border-red-200 rounded hover:bg-red-50">{deletingId === emp._id ? "..." : "Del"}</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-2">
              <div><p className="text-gray-400">Department</p><p className="font-medium text-gray-700">{emp.department || "—"}</p></div>
              <div><p className="text-gray-400">Phone</p><p className="font-medium text-gray-700">{emp.phone || "—"}</p></div>
              <div><p className="text-gray-400">Salary</p><p className="font-semibold text-gray-700">৳{(emp.salary || 0).toFixed(2)}</p></div>
              <div><p className="text-gray-400">Status</p><span className={`px-1.5 py-0.5 rounded-full text-xs ${emp.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{emp.isActive !== false ? "Active" : "Inactive"}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Emp ID</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Department</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Designation</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Phone</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Salary</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm"><p className="text-3xl mb-2">👥</p>No employees found</td></tr>
              ) : (
                employees.map((emp, idx) => (
                  <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {editingId === emp._id
                        ? <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm w-28 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                        : <span className="text-sm font-medium text-gray-800">{emp.name}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{emp.employeeId || "—"}</td>
                    <td className="px-4 py-3">
                      {editingId === emp._id
                        ? <input value={editForm.department} onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                        : <span className="text-sm text-gray-600">{emp.department || "—"}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === emp._id
                        ? <input value={editForm.designation} onChange={(e) => setEditForm((f) => ({ ...f, designation: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                        : <span className="text-sm text-gray-600">{emp.designation || "—"}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === emp._id
                        ? <input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm w-24 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                        : <span className="text-sm text-gray-500">{emp.phone || "—"}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === emp._id
                        ? <input type="number" value={editForm.salary} onChange={(e) => setEditForm((f) => ({ ...f, salary: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm w-20 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                        : <span className="text-sm font-semibold text-gray-700">৳{(emp.salary || 0).toFixed(2)}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === emp._id ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleSave(emp._id)} disabled={savingId === emp._id} className="text-green-600 hover:underline text-xs font-medium">{savingId === emp._id ? "..." : "Save"}</button>
                          <button onClick={cancelEdit} className="text-gray-400 hover:underline text-xs">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(emp)} className="text-blue-500 hover:underline text-xs font-medium">Edit</button>
                          <button onClick={() => handleDelete(emp._id)} disabled={deletingId === emp._id} className="text-red-500 hover:underline text-xs font-medium">{deletingId === emp._id ? "..." : "Delete"}</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ListEmployeePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <ListEmployeeContent />
    </Suspense>
  );
}
