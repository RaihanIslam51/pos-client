"use client";
import { showError, showSuccess, showWarning } from "@/lib/swal";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

/* ── helpers ─────────────────────────────────────────── */
const IconBtn = ({ title, onClick, disabled, color = "text-gray-500", children }) => (
  <button title={title} onClick={onClick} disabled={disabled}
    className={`p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-40 ${color}`}>
    {children}
  </button>
);

const Badge = ({ label, color }) => (
  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${color}`}>{label}</span>
);

function ToggleBtn({ value, onChange }) {
  return (
    <div className="flex">
      {["Yes", "No"].map((opt) => {
        const active = (opt === "Yes") === value;
        return (
          <button key={opt} type="button" onClick={() => onChange(opt === "Yes")}
            className={`px-4 py-1.5 text-xs font-semibold border transition-colors first:rounded-l-lg last:rounded-r-lg ${
              active ? "bg-[#1E3A8A] text-white border-[#1E3A8A]" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

/* ── Edit Modal ──────────────────────────────────────── */
function EditModal({ customer, onClose, onSaved }) {
  const [form, setForm] = useState({
    name:         customer.name         || "",
    nameLine2:    customer.nameLine2    || "",
    phone:        customer.phone        || "",
    email:        customer.email        || "",
    address:      customer.address      || "",
    state:        customer.state        || "",
    gstin:        customer.gstin        || "",
    latitude:     customer.latitude     || "",
    longitude:    customer.longitude    || "",
    initialDue:   customer.initialDue   ?? 0,
    barcode:      customer.barcode      || "",
    isWholesaler: customer.isWholesaler || false,
    dueAllowed:   customer.dueAllowed   || false,
    status:       customer.status       || "active",
    notes:        customer.notes        || "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set  = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setB = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]";

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      await api.updateCustomer(customer._id, { ...form, initialDue: parseFloat(form.initialDue) || 0 });
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
          <h3 className="font-bold text-[#1E3A8A] text-base">Edit Customer — {customer.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">×</button>
        </div>
        <div className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Customer Name",         "name",       "text"],
              ["Customer Name 2nd Line","nameLine2",  "text"],
              ["Mobile Number",         "phone",      "text"],
              ["Email",                 "email",      "email"],
              ["Address",               "address",    "text"],
              ["State",                 "state",      "text"],
              ["GSTIN",                 "gstin",      "text"],
              ["Latitude",              "latitude",   "text"],
              ["Longitude",             "longitude",  "text"],
              ["Initial Due",           "initialDue", "number"],
              ["Barcode",               "barcode",    "text"],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1">{label} :</label>
                <input type={type} value={form[key]} onChange={set(key)} className={INPUT} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Is Wholesaler :</label>
              <ToggleBtn value={form.isWholesaler} onChange={setB("isWholesaler")} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2">Due Allowed :</label>
              <ToggleBtn value={form.dueAllowed} onChange={setB("dueAllowed")} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Status :</label>
              <select value={form.status} onChange={set("status")} className={INPUT + " bg-white"}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Notes :</label>
              <textarea rows={2} value={form.notes} onChange={set("notes")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
          <button onClick={onClose}
            className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main List ───────────────────────────────────────── */
function CustomerListContent() {
  const [customers,  setCustomers]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await api.getCustomers(params);
      setCustomers(res.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(t);
  }, [fetchCustomers]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this customer?")) return;
    setDeletingId(id);
    try {
      await api.deleteCustomer(id);
      fetchCustomers();
    } catch (err) { showError(err.message); }
    finally { setDeletingId(null); }
  };

  const handleToggleImportant = async (id) => {
    setTogglingId(id);
    try {
      await api.toggleImportantCustomer(id);
      fetchCustomers();
    } catch (err) { showError(err.message); }
    finally { setTogglingId(null); }
  };

  const COLS = [
    "#","Image","Name","Phone","Email","Address","State","GSTIN",
    "Lat/Lng","Initial Due","Total Purchase","Due","Barcode",
    "Wholesaler","Due Allowed","Status","VIP","Actions"
  ];

  return (
    <div className="space-y-4">
      {editTarget && (
        <EditModal
          customer={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => { setEditTarget(null); fetchCustomers(); }}
        />
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-[#1E3A8A] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#1E3A8A] font-semibold">Customer List</span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
        />
        <Link href="/dashboard/customers/create"
          className="bg-[#1E3A8A] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Customer
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              <p className="text-3xl mb-2">👥</p>No customers found
            </div>
          ) : customers.map((c, idx) => (
            <div key={c._id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start gap-3">
                {c.customerImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.customerImage} alt="customer" className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm font-bold shrink-0">
                    {(c.name || "?")[0].toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1 flex-wrap">
                      {c.isImportant && <span className="text-yellow-400">★</span>}
                      <span className="font-semibold text-gray-800 text-sm">{c.name}</span>
                      {c.nameLine2 && <span className="text-xs text-gray-400">{c.nameLine2}</span>}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">#{idx + 1}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{c.phone}{c.email ? ` • ${c.email}` : ""}</p>
                  {(c.address || c.state) && (
                    <p className="text-xs text-gray-400 mt-0.5">{[c.address, c.state].filter(Boolean).join(", ")}</p>
                  )}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                    <div>
                      <p className="text-[10px] text-gray-400">Total Purchase</p>
                      <p className="text-sm font-semibold text-gray-800">৳{(c.totalPurchase || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Due</p>
                      <p className="text-sm font-semibold text-red-600">৳{(c.dueAmount || 0).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.status === "inactive"
                      ? <Badge label="Inactive" color="bg-gray-100 text-gray-500" />
                      : <Badge label="Active" color="bg-green-100 text-green-700" />}
                    {c.isWholesaler && <Badge label="Wholesaler" color="bg-blue-100 text-blue-700" />}
                    {c.dueAllowed && <Badge label="Due Allowed" color="bg-green-100 text-green-700" />}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <button onClick={() => handleToggleImportant(c._id)} disabled={togglingId === c._id}
                      title={c.isImportant ? "Remove VIP" : "Mark as VIP"}
                      className={`text-lg transition-colors ${c.isImportant ? "text-yellow-400 hover:text-gray-300" : "text-gray-200 hover:text-yellow-400"}`}>
                      ★
                    </button>
                    <div className="flex items-center gap-1">
                      <IconBtn title="Edit" color="text-blue-600" onClick={() => setEditTarget(c)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3.414a2 2 0 01.586-1.414z" />
                        </svg>
                      </IconBtn>
                      <IconBtn title="Delete" color="text-red-500" disabled={deletingId === c._id} onClick={() => handleDelete(c._id)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                        </svg>
                      </IconBtn>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {COLS.map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={COLS.length} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]" />
                </td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={COLS.length} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">👥</p>No customers found
                </td></tr>
              ) : customers.map((c, idx) => (
                <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>

                  {/* Images */}
                  <td className="px-4 py-3">
                    <div className="flex gap-1 items-center">
                      {c.customerImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.customerImage} alt="customer" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold">
                          {(c.name || "?")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {c.isImportant && <span className="text-yellow-400 text-sm">★</span>}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                        {c.nameLine2 && <p className="text-xs text-gray-400">{c.nameLine2}</p>}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{c.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{c.address || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{c.state || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{c.gstin || "—"}</td>

                  {/* Lat/Lng */}
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {c.latitude || c.longitude
                      ? <span>{c.latitude || "—"}<br />{c.longitude || "—"}</span>
                      : "—"}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    ৳{parseFloat(c.initialDue || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                    ৳{(c.totalPurchase || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600 whitespace-nowrap font-medium">
                    ৳{(c.dueAmount || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 whitespace-nowrap">{c.barcode || "—"}</td>

                  {/* Wholesaler */}
                  <td className="px-4 py-3">
                    {c.isWholesaler
                      ? <Badge label="Yes" color="bg-blue-100 text-blue-700" />
                      : <Badge label="No"  color="bg-gray-100 text-gray-500" />}
                  </td>

                  {/* Due Allowed */}
                  <td className="px-4 py-3">
                    {c.dueAllowed
                      ? <Badge label="Yes" color="bg-green-100 text-green-700" />
                      : <Badge label="No"  color="bg-gray-100 text-gray-500" />}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    {c.status === "inactive"
                      ? <Badge label="Inactive" color="bg-gray-100 text-gray-500" />
                      : <Badge label="Active"   color="bg-green-100 text-green-700" />}
                  </td>

                  {/* VIP */}
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleImportant(c._id)} disabled={togglingId === c._id}
                      title={c.isImportant ? "Remove VIP" : "Mark as VIP"}
                      className={`text-xl transition-colors ${c.isImportant ? "text-yellow-400 hover:text-gray-300" : "text-gray-200 hover:text-yellow-400"}`}>
                      ★
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <IconBtn title="Edit" color="text-blue-600" onClick={() => setEditTarget(c)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a2 2 0 01-1.414.586H7v-3.414a2 2 0 01.586-1.414z" />
                        </svg>
                      </IconBtn>
                      <IconBtn title="Delete" color="text-red-500" disabled={deletingId === c._id} onClick={() => handleDelete(c._id)}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
                        </svg>
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && customers.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
            {customers.length} customer{customers.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <CustomerListContent />
    </Suspense>
  );
}
