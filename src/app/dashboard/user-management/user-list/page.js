"use client";
import { showError, showSuccess, showWarning, showConfirm } from "@/lib/swal";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const [changingPassword, setChangingPassword] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set("role", roleFilter);
      if (search) params.set("search", search);
      const q = params.toString() ? `?${params}` : "";
      const res = await api.getAppUsers(q);
      setUsers(res.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const handleDeactivate = async (id) => {
    const result = await showConfirm("Deactivate this user?");
    if (!result.isConfirmed) return;
    try {
      await api.deleteAppUser(id);
      fetchUsers();
    } catch (err) { showError(err.message); }
  };

  const handlePasswordChange = async (id) => {
    if (!newPassword || newPassword.length < 6) { showWarning("Password must be at least 6 characters"); return; }
    try {
      await api.changeAppUserPassword(id, { newPassword });
      setChangingPassword(null);
      setNewPassword("");
      showSuccess("Password changed successfully");
    } catch (err) { showError(err.message); }
  };

  const roleColor = { admin: "bg-red-100 text-red-700", manager: "bg-blue-100 text-blue-700", cashier: "bg-green-100 text-green-700" };

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">User Management</h1>
        <Link href="/dashboard/user-management/add-user" className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium whitespace-nowrap">
          + Add User
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        {["admin","manager","cashier"].map((role) => (
          <div key={role} className={`rounded-xl p-3 sm:p-4 border ${role === "admin" ? "bg-red-50 border-red-100" : role === "manager" ? "bg-blue-50 border-blue-100" : "bg-green-50 border-green-100"}`}>
            <p className="text-xs text-gray-500 capitalize">{role}s</p>
            <p className={`text-xl sm:text-2xl font-bold ${role === "admin" ? "text-red-700" : role === "manager" ? "text-blue-700" : "text-green-700"}`}>
              {users.filter((u) => u.role === role).length}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="bg-white rounded-xl shadow p-3 sm:p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="flex gap-2 flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 min-w-0" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 shrink-0">Search</button>
        </form>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="cashier">Cashier</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Created</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No users found</td></tr>
              ) : users.map((user, i) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${roleColor[user.role] || "bg-gray-100 text-gray-600"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {user.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => { setChangingPassword(user._id); setNewPassword(""); }} className="text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600">
                        Change PW
                      </button>
                      {user.isActive !== false && (
                        <button onClick={() => handleDeactivate(user._id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                          Deactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-400 text-sm">No users found</div>
        ) : users.map((user, i) => (
          <div key={user._id} className="bg-white rounded-xl shadow p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${roleColor[user.role] || "bg-gray-100 text-gray-600"}`}>
                  {user.role}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {user.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
            <div className="flex gap-2">
              <button onClick={() => { setChangingPassword(user._id); setNewPassword(""); }} className="flex-1 text-xs bg-yellow-500 text-white px-3 py-1.5 rounded-lg hover:bg-yellow-600 font-medium">
                Change Password
              </button>
              {user.isActive !== false && (
                <button onClick={() => handleDeactivate(user._id)} className="flex-1 text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600 font-medium">
                  Deactivate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Change Password Modal */}
      {changingPassword && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min. 6 chars)"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => handlePasswordChange(changingPassword)} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 font-medium">
                Update Password
              </button>
              <button onClick={() => setChangingPassword(null)} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 font-medium">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
