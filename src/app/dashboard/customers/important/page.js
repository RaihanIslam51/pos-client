"use client";
import { showError, showSuccess, showWarning } from "@/lib/swal";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function ImportantCustomerContent() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const fetchImportant = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getImportantCustomers();
      setCustomers(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchImportant(); }, [fetchImportant]);

  const handleRemove = async (id) => {
    if (!confirm("Remove this customer from VIP list?")) return;
    setTogglingId(id);
    try {
      await api.toggleImportantCustomer(id);
      fetchImportant();
    } catch (err) {
      showError(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800">Important Customers</h2>
          <p className="text-xs text-gray-500 mt-0.5">VIP customers marked with a star ★</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-full">
            {customers.length} VIP
          </span>
          <Link href="/dashboard/customers/list"
            className="bg-[#1E3A8A] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-800 transition-colors">
            All Customers
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Mobile Cards */}
        <div className="block md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              <p className="text-3xl mb-2">⭐</p>No VIP customers yet
              <p className="mt-1 text-xs">Go to <Link href="/dashboard/customers/list" className="text-[#1E3A8A] underline">List Customers</Link> and click ★ to mark as VIP</p>
            </div>
          ) : (
            customers.map((c) => (
              <div key={c._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold text-gray-800 text-sm">{c.name}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{c.phone}{c.email ? ` • ${c.email}` : ""}</p>
                    {c.address && <p className="text-xs text-gray-400 mt-0.5">{c.address}</p>}
                    <div className="grid grid-cols-2 gap-x-4 mt-2">
                      <div>
                        <p className="text-[10px] text-gray-400">Total Purchase</p>
                        <p className="text-sm font-semibold text-gray-800">৳{(c.totalPurchase || 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Due</p>
                        <p className="text-sm font-semibold text-red-600">৳{(c.dueAmount || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(c._id)} disabled={togglingId === c._id}
                    className="text-yellow-500 hover:text-gray-400 text-xs font-medium hover:underline transition-colors shrink-0">
                    {togglingId === c._id ? "..." : "Remove VIP"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">#</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Name</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Phone</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Address</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Total Purchase</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Due</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-10">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]"></div>
                </td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                  <p className="text-3xl mb-2">⭐</p>No VIP customers yet
                  <p className="mt-1 text-xs">Go to <Link href="/dashboard/customers/list" className="text-[#1E3A8A] underline">List Customers</Link> and click ★ to mark as VIP</p>
                </td></tr>
              ) : (
                customers.map((c, idx) => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-yellow-400 text-sm">★</span>
                        <span className="text-sm font-medium text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.phone}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.email || "—"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.address || "—"}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-800">৳{(c.totalPurchase || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-red-600">৳{(c.dueAmount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleRemove(c._id)} disabled={togglingId === c._id}
                        className="text-yellow-500 hover:text-gray-400 text-xs font-medium hover:underline transition-colors">
                        {togglingId === c._id ? "..." : "Remove VIP"}
                      </button>
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

export default function ImportantCustomerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <ImportantCustomerContent />
    </Suspense>
  );
}
