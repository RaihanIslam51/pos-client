"use client";
import { showError, showSuccess, showWarning } from "@/lib/swal";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

function InventoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Active tab synced to URL: logs | low-stock | purchase-history
  const activeTab = searchParams.get("tab") || "logs";

  const [logs, setLogs] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({ product: "", supplier: "", quantity: "", unitCost: "", note: "" });
  const [adjustForm, setAdjustForm] = useState({ product: "", quantity: "", note: "" });
  const [saving, setSaving] = useState(false);

  const setTab = (tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, lowRes, prodRes, supRes] = await Promise.all([
        api.getInventoryLogs(),
        api.getLowStock(),
        api.getProducts(),
        api.getSuppliers(),
      ]);
      setLogs(logsRes.data);
      setLowStock(lowRes.data);
      setProducts(prodRes.data);
      setSuppliers(supRes.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handlePurchase = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.purchaseStock({
        ...purchaseForm,
        quantity: Number(purchaseForm.quantity),
        unitCost: Number(purchaseForm.unitCost) || undefined,
      });
      setShowPurchaseModal(false);
      setPurchaseForm({ product: "", supplier: "", quantity: "", unitCost: "", note: "" });
      fetchAll();
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.adjustStock({
        ...adjustForm,
        quantity: Number(adjustForm.quantity),
      });
      setShowAdjustModal(false);
      setAdjustForm({ product: "", quantity: "", note: "" });
      fetchAll();
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "logs", label: "Stock Logs", count: logs.length },
    { id: "low-stock", label: "Low Stock", count: lowStock.length, alert: lowStock.length > 0 },
  ];

  const typeColors = {
    purchase: "bg-green-100 text-green-700",
    sale: "bg-blue-100 text-blue-700",
    adjustment: "bg-orange-100 text-orange-700",
    return: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-[#1E3A8A] shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab.alert ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="border border-[#1E3A8A] text-[#1E3A8A] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            Adjust Stock
          </button>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            + Purchase Stock
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div>
        </div>
      ) : (
        <>
          {/* Stock Logs Tab */}
          {activeTab === "logs" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Product</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Type</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Qty Change</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">After Stock</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Supplier</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Note</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {logs.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                        <p className="text-3xl mb-2">📋</p>No inventory logs yet
                      </td></tr>
                    ) : (
                      logs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 text-sm font-medium text-gray-800">{log.product?.name || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeColors[log.type] || "bg-gray-100 text-gray-600"}`}>
                              {log.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${log.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                              {log.quantity > 0 ? "+" : ""}{log.quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{log.stockAfter}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{log.supplier?.name || "—"}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{log.note || "—"}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">
                            {new Date(log.createdAt).toLocaleDateString("en-BD", { day: "2-digit", month: "short" })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Low Stock Tab */}
          {activeTab === "low-stock" && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Product</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Category</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Current Stock</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Alert Level</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lowStock.length === 0 ? (
                      <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                        <p className="text-3xl mb-2">✅</p>All products are well stocked!
                      </td></tr>
                    ) : (
                      lowStock.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 text-sm font-semibold text-gray-800">{p.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.category?.name || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${p.stock === 0 ? "text-red-600" : "text-orange-600"}`}>
                              {p.stock} {p.unit}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.alertQuantity} {p.unit}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.stock === 0 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                              {p.stock === 0 ? "Out of Stock" : "Low Stock"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => { setPurchaseForm({ ...purchaseForm, product: p._id }); setShowPurchaseModal(true); }}
                              className="text-[#1E3A8A] hover:underline text-xs font-medium"
                            >
                              Restock
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Purchase Stock Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1E3A8A]">Purchase Stock</h2>
              <button onClick={() => setShowPurchaseModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handlePurchase} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Product *</label>
                <select required value={purchaseForm.product} onChange={(e) => setPurchaseForm({ ...purchaseForm, product: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white">
                  <option value="">Select product</option>
                  {products.map((p) => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Supplier</label>
                <select value={purchaseForm.supplier} onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white">
                  <option value="">No supplier</option>
                  {suppliers.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Quantity *</label>
                  <input required type="number" min="1" value={purchaseForm.quantity} onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Unit Cost</label>
                  <input type="number" min="0" step="0.01" value={purchaseForm.unitCost} onChange={(e) => setPurchaseForm({ ...purchaseForm, unitCost: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Note</label>
                <input value={purchaseForm.note} onChange={(e) => setPurchaseForm({ ...purchaseForm, note: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" placeholder="Optional" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowPurchaseModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#1E3A8A] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50">
                  {saving ? "Saving..." : "Purchase"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#1E3A8A]">Adjust Stock</h2>
              <button onClick={() => setShowAdjustModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleAdjust} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600">Product *</label>
                <select required value={adjustForm.product} onChange={(e) => setAdjustForm({ ...adjustForm, product: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white">
                  <option value="">Select product</option>
                  {products.map((p) => <option key={p._id} value={p._id}>{p.name} (Stock: {p.stock})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Quantity Adjustment *</label>
                <input required type="number" value={adjustForm.quantity} onChange={(e) => setAdjustForm({ ...adjustForm, quantity: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" placeholder="Use negative for reduction e.g. -5" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Note *</label>
                <input required value={adjustForm.note} onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" placeholder="Reason for adjustment" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAdjustModal(false)} className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-[#1E3A8A] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50">
                  {saving ? "Saving..." : "Adjust"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4 animate-pulse">
        <div className="flex gap-2">
          <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 h-64"></div>
      </div>
    }>
      <InventoryContent />
    </Suspense>
  );
}
