"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function ProductAdjustmentPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    product: "",
    type: "addition",
    quantity: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProducts().then((r) => setProducts(r.data)),
      api.getInventoryLogs("?type=adjustment").then((r) => setRecentLogs(r.data)).catch(() => {}),
    ]).catch(() => {}).finally(() => { setLoading(false); setLogsLoading(false); });
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  const selected = products.find((p) => p._id === form.product);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product || !form.quantity) return;
    setSaving(true);
    try {
      const currentStock = selected?.stock || 0;
      const qty = Number(form.quantity);
      const newStock = form.type === "addition" ? currentStock + qty : Math.max(0, currentStock - qty);

      await api.adjustStock({
        product: form.product,
        quantity: newStock,
        note: `${form.type === "addition" ? "+" : "-"}${qty} — ${form.note || "Manual adjustment"}`,
      });

      // Refresh
      const [r1, r2] = await Promise.all([
        api.getProducts(),
        api.getInventoryLogs("?type=adjustment"),
      ]);
      setProducts(r1.data);
      setRecentLogs(r2.data);
      setForm({ product: "", type: "addition", quantity: "", note: "" });
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Product Adjustment</h2>
        <p className="text-sm text-gray-400">Manually add or deduct product stock quantities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Adjustment Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-5">Stock Adjustment Form</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Search */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Product <span className="text-red-500">*</span>
              </label>
              <div className="relative mb-2">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product..." className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
                <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {search && (
                <div className="border border-gray-200 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
                  {filtered.slice(0, 10).map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => { setForm({ ...form, product: p._id }); setSearch(""); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex justify-between items-center ${form.product === p._id ? "bg-blue-50" : ""}`}
                    >
                      <span className="font-medium text-gray-800 truncate">{p.name}</span>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">Stock: {p.stock}</span>
                    </button>
                  ))}
                </div>
              )}
              {selected && (
                <div className="mt-2 flex items-center justify-between bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                  <div>
                    <p className="text-sm font-semibold text-[#1E3A8A]">{selected.name}</p>
                    <p className="text-xs text-blue-500">Current Stock: <b>{selected.stock}</b> {selected.unit}</p>
                  </div>
                  <button type="button" onClick={() => setForm({ ...form, product: "" })} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Adjustment Type</label>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {[
                  { value: "addition", label: "+ Addition", cls: "text-green-700" },
                  { value: "deduction", label: "− Deduction", cls: "text-red-600" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, type: opt.value })}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                      form.type === opt.value
                        ? opt.value === "addition"
                          ? "bg-green-600 text-white"
                          : "bg-red-500 text-white"
                        : `bg-white ${opt.cls} hover:bg-gray-50`
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="Enter quantity"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
              {selected && form.quantity && (
                <p className="text-xs mt-1 font-medium text-gray-500">
                  New stock will be:{" "}
                  <span className={`font-bold ${form.type === "addition" ? "text-green-600" : "text-red-600"}`}>
                    {form.type === "addition"
                      ? (selected.stock || 0) + Number(form.quantity)
                      : Math.max(0, (selected.stock || 0) - Number(form.quantity))
                    } {selected.unit}
                  </span>
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Note</label>
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows={2}
                placeholder="Reason for adjustment (optional)"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !form.product || !form.quantity}
              className="w-full bg-[#1E3A8A] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Applying..." : "Apply Adjustment"}
            </button>
          </form>
        </div>

        {/* Recent Adjustments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-700">Recent Adjustments</h3>
          </div>
          <div className="overflow-y-auto max-h-[500px]">
            {logsLoading ? (
              <div className="text-center py-10"><div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]" /></div>
            ) : recentLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                <p className="text-4xl mb-2">📝</p>
                <p>No adjustments yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2.5">Product</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2.5">From → To</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2.5">Date</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2.5">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentLogs.slice(0, 20).map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-800">{log.product?.name || "—"}</td>
                      <td className="px-4 py-2.5 text-sm">
                        <span className="text-gray-500">{log.previousStock}</span>
                        <span className="text-gray-400 mx-1">→</span>
                        <span className="font-semibold text-[#1E3A8A]">{log.currentStock}</span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleDateString("en-BD", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[150px] truncate">{log.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
