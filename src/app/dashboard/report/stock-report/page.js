"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, PieChart, Pie, Legend,
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

export default function StockReportPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 640;
  const chartH = isMobile ? 200 : 260;

  useEffect(() => {
    api.getProducts().then((res) => setProducts(res.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    if (filter === "low") return (p.stock ?? 0) <= (p.alertQuantity || 5) && (p.stock ?? 0) > 0;
    if (filter === "out") return (p.stock ?? 0) === 0;
    if (filter === "ok") return (p.stock ?? 0) > (p.alertQuantity || 5);
    return true;
  });

  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const totalValue = products.reduce((s, p) => s + (p.stock || 0) * (p.costPrice || 0), 0);
  const lowStockCount = products.filter((p) => (p.stock ?? 0) <= (p.alertQuantity || 5) && (p.stock ?? 0) > 0).length;
  const outOfStockCount = products.filter((p) => (p.stock ?? 0) === 0).length;
  const inStockCount = products.filter((p) => (p.stock ?? 0) > (p.alertQuantity || 5)).length;

  // Top 10 by stock value
  const topValueProducts = [...products]
    .map((p) => ({ name: p.name, value: (p.stock || 0) * (p.costPrice || 0) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Status pie
  const statusPie = [
    { name: "In Stock", value: inStockCount, fill: "#10B981" },
    { name: "Low Stock", value: lowStockCount, fill: "#F59E0B" },
    { name: "Out of Stock", value: outOfStockCount, fill: "#EF4444" },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Stock Report</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-gray-500">Total Products</p>
          <p className="text-xl font-bold text-blue-700">{products.length}</p>
        </div>
        <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
          <p className="text-xs text-gray-500">Total Units</p>
          <p className="text-xl font-bold text-purple-700">{totalStock.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <p className="text-xs text-gray-500">Low Stock</p>
          <p className="text-xl font-bold text-yellow-700">{lowStockCount}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-xs text-gray-500">Out of Stock</p>
          <p className="text-xl font-bold text-red-600">{outOfStockCount}</p>
        </div>
      </div>

      {/* Charts */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ChartCard title="Top 10 Products by Stock Value">
            <div className="overflow-x-auto">
              <ResponsiveContainer width="100%" height={chartH}>
                <BarChart data={topValueProducts} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={isMobile ? 60 : 90} tick={{ fontSize: 9 }} />
                  <Tooltip formatter={(v) => [`৳${v.toLocaleString()}`, "Stock Value"]} />
                  <Bar dataKey="value" fill="#1E3A8A" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Stock Status Distribution">
            <ResponsiveContainer width="100%" height={chartH}>
              <PieChart>
                <Pie
                  data={statusPie}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 70 : 90}
                  dataKey="value"
                  label={({ name, percent }) => isMobile ? "" : `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusPie.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-2 items-center">
        {["all", "ok", "low", "out"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium touch-manipulation ${
              filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "All" : f === "ok" ? "In Stock" : f === "low" ? "Low Stock" : "Out of Stock"}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500">Value: <span className="font-semibold text-blue-700">৳{totalValue.toLocaleString()}</span></span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-700 text-sm">Stock Details ({filtered.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left border-b">
                <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Product</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">SKU</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Alert</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Cost/Unit (৳)</th>
                <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Value (৳)</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No products found</td></tr>
              ) : filtered.map((p, i) => {
                const stock = p.stock ?? 0;
                const alert = p.alertQuantity || 5;
                const statusLabel = stock === 0 ? "Out of Stock" : stock <= alert ? "Low Stock" : "In Stock";
                const statusCls = stock === 0 ? "bg-red-100 text-red-700" : stock <= alert ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";
                return (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-gray-500 hidden md:table-cell">{p.sku || "—"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3 text-orange-600 hidden sm:table-cell">{alert}</td>
                    <td className="px-4 py-3 font-bold">{stock}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">৳{p.costPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700 hidden md:table-cell">৳{(stock * (p.costPrice || 0)).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCls}`}>{statusLabel}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
