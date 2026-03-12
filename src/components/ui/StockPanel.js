"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

function StatusBadge({ stock, alertQty }) {
  if (stock === 0)
    return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-600 whitespace-nowrap">Out of Stock</span>;
  if (stock <= alertQty)
    return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-orange-100 text-orange-600 whitespace-nowrap">Low Stock</span>;
  return <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-600 whitespace-nowrap">In Stock</span>;
}

function StatCard({ label, value, color }) {
  const colors = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-200",   dot: "bg-blue-500" },
    red:    { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-200",    dot: "bg-red-500" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", dot: "bg-orange-500" },
    green:  { bg: "bg-green-50",  text: "text-green-600",  border: "border-green-200",  dot: "bg-green-500" },
  };
  const c = colors[color];
  return (
    <div className={`${c.bg} border ${c.border} rounded-xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3`}>
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${c.dot} opacity-20 flex items-center justify-center shrink-0`}>
        <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${c.dot} opacity-100 block`} />
      </div>
      <div>
        <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
        <p className={`text-xs font-medium ${c.text} leading-tight`}>{label}</p>
      </div>
    </div>
  );
}

export default function StockPanel({ onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all"); // all | out | low | ok

  useEffect(() => {
    api
      .getProducts()
      .then((r) => {
        const sorted = [...r.data].sort((a, b) => a.stock - b.stock);
        setProducts(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const outCount = products.filter((p) => p.stock === 0).length;
  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= p.alertQuantity).length;
  const okCount  = products.filter((p) => p.stock > p.alertQuantity).length;

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      (p.barcode || "").toLowerCase().includes(q) ||
      (p.category?.name || "").toLowerCase().includes(q);
    if (filter === "out") return matchSearch && p.stock === 0;
    if (filter === "low") return matchSearch && p.stock > 0 && p.stock <= p.alertQuantity;
    if (filter === "ok")  return matchSearch && p.stock > p.alertQuantity;
    return matchSearch;
  });

  const FILTERS = [
    { key: "all", label: `All (${products.length})` },
    { key: "out", label: `Out (${outCount})` },
    { key: "low", label: `Low (${lowCount})` },
    { key: "ok",  label: `OK (${okCount})` },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ── Page Header ── */}
      <div className="flex flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A8A]">Stock Overview</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            All products sorted by stock level · lowest to highest
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden xs:inline sm:inline">Back</span>
        </button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <StatCard label="Total Products" value={products.length} color="blue" />
        <StatCard label="Out of Stock"   value={outCount}        color="red" />
        <StatCard label="Low Stock"      value={lowCount}        color="orange" />
        <StatCard label="In Stock"       value={okCount}         color="green" />
      </div>

      {/* ── Search + Filter ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, barcode, category..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                filter === key
                  ? "bg-white text-[#1E3A8A] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table (sm+) / Card list (mobile) ── */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#1E3A8A]/20 border-t-[#1E3A8A] rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading products…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-400 text-sm">No products found</p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet — scrollable table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">#</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Product</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Category</th>
                    <th className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Barcode</th>
                    <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Alert Qty</th>
                    <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Stock</th>
                    <th className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const isOut = p.stock === 0;
                    const isLow = !isOut && p.stock <= p.alertQuantity;
                    return (
                      <tr
                        key={p._id}
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          isOut ? "bg-red-50/30" : isLow ? "bg-orange-50/30" : ""
                        }`}
                      >
                        <td className="px-5 py-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-1.5 h-8 rounded-full shrink-0 ${isOut ? "bg-red-400" : isLow ? "bg-orange-400" : "bg-green-400"}`} />
                            <div>
                              <p className="font-semibold text-gray-800">{p.name}</p>
                              {p.unit && <p className="text-xs text-gray-400">Unit: {p.unit}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-500">{p.category?.name || "—"}</td>
                        <td className="px-5 py-3 font-mono text-gray-500 text-xs">{p.barcode || "—"}</td>
                        <td className="px-5 py-3 text-center text-gray-500">{p.alertQuantity ?? "—"}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-base font-bold ${isOut ? "text-red-600" : isLow ? "text-orange-600" : "text-gray-800"}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <StatusBadge stock={p.stock} alertQty={p.alertQuantity} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile — card list */}
            <div className="sm:hidden divide-y divide-gray-100">
              {filtered.map((p, i) => {
                const isOut = p.stock === 0;
                const isLow = !isOut && p.stock <= p.alertQuantity;
                return (
                  <div
                    key={p._id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      isOut ? "bg-red-50/40" : isLow ? "bg-orange-50/40" : ""
                    }`}
                  >
                    {/* Status stripe */}
                    <div className={`w-1 self-stretch rounded-full shrink-0 ${isOut ? "bg-red-400" : isLow ? "bg-orange-400" : "bg-green-400"}`} />
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {[p.category?.name, p.barcode, p.unit ? `Unit: ${p.unit}` : null]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    {/* Stock + badge */}
                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className={`text-lg font-bold leading-none ${isOut ? "text-red-600" : isLow ? "text-orange-600" : "text-gray-800"}`}>
                        {p.stock}
                      </span>
                      <StatusBadge stock={p.stock} alertQty={p.alertQuantity} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!loading && filtered.length > 0 && (
          <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-400">
            Showing {filtered.length} of {products.length} products · sorted by stock ascending
          </div>
        )}
      </div>
    </div>
  );
}
