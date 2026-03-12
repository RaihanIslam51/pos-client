"use client";
import { showError, showSuccess, showWarning } from "@/lib/swal";
import { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function ListBankAccountContent() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.getBankAccounts(params);
      setAccounts(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchAccounts, 300);
    return () => clearTimeout(t);
  }, [fetchAccounts]);

  const startEdit = (acc) => { setEditingId(acc._id); setEditForm({ bankName: acc.bankName, accountName: acc.accountName, branchName: acc.branchName }); };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const handleSave = async (id) => {
    setSavingId(id);
    try {
      await api.updateBankAccount(id, editForm);
      setEditingId(null);
      fetchAccounts();
    } catch (err) { showError(err.message); } finally { setSavingId(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this bank account?")) return;
    setDeletingId(id);
    try {
      await api.deleteBankAccount(id);
      fetchAccounts();
    } catch (err) { showError(err.message); } finally { setDeletingId(null); }
  };

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bank, account name or number..."
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
        <Link href="/dashboard/banking/add-bank-account"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Bank Account
        </Link>
      </div>

      {!loading && accounts.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-700">Total Balance</span>
          <span className="text-lg font-bold text-blue-700">৳{totalBalance.toFixed(2)}</span>
        </div>
      )}

      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm"><p className="text-3xl mb-2">🏦</p>No bank accounts found</div>
        ) : accounts.map((acc, idx) => (
          <div key={acc._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-800 text-sm">{acc.bankName}</p>
                <p className="text-xs text-gray-500">{acc.accountName}</p>
              </div>
              <p className="text-base font-bold text-blue-700">৳{(acc.balance || 0).toFixed(2)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-2">
              <div><p className="text-gray-400">Account No.</p><p className="font-medium text-gray-700">{acc.accountNumber}</p></div>
              <div><p className="text-gray-400">Branch</p><p className="font-medium text-gray-700">{acc.branchName || "—"}</p></div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => startEdit(acc)} className="flex-1 text-blue-600 text-xs font-medium py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50">Edit</button>
              <button onClick={() => handleDelete(acc._id)} disabled={deletingId === acc._id} className="flex-1 text-red-500 text-xs font-medium py-1.5 border border-red-200 rounded-lg hover:bg-red-50">{deletingId === acc._id ? "..." : "Delete"}</button>
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
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Bank Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Account Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Account No.</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Branch</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Balance</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm"><p className="text-3xl mb-2">🏦</p>No bank accounts found</td></tr>
              ) : (
                accounts.map((acc, idx) => (
                  <tr key={acc._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {editingId === acc._id
                        ? <input value={editForm.bankName} onChange={(e) => setEditForm((f) => ({ ...f, bankName: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                        : <span className="text-sm font-medium text-gray-800">{acc.bankName}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === acc._id
                        ? <input value={editForm.accountName} onChange={(e) => setEditForm((f) => ({ ...f, accountName: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm w-32 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                        : <span className="text-sm text-gray-700">{acc.accountName}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{acc.accountNumber}</td>
                    <td className="px-4 py-3">
                      {editingId === acc._id
                        ? <input value={editForm.branchName} onChange={(e) => setEditForm((f) => ({ ...f, branchName: e.target.value }))} className="border border-gray-300 rounded px-2 py-1 text-sm w-28 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]" />
                        : <span className="text-sm text-gray-500">{acc.branchName || "—"}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-700">৳{(acc.balance || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {editingId === acc._id ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleSave(acc._id)} disabled={savingId === acc._id} className="text-green-600 hover:underline text-xs font-medium">{savingId === acc._id ? "..." : "Save"}</button>
                          <button onClick={cancelEdit} className="text-gray-400 hover:underline text-xs">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEdit(acc)} className="text-blue-500 hover:underline text-xs font-medium">Edit</button>
                          <button onClick={() => handleDelete(acc._id)} disabled={deletingId === acc._id} className="text-red-500 hover:underline text-xs font-medium">{deletingId === acc._id ? "..." : "Delete"}</button>
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

export default function ListBankAccountPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <ListBankAccountContent />
    </Suspense>
  );
}
