"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ScatterChart, Scatter, ZAxis,
} from "recharts";

function useWindowSize() {
  const [w, setW] = useState(768);
  useEffect(() => {
    setW(window.innerWidth);
    let t;
    const handler = () => { clearTimeout(t); t = setTimeout(() => setW(window.innerWidth), 100); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return w;
}

const COLORS = ["#1E3A8A", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#F97316", "#84CC16"];
const fmtK = (v) => v >= 1000 ? `৳${(v / 1000).toFixed(1)}k` : `৳${v}`;

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow">
      <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
        <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </div>
  );
}

export default function ItemReportPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 640;
  const chartH = isMobile ? 200 : 260;
  const yAxisW = isMobile ? 48 : 60;

  useEffect(() => {
    api.getProducts().then((res) => setProducts(res.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  // Top 10 by stock value
  const topByValue = [...filtered]
    .map((p) => ({ name: p.name, value: (p.stock || 0) * (p.costPrice || 0) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Top 10 by stock units
  const topByStock = [...filtered]
    .map((p) => ({ name: p.name, stock: p.stock || 0 }))
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 10);

  const totalValue = filtered.reduce((s, p) => s + (p.stock || 0) * (p.costPrice || 0), 0);
  const totalItems = filtered.reduce((s, p) => s + (p.stock || 0), 0);
  const lowStock = filtered.filter((p) => (p.stock || 0) <= (p.alertQuantity || 5)).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Item Report</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or SKU..."
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-gray-500">Total Items</p>
          <p className="text-xl font-bold text-blue-700">{filtered.length}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs text-gray-500">Total Stock</p>
          <p className="text-xl font-bold text-green-700">{totalItems.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-xs text-gray-500">Stock Value</p>
          <p className="text-xl font-bold text-purple-700">৳{totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <p className="text-xs text-gray-500">Low Stock</p>
          <p className="text-xl font-bold text-yellow-700">{lowStock}</p>
        </div>
      </div>

      {/* Charts */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ChartCard title="Top Items by Stock Value">
            <div className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={chartH}>
                <BarChart data={topByValue} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={isMobile ? 60 : 80} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, "Stock Value"]} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {topByValue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Top Items by Stock Units">
            <div className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={chartH}>
                <BarChart data={topByStock} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={isMobile ? 60 : 80} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v) => [v, "Units"]} />
                  <Bar dataKey="stock" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-700 text-sm">Item List ({filtered.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left border-b">
                <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Item Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">SKU</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Brand</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Unit</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Cost (৳)</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Price (৳)</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No items found</td></tr>
              ) : filtered.map((p, i) => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-500 hidden md:table-cell">{p.sku || "—"}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3 hidden md:table-cell">{p.brand?.name || "—"}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">{p.unit?.name || "—"}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">৳{p.costPrice?.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-blue-700">৳{p.sellingPrice?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${(p.stock || 0) <= (p.alertQuantity || 5) ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {p.stock ?? 0}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

