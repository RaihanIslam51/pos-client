"use client";
import { showError, showSuccess, showWarning, showConfirm } from "@/lib/swal";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

const STATUS_COLORS = {
  active:  "bg-green-100 text-green-700",
  expired: "bg-gray-100 text-gray-500",
  claimed: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
};

const IconBtn = ({ title, onClick, disabled, color = "text-gray-500", children }) => (
  <button
    title={title}
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 ${color}`}
  >
    {children}
  </button>
);

function printWarranty(w) {
  const html = `<!DOCTYPE html><html><head><title>Warranty ${w.warrantyNumber}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:32px;color:#111;font-size:14px}
      h2{color:#1E3A8A;margin-bottom:4px}.sub{color:#666;margin-bottom:20px;font-size:12px}
      table{width:100%;border-collapse:collapse}
      td{padding:7px 12px;border:1px solid #ddd}
      td:first-child{font-weight:600;background:#f5f7ff;width:35%}
      .badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;background:#fef9c3;color:#854d0e}
    </style></head><body>
    <h2>Warranty Certificate</h2>
    <p class="sub">POS Software &mdash; ${new Date().toLocaleDateString()}</p>
    <table>
      <tr><td>Warranty No.</td><td>${w.warrantyNumber || "—"}</td></tr>
      <tr><td>Customer Name</td><td>${w.customerName || "—"}</td></tr>
      <tr><td>Mobile</td><td>${w.customerPhone || "—"}</td></tr>
      <tr><td>Invoice ID</td><td>${w.saleInvoice || "—"}</td></tr>
      <tr><td>Item</td><td>${w.productName || "—"}</td></tr>
      <tr><td>Serial No.</td><td>${w.serialNumber || "—"}</td></tr>
      <tr><td>Warranty Days</td><td>${w.warrantyPeriod ?? "—"} days</td></tr>
      <tr><td>Day Passed</td><td>${w.dayPassed ?? "—"} days</td></tr>
      <tr><td>Purchase Date</td><td>${w.purchaseDate ? new Date(w.purchaseDate).toLocaleDateString() : "—"}</td></tr>
      <tr><td>Expiry Date</td><td>${w.expiryDate ? new Date(w.expiryDate).toLocaleDateString() : "—"}</td></tr>
      <tr><td>Status</td><td><span class="badge">${w.status || "—"}</span></td></tr>
      <tr><td>Notes</td><td>${w.description || "—"}</td></tr>
    </table></body></html>`;
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.print();
}

function downloadPDF(w) {
  const html = `<!DOCTYPE html><html><head><title>Warranty ${w.warrantyNumber}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:32px;color:#111;font-size:14px}
      h2{color:#1E3A8A;margin-bottom:4px}.sub{color:#666;margin-bottom:20px;font-size:12px}
      table{width:100%;border-collapse:collapse}
      td{padding:7px 12px;border:1px solid #ddd}
      td:first-child{font-weight:600;background:#f5f7ff;width:35%}
      .badge{display:inline-block;padding:2px 10px;border-radius:999px;font-size:12px;background:#fef9c3;color:#854d0e}
    </style></head><body>
    <h2>Warranty Certificate</h2>
    <p class="sub">POS Software &mdash; ${new Date().toLocaleDateString()}</p>
    <table>
      <tr><td>Warranty No.</td><td>${w.warrantyNumber || "—"}</td></tr>
      <tr><td>Customer Name</td><td>${w.customerName || "—"}</td></tr>
      <tr><td>Mobile</td><td>${w.customerPhone || "—"}</td></tr>
      <tr><td>Invoice ID</td><td>${w.saleInvoice || "—"}</td></tr>
      <tr><td>Item</td><td>${w.productName || "—"}</td></tr>
      <tr><td>Serial No.</td><td>${w.serialNumber || "—"}</td></tr>
      <tr><td>Warranty Days</td><td>${w.warrantyPeriod ?? "—"} days</td></tr>
      <tr><td>Day Passed</td><td>${w.dayPassed ?? "—"} days</td></tr>
      <tr><td>Purchase Date</td><td>${w.purchaseDate ? new Date(w.purchaseDate).toLocaleDateString() : "—"}</td></tr>
      <tr><td>Expiry Date</td><td>${w.expiryDate ? new Date(w.expiryDate).toLocaleDateString() : "—"}</td></tr>
      <tr><td>Status</td><td><span class="badge">${w.status || "—"}</span></td></tr>
      <tr><td>Notes</td><td>${w.description || "—"}</td></tr>
    </table></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `warranty-${w.warrantyNumber || w._id}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Inline Edit Modal ─────────────────────────── */
function EditModal({ warranty, onClose, onSaved }) {
  const [form, setForm] = useState({
    customerName:   warranty.customerName  || "",
    customerPhone:  warranty.customerPhone || "",
    saleInvoice:    warranty.saleInvoice   || "",
    productName:    warranty.productName   || "",
    serialNumber:   warranty.serialNumber  || "",
    warrantyPeriod: warranty.warrantyPeriod ?? "",
    purchaseDate:   warranty.purchaseDate
      ? new Date(warranty.purchaseDate).toISOString().slice(0, 10)
      : "",
    status:      warranty.status      || "pending",
    description: warranty.description || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const dayPassed = (() => {
    if (!form.purchaseDate) return "";
    return Math.max(0, Math.floor((new Date() - new Date(form.purchaseDate)) / 86400000));
  })();

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await api.updateWarranty(warranty._id, {
        ...form,
        warrantyPeriod: parseInt(form.warrantyPeriod) || 0,
        dayPassed,
      });
      onSaved();
    } catch (err) {
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-[#1E3A8A] text-base">
            Edit Warranty — {warranty.warrantyNumber}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">×</button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Customer Name",   "customerName",   "text"],
              ["Mobile Number",   "customerPhone",  "text"],
              ["Sell Invoice ID", "saleInvoice",    "text"],
              ["Item Name",       "productName",    "text"],
              ["Serial No.",      "serialNumber",   "text"],
              ["Wty Days",        "warrantyPeriod", "number"],
              ["Purchase Date",   "purchaseDate",   "date"],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label} :</label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={set(key)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Day Passed :</label>
              <input
                readOnly
                value={dayPassed === "" ? "" : `${dayPassed} days`}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-500 cursor-default"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status :</label>
              <select
                value={form.status}
                onChange={set("status")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="claimed">Claimed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notes :</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={set("description")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none"
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main list ─────────────────────────────────── */
function WarrantyListContent() {
  const [warranties,   setWarranties]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search,       setSearch]       = useState("");
  const [deletingId,   setDeletingId]   = useState(null);
  const [editTarget,   setEditTarget]   = useState(null);

  const fetchWarranties = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : "";
      const res = await api.getWarranties(params);
      setWarranties(res.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchWarranties(); }, [fetchWarranties]);

  const handleDelete = async (id) => {
    const result = await showConfirm("Delete this warranty record?");
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      await api.deleteWarranty(id);
      fetchWarranties();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = warranties.filter((w) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (w.warrantyNumber || "").toLowerCase().includes(q) ||
      (w.customerName   || "").toLowerCase().includes(q) ||
      (w.productName    || "").toLowerCase().includes(q) ||
      (w.saleInvoice    || "").toLowerCase().includes(q) ||
      (w.serialNumber   || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {editTarget && (
        <EditModal
          warranty={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); fetchWarranties(); }}
        />
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-[#1E3A8A] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#1E3A8A] font-semibold">Warranty List</span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="claimed">Claimed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Warranty#, customer, item…"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] w-full sm:w-56"
            />
          </div>
        </div>
        <Link
          href="/dashboard/warranty/create"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Warranty
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Mobile cards */}
        <div className="block md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm"><p className="text-3xl mb-2">🛡️</p>No warranties found</div>
          ) : filtered.map((w) => {
            const daysLeft = w.expiryDate ? Math.ceil((new Date(w.expiryDate) - new Date()) / 86400000) : null;
            return (
              <div key={w._id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-xs font-mono font-bold text-[#1E3A8A]">{w.warrantyNumber || "—"}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{w.customerName || "—"}</p>
                    {w.customerPhone && <p className="text-xs text-gray-400">{w.customerPhone}</p>}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize shrink-0 ${STATUS_COLORS[w.status] || "bg-gray-100 text-gray-600"}`}>{w.status}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 mb-3">
                  <div><span className="text-gray-400">Item: </span>{w.productName || "—"}</div>
                  <div><span className="text-gray-400">Serial: </span>{w.serialNumber || "—"}</div>
                  <div><span className="text-gray-400">Invoice: </span>{w.saleInvoice || "—"}</div>
                  <div><span className="text-gray-400">Wty Days: </span>{w.warrantyPeriod ?? "—"}</div>
                  <div><span className="text-gray-400">Purchased: </span>{w.purchaseDate ? new Date(w.purchaseDate).toLocaleDateString() : "—"}</div>
                  <div>
                    <span className="text-gray-400">Expiry: </span>{w.expiryDate ? new Date(w.expiryDate).toLocaleDateString() : "—"}
                    {daysLeft !== null && w.status === "active" && (
                      <span className={`ml-1 ${daysLeft <= 30 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                        ({daysLeft > 0 ? `${daysLeft}d left` : "today"})
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1">
                  <button title="Edit" onClick={() => setEditTarget(w)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3.414a2 2 0 01.586-1.414z" /></svg>
                  </button>
                  <button title="Print" onClick={() => printWarranty(w)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" /></svg>
                  </button>
                  <button title="Download PDF" onClick={() => downloadPDF(w)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3M3 7l2-4h14l2 4" /></svg>
                  </button>
                  <button title="Delete" onClick={() => handleDelete(w._id)} disabled={deletingId === w._id} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 disabled:opacity-40 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" /></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-225">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {["#","Warranty #","Customer","Mobile","Invoice ID","Item","Sl No",
                  "Wty Days","Day Passed","Purchase Date","Expiry Date","Status","Actions"
                ].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={13} className="text-center py-10">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-12 text-gray-400 text-sm">
                    <p className="text-3xl mb-2">🛡️</p>No warranties found
                  </td>
                </tr>
              ) : (
                filtered.map((w, idx) => {
                  const daysLeft = w.expiryDate
                    ? Math.ceil((new Date(w.expiryDate) - new Date()) / 86400000)
                    : null;
                  return (
                    <tr key={w._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-[#1E3A8A] whitespace-nowrap">
                        {w.warrantyNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {w.customerName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {w.customerPhone || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {w.saleInvoice || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                        {w.productName || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-600 whitespace-nowrap">
                        {w.serialNumber || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center">
                        {w.warrantyPeriod ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 text-center">
                        {w.dayPassed ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                        {w.purchaseDate ? new Date(w.purchaseDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm text-gray-700">
                          {w.expiryDate ? new Date(w.expiryDate).toLocaleDateString() : "—"}
                        </p>
                        {daysLeft !== null && w.status === "active" && (
                          <p className={`text-xs ${daysLeft <= 30 ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                            {daysLeft > 0 ? `${daysLeft}d left` : "Expiring today"}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_COLORS[w.status] || "bg-gray-100 text-gray-600"}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          {/* Edit */}
                          <IconBtn title="Edit" color="text-blue-600" onClick={() => setEditTarget(w)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3.414a2 2 0 01.586-1.414z" />
                            </svg>
                          </IconBtn>
                          {/* Print */}
                          <IconBtn title="Print" color="text-gray-600" onClick={() => printWarranty(w)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
                            </svg>
                          </IconBtn>
                          {/* PDF */}
                          <IconBtn title="Download PDF" color="text-red-500" onClick={() => downloadPDF(w)}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3M3 7l2-4h14l2 4" />
                            </svg>
                          </IconBtn>
                          {/* Delete */}
                          <IconBtn
                            title="Delete"
                            color="text-red-500"
                            disabled={deletingId === w._id}
                            onClick={() => handleDelete(w._id)}
                          >
                            {deletingId === w._id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth={2} strokeDasharray="30" strokeDashoffset="10" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                              </svg>
                            )}
                          </IconBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            Showing {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            {statusFilter && ` — status: ${statusFilter}`}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WarrantyListPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]" />
      </div>
    }>
      <WarrantyListContent />
    </Suspense>
  );
}
