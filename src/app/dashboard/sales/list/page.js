"use client";
import { showError, showSuccess, showConfirm } from "@/lib/swal";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

// ── Action icon buttons ────────────────────────────────────────────────────────
function IconBtn({ title, onClick, colorClass, children, disabled }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-all disabled:opacity-40 active:scale-95 ${colorClass}`}
    >
      {children}
    </button>
  );
}

const STATUS_COLORS = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  hold: "bg-blue-100 text-blue-700",
  instalment: "bg-purple-100 text-purple-700",
};

const PERIOD_OPTIONS = [
  { label: "Last 10 Days", days: 10 },
  { label: "Last 20 Days", days: 20 },
  { label: "Last 30 Days", days: 30 },
];

function isWithinDays(dateStr, days) {
  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - days);
  return new Date(dateStr) >= cutoff;
}

function InvoiceListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const startDate = searchParams.get("from") || "";
  const endDate = searchParams.get("to") || "";
  const statusFilter = searchParams.get("status") || "";

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [printingId, setPrintingId] = useState(null);

  // ── Selection state ──────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [activePeriod, setActivePeriod] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteByDateDeleting, setBulkDeleteByDateDeleting] = useState(false);

  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const fetchSales = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (statusFilter) params.append("status", statusFilter);
      const res = await api.getSales(params.toString() ? `?${params}` : "");
      // Filter to show only completed paid invoices (dueAmount <= 0 AND status = completed)
      const paidSales = (res.data || []).filter((s) => s.dueAmount <= 0 && s.status === "completed");
      setSales(paidSales);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, statusFilter]);

  useEffect(() => {
    fetchSales();
    setSelectedIds(new Set());
    setActivePeriod(null);
  }, [fetchSales]);

  // ── Checkbox helpers ─────────────────────────────────────────────────────────
  const toggleOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setActivePeriod(null);
  };

  const toggleAll = () => {
    if (selectedIds.size === sales.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sales.map((s) => s._id)));
    }
    setActivePeriod(null);
  };

  const selectByPeriod = (days) => {
    if (activePeriod === days) {
      setSelectedIds(new Set());
      setActivePeriod(null);
    } else {
      const ids = new Set(
        sales.filter((s) => isWithinDays(s.createdAt, days)).map((s) => s._id)
      );
      setSelectedIds(ids);
      setActivePeriod(days);
    }
  };

  const allChecked = sales.length > 0 && selectedIds.size === sales.length;
  const someChecked = selectedIds.size > 0 && selectedIds.size < sales.length;

  // ── Bulk delete ──────────────────────────────────────────────────────────────
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const result = await showConfirm(
      `Delete ${selectedIds.size} selected invoice${selectedIds.size > 1 ? "s" : ""}? This cannot be undone.`
    );
    if (!result.isConfirmed) return;
    setBulkDeleting(true);
    try {
      const res = await api.bulkDeleteSales([...selectedIds]);
      showSuccess(res.message || "Invoices deleted successfully");
      setSelectedIds(new Set());
      setActivePeriod(null);
      fetchSales();
    } catch (err) {
      showError(err.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  // ── Single delete ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const result = await showConfirm("Delete this invoice?");
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      await api.deleteSale(id);
      fetchSales();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrint = (id) => {
    setPrintingId(id);
    const w = window.open(`/dashboard/sales/${id}?print=1`, "_blank");
    if (w) w.onload = () => setPrintingId(null);
    else setPrintingId(null);
  };

  const handleBulkDeleteByDate = async (days) => {
    const dayLabels = { "10": "Last 10 days", "30": "Last 30 days", "all": "All paid invoices" };
    const result = await showConfirm(`Delete ${dayLabels[days]}?`);
    if (!result.isConfirmed) return;

    setBulkDeleteByDateDeleting(true);
    try {
      const res = await api.bulkDeleteSalesByDate(days);
      showSuccess(`${res.data?.deletedCount || 0} invoices deleted successfully`);
      setShowBulkDeleteModal(false);
      setSelectedIds(new Set());
      setActivePeriod(null);
      fetchSales();
    } catch (err) {
      showError(err.message);
    } finally {
      setBulkDeleteByDateDeleting(false);
    }
  };

  return (
    <div className="space-y-3">

      {/* ── Top bar: filters + new invoice ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {/* Filter row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="col-span-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">From</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setParam("from", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/40 focus:border-[#1E3A8A] transition bg-gray-50"
              />
            </div>
            <div className="col-span-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">To</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setParam("to", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/40 focus:border-[#1E3A8A] transition bg-gray-50"
              />
            </div>
            <div className="col-span-1">
              <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setParam("status", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-2.5 py-2 text-xs sm:text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/40 focus:border-[#1E3A8A] transition"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="hold">Hold</option>
                <option value="instalment">Instalment</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-span-1 flex items-end gap-2">
              <button
                onClick={() => setShowBulkDeleteModal(true)}
                className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete By Date</span>
              </button>
              <Link
                href="/dashboard/sales/create"
                className="flex-1 bg-[#1E3A8A] text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-800 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-[#1E3A8A]/20"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Invoice</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bulk action toolbar ── */}
      {/* <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-3 sm:px-4 py-3">
        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Quick Select:</span>
            {PERIOD_OPTIONS.map(({ label, days }) => (
              <button
                key={days}
                type="button"
                onClick={() => selectByPeriod(days)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                  activePeriod === days
                    ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-sm"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {label}
                {activePeriod === days && (
                  <span className="ml-1.5 bg-white text-[#1E3A8A] rounded-full text-[10px] px-1.5 py-0.5 font-bold">
                    {selectedIds.size}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selectedIds.size > 0 && (
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                <span className="font-bold text-[#1E3A8A]">{selectedIds.size}</span> selected
              </span>
            )}
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={selectedIds.size === 0 || bulkDeleting}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                selectedIds.size > 0
                  ? "bg-red-600 text-white hover:bg-red-700 shadow-sm"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              } disabled:opacity-60`}
            >
              {bulkDeleting ? (
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
              Delete {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
            </button>
          </div>
        </div>
      </div> */}

      {/* ── Mobile card view (< md) ── */}
      <div className="block md:hidden space-y-2.5">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-[#1E3A8A]" />
              <p className="text-xs text-gray-400 font-medium">Loading invoices…</p>
            </div>
          </div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 text-center px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-600 mb-1">No invoices found</p>
            <p className="text-xs text-gray-400">Try adjusting your filters or create a new invoice</p>
          </div>
        ) : (
          sales.map((s) => (
            <div
              key={s._id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
                selectedIds.has(s._id) ? "border-[#1E3A8A] ring-1 ring-[#1E3A8A]/30" : "border-gray-200"
              }`}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 px-3.5 pt-3.5 pb-2.5">
                <input
                  type="checkbox"
                  checked={selectedIds.has(s._id)}
                  onChange={() => toggleOne(s._id)}
                  className="h-4 w-4 rounded border-gray-300 accent-[#1E3A8A] cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono font-bold text-gray-800 truncate">{s.invoiceNumber}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${STATUS_COLORS[s.status] || "bg-gray-100 text-gray-600"}`}>
                      {s.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{s.customerName}</p>
                </div>
                <p className="text-[10px] text-gray-400 shrink-0">{new Date(s.createdAt).toLocaleDateString()}</p>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-3 gap-px bg-gray-100 border-t border-b border-gray-100">
                <div className="bg-white px-3 py-2.5 text-center">
                  <p className="text-[10px] text-gray-400 font-medium">Total</p>
                  <p className="text-sm font-bold text-gray-800">৳{s.totalAmount.toFixed(2)}</p>
                </div>
                <div className="bg-white px-3 py-2.5 text-center">
                  <p className="text-[10px] text-gray-400 font-medium">Paid</p>
                  <p className="text-sm font-bold text-green-600">৳{s.paidAmount.toFixed(2)}</p>
                </div>
                <div className="bg-white px-3 py-2.5 text-center">
                  <p className="text-[10px] text-gray-400 font-medium">Due</p>
                  <p className="text-sm font-bold text-red-600">৳{s.dueAmount.toFixed(2)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 px-3 py-2">
                <Link href={`/dashboard/sales/${s._id}`}>
                  <IconBtn title="View" colorClass="text-[#1E3A8A] hover:bg-blue-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </IconBtn>
                </Link>
                <Link href={`/dashboard/sales/${s._id}/edit`}>
                  <IconBtn title="Edit" colorClass="text-green-600 hover:bg-green-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </IconBtn>
                </Link>
                <IconBtn title="Print" onClick={() => handlePrint(s._id)} disabled={printingId === s._id} colorClass="text-purple-600 hover:bg-purple-50">
                  {printingId === s._id
                    ? <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-purple-600" />
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  }
                </IconBtn>
                <IconBtn title="Delete" onClick={() => handleDelete(s._id)} disabled={deletingId === s._id} colorClass="text-red-500 hover:bg-red-50">
                  {deletingId === s._id
                    ? <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-red-500" />
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  }
                </IconBtn>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Desktop table (>= md) ── */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-200">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked; }}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 accent-[#1E3A8A] cursor-pointer"
                  />
                </th>
                {["#", "Invoice", "Customer", "Total", "Paid", "Due", "Status", "Date", "Actions"].map((h, i) => (
                  <th key={h} className={`text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 ${i === 8 ? "text-center" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-7 w-7 border-2 border-gray-200 border-t-[#1E3A8A]" />
                      <p className="text-xs text-gray-400">Loading…</p>
                    </div>
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-gray-600">No invoices found</p>
                      <p className="text-xs text-gray-400">Adjust your filters or create a new invoice</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sales.map((s, idx) => (
                  <tr
                    key={s._id}
                    className={`transition-colors ${
                      selectedIds.has(s._id) ? "bg-blue-50/70" : "hover:bg-gray-50/70"
                    }`}
                  >
                    <td className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(s._id)}
                        onChange={() => toggleOne(s._id)}
                        className="h-4 w-4 rounded border-gray-300 accent-[#1E3A8A] cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono font-bold text-gray-800">{s.invoiceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-40 truncate">{s.customerName}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">৳{s.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">৳{s.paidAmount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600">৳{s.dueAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[s.status] || "bg-gray-100 text-gray-600"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5">
                        <Link href={`/dashboard/sales/${s._id}`}>
                          <IconBtn title="View" colorClass="text-[#1E3A8A] hover:bg-blue-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </IconBtn>
                        </Link>
                        <Link href={`/dashboard/sales/${s._id}/edit`}>
                          <IconBtn title="Edit" colorClass="text-green-600 hover:bg-green-50">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </IconBtn>
                        </Link>
                        <IconBtn title="Print" onClick={() => handlePrint(s._id)} disabled={printingId === s._id} colorClass="text-purple-600 hover:bg-purple-50">
                          {printingId === s._id
                            ? <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-purple-600" />
                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                          }
                        </IconBtn>
                        <IconBtn title="Download PDF" onClick={() => handlePrint(s._id)} disabled={printingId === s._id} colorClass="text-orange-500 hover:bg-orange-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6" /></svg>
                        </IconBtn>
                        <IconBtn title="Delete" onClick={() => handleDelete(s._id)} disabled={deletingId === s._id} colorClass="text-red-500 hover:bg-red-50">
                          {deletingId === s._id
                            ? <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-red-500" />
                            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          }
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
      {/* ── Delete by Date Modal ── */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Delete Invoices by Date</h3>
              <p className="text-sm text-gray-600 mb-6">SELECT THE TIME PERIOD FOR INVOICES TO DELETE</p>
              <div className="space-y-3">
                <button
                  onClick={() => handleBulkDeleteByDate("10")}
                  disabled={bulkDeleteByDateDeleting}
                  className="w-full px-4 py-3 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Delete Last 10 Days
                </button>
                <button
                  onClick={() => handleBulkDeleteByDate("30")}
                  disabled={bulkDeleteByDateDeleting}
                  className="w-full px-4 py-3 border border-red-300 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Delete Last 30 Days
                </button>
                <button
                  onClick={() => handleBulkDeleteByDate("all")}
                  disabled={bulkDeleteByDateDeleting}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Delete All Invoices
                </button>
              </div>
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={bulkDeleteByDateDeleting}
                className="w-full mt-4 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InvoiceListPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <InvoiceListContent />
    </Suspense>
  );
}
