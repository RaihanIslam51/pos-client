"use client";
import { showError, showSuccess, showWarning, showConfirm } from "@/lib/swal";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function IconBtn({ title, onClick, colorClass, children, disabled }) {
  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled}
      className={`p-1.5 rounded transition-colors disabled:opacity-40 ${colorClass}`}>
      {children}
    </button>
  );
}

function SuppliersListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get("search") || "";

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const setSearch = (value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.getSuppliers(params);
      setSuppliers(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handlePrintPDF = () => {
    const rows = suppliers.map((s, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${s.name}${s.company ? `<br/><small style="color:#888">${s.company}</small>` : ""}</td>
        <td>${s.phone}</td>
        <td>${s.email || "—"}</td>
        <td>${s.state || "—"}</td>
        <td>${s.gstin || "—"}</td>
        <td style="color:#dc2626">৳${(s.dueAmount || 0).toFixed(2)}</td>
        <td><span style="padding:2px 8px;border-radius:9999px;font-size:11px;background:${s.isActive !== false ? "#dcfce7" : "#f3f4f6"};color:${s.isActive !== false ? "#15803d" : "#6b7280"}">${s.isActive !== false ? "Active" : "Inactive"}</span></td>
      </tr>`).join("");
    const html = `<!DOCTYPE html><html><head><title>Supplier List</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:12px;margin:20px;color:#111}
      h2{color:#1E3A8A;margin-bottom:4px}p{color:#555;margin:0 0 12px}
      table{width:100%;border-collapse:collapse}
      th{background:#1E3A8A;color:#fff;padding:8px 10px;text-align:left;font-size:11px}
      td{padding:7px 10px;border-bottom:1px solid #e5e7eb;vertical-align:top}
      tr:nth-child(even) td{background:#f9fafb}
      @media print{body{margin:10px}}
    </style></head><body>
    <h2>Supplier List</h2><p>Total: ${suppliers.length} suppliers &nbsp;|&nbsp; Generated: ${new Date().toLocaleString()}</p>
    <table><thead><tr><th>#</th><th>Name</th><th>Mobile</th><th>Email</th><th>State</th><th>GSTIN</th><th>Due</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`;
    const win = window.open("", "_blank", "width=900,height=600");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("Delete this supplier?");
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      await api.deleteSupplier(id);
      fetchSuppliers();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:flex-1 sm:max-w-xs">
          <input
            type="text"
            placeholder="Search suppliers..."
            defaultValue={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
          />
          <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
        <Link
          href="/dashboard/suppliers/create"
          className="flex-1 sm:flex-none bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add Supplier</span>
          <span className="sm:hidden">Add</span>
        </Link>
        <button
          type="button"
          onClick={handlePrintPDF}
          disabled={loading || suppliers.length === 0}
          className="flex-1 sm:flex-none bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          PDF
        </button>
        </div>
      </div>

      {/* ── Mobile card view ── */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-10"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div></div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
            <p className="text-3xl mb-2">🏢</p>No suppliers found
          </div>
        ) : (
          suppliers.map((s, idx) => (
            <div key={s._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{s.name}</p>
                  {s.company && <p className="text-xs text-gray-400 truncate">{s.company}</p>}
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                  s.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {s.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-400">Mobile</p>
                  <p className="font-medium text-gray-700">{s.phone}</p>
                </div>
                <div>
                  <p className="text-gray-400">Due</p>
                  <p className="font-semibold text-red-500">৳{(s.dueAmount || 0).toFixed(2)}</p>
                </div>
                {s.email && <div className="col-span-2">
                  <p className="text-gray-400">Email</p>
                  <p className="font-medium text-gray-700 truncate">{s.email}</p>
                </div>}
              </div>
              <div className="flex items-center justify-end gap-1 border-t border-gray-100 pt-2">
                <IconBtn title="View" onClick={() => router.push(`/dashboard/suppliers/${s._id}`)} colorClass="text-[#1E3A8A] hover:bg-blue-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </IconBtn>
                <IconBtn title="Edit" onClick={() => router.push(`/dashboard/suppliers/${s._id}/edit`)} colorClass="text-green-600 hover:bg-green-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </IconBtn>
                <IconBtn title="Delete" onClick={() => handleDelete(s._id)} disabled={deletingId === s._id} colorClass="text-red-500 hover:bg-red-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </IconBtn>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop table ── */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Mobile</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">State</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">GSTIN</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Due</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                    <p className="text-3xl mb-2">🏭</p>No suppliers found
                  </td>
                </tr>
              ) : (
                suppliers.map((s, idx) => (
                  <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                          {s.company && <p className="text-xs text-gray-400">{s.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.email || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{s.state || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{s.gstin || "—"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-500">
                      ৳{(s.dueAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        s.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {s.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        {/* View */}
                        <IconBtn title="View" onClick={() => router.push(`/dashboard/suppliers/${s._id}`)}
                          colorClass="text-[#1E3A8A] hover:bg-blue-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </IconBtn>
                        {/* Edit */}
                        <IconBtn title="Edit" onClick={() => router.push(`/dashboard/suppliers/${s._id}/edit`)}
                          colorClass="text-green-600 hover:bg-green-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </IconBtn>
                        {/* Delete */}
                        <IconBtn title="Delete" onClick={() => handleDelete(s._id)}
                          disabled={deletingId === s._id}
                          colorClass="text-red-500 hover:bg-red-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </IconBtn>
                      </div>
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

export default function SuppliersListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <SuppliersListContent />
    </Suspense>
  );
}
