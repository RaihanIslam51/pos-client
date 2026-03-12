"use client";
import { showError, showSuccess, showWarning, showConfirm } from "@/lib/swal";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

// ── Small icon button ──────────────────────────────────────────────────────────
function IconBtn({ title, onClick, colorClass, children, disabled }) {
  return (
    <button type="button" title={title} onClick={onClick} disabled={disabled}
      className={`p-1.5 rounded transition-colors disabled:opacity-40 ${colorClass}`}>
      {children}
    </button>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ paid, total }) {
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Paid ৳{paid.toFixed(2)}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[#1E3A8A] rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function InstalmentContent() {
  const [sales, setSales]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [expanded, setExpanded]     = useState(null);
  const [formMap, setFormMap]       = useState({});
  const [processingId, setProcessingId] = useState(null);
  const [successId, setSuccessId]   = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchInstalment = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getSales("?status=instalment");
      setSales(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInstalment(); }, [fetchInstalment]);

  const setForm = (id, key, value) =>
    setFormMap((m) => ({ ...m, [id]: { ...m[id], [key]: value } }));

  const handleAddInstalment = async (sale) => {
    const form = formMap[sale._id] || {};
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return showWarning("Enter a valid amount");
    if (amount > sale.dueAmount) return showWarning(`Amount exceeds due (৳${sale.dueAmount.toFixed(2)})`);
    setProcessingId(sale._id);
    try {
      await api.updateSale(sale._id, { instalment: { amount, note: form.note || "" } });
      setSuccessId(sale._id);
      setFormMap((m) => ({ ...m, [sale._id]: { amount: "", note: "" } }));
      setTimeout(() => setSuccessId(null), 2000);
      fetchInstalment();
    } catch (err) {
      showError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    const result = await showConfirm("Delete this invoice?");
    if (!result.isConfirmed) return;
    setDeletingId(id);
    try {
      await api.deleteSale(id);
      fetchInstalment();
    } catch (err) {
      showError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Summary stats
  const totalDue   = sales.reduce((s, x) => s + x.dueAmount, 0);
  const totalPaid  = sales.reduce((s, x) => s + x.paidAmount, 0);
  const totalValue = sales.reduce((s, x) => s + x.totalAmount, 0);

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#1E3A8A]">Instalment Invoices</h2>
          <p className="text-xs text-gray-500 mt-0.5">Track partial payments on credit invoices</p>
        </div>
        <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full self-start sm:self-auto">
          {sales.length} active
        </span>
      </div>

      {/* ── Summary Cards ── */}
      {!loading && sales.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "Total Invoice Value", value: totalValue, color: "text-[#1E3A8A]" },
            { label: "Total Collected",     value: totalPaid,  color: "text-green-600" },
            { label: "Total Outstanding",   value: totalDue,   color: "text-red-500"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm text-center">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-base font-bold ${color}`}>৳{value.toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#1E3A8A]" />
        </div>
      ) : sales.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-16 text-gray-400 text-sm">
          <p className="text-3xl mb-2">💳</p>
          No instalment invoices found
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((s, idx) => {
            const isOpen  = expanded === s._id;
            const form    = formMap[s._id] || {};
            const paidViaInstalments = s.instalments?.reduce((sum, i) => sum + i.amount, 0) || 0;

            return (
              <div key={s._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                {/* ── Row header ── */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xs text-gray-400 shrink-0 w-5">{idx + 1}</span>

                  {/* Main info — clickable to expand */}
                  <button className="flex-1 text-left min-w-0"
                    onClick={() => setExpanded(isOpen ? null : s._id)}>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                      <div className="min-w-0">
                        <p className="text-sm font-mono font-semibold text-gray-800 truncate">{s.invoiceNumber}</p>
                        <p className="text-xs text-gray-500 truncate">{s.customerName}</p>
                      </div>
                      <div className="flex gap-4 mt-1 sm:mt-0 text-xs">
                        <span className="text-gray-500">Total: <span className="font-semibold text-gray-800">৳{s.totalAmount.toFixed(2)}</span></span>
                        <span className="text-green-600">Paid: <span className="font-semibold">৳{s.paidAmount.toFixed(2)}</span></span>
                        <span className="text-red-500">Due: <span className="font-semibold">৳{s.dueAmount.toFixed(2)}</span></span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="mt-2">
                      <ProgressBar paid={s.paidAmount} total={s.totalAmount} />
                    </div>
                  </button>

                  {/* Action icons */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Link href={`/dashboard/sales/${s._id}`}>
                      <IconBtn title="View" colorClass="text-[#1E3A8A] hover:bg-blue-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </IconBtn>
                    </Link>
                    <Link href={`/dashboard/sales/${s._id}/edit`}>
                      <IconBtn title="Edit" colorClass="text-green-600 hover:bg-green-50">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </IconBtn>
                    </Link>
                    <IconBtn title="Print" colorClass="text-purple-600 hover:bg-purple-50"
                      onClick={() => window.open(`/dashboard/sales/${s._id}?print=1`, "_blank")}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                    </IconBtn>
                    <IconBtn title="Delete" colorClass="text-red-500 hover:bg-red-50"
                      disabled={deletingId === s._id}
                      onClick={() => handleDelete(s._id)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </IconBtn>
                    {/* Expand chevron */}
                    <button onClick={() => setExpanded(isOpen ? null : s._id)}
                      className="p-1.5 text-gray-400 hover:bg-gray-50 rounded transition-colors">
                      <svg className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* ── Expanded panel ── */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50 px-5 py-4 space-y-5">

                    {/* Payment history */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment History</h4>
                      {!s.instalments || s.instalments.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No instalment records yet.</p>
                      ) : (
                        <div className="space-y-1.5">
                          {s.instalments.map((inst, i) => (
                            <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[#1E3A8A] text-white text-xs font-bold shrink-0">{i + 1}</span>
                                <span className="font-semibold text-gray-800">৳{inst.amount.toFixed(2)}</span>
                                {inst.note && <span className="text-xs text-gray-400">— {inst.note}</span>}
                              </div>
                              <span className="text-xs text-gray-400">{new Date(inst.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center pt-1 text-xs text-gray-600">
                            <span>{s.instalments.length} payment{s.instalments.length !== 1 ? "s" : ""}</span>
                            <span className="font-semibold">Instalment total: ৳{paidViaInstalments.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Add payment form */}
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Add Payment</h4>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input type="number" min="0.01" step="0.01"
                          placeholder={`Amount (max ৳${s.dueAmount.toFixed(2)})`}
                          value={form.amount || ""}
                          onChange={(e) => setForm(s._id, "amount", e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-44 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] bg-white" />
                        <input type="text"
                          placeholder="Note (optional)"
                          value={form.note || ""}
                          onChange={(e) => setForm(s._id, "note", e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 outline-none focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] bg-white" />
                        {successId === s._id ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-semibold self-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Saved!
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAddInstalment(s)}
                            disabled={processingId === s._id}
                            className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-900 transition-colors disabled:opacity-60 shrink-0">
                            {processingId === s._id ? "Saving..." : "Save Payment"}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function InstalmentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]" />
      </div>
    }>
      <InstalmentContent />
    </Suspense>
  );
}

