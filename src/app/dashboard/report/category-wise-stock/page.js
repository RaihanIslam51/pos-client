"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, PieChart, Pie, Cell,
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

const PIE_COLORS = ["#1E3A8A","#10B981","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#F97316","#84CC16"];
const fmtK = (v) => v >= 1000 ? `৳${(v/1000).toFixed(1)}k` : `৳${v}`;

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

export default function CategoryWiseStockPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState("");
  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 640;
  const chartH = isMobile ? 200 : 260;
  const yAxisW = isMobile ? 48 : 60;

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([pRes, cRes]) => { setProducts(pRes.data || []); setCategories(cRes.data || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const categoryStats = categories.map((cat) => {
    const catProducts = products.filter((p) => p.category?._id === cat._id || p.category === cat._id);
    const totalStock = catProducts.reduce((s, p) => s + (p.stock || 0), 0);
    const stockValue = catProducts.reduce((s, p) => s + (p.stock || 0) * (p.costPrice || 0), 0);
    const lowStock = catProducts.filter((p) => (p.stock || 0) <= (p.alertQuantity || 5)).length;
    return { ...cat, productCount: catProducts.length, totalStock, stockValue, lowStock };
  });

  const filteredProducts = selectedCat
    ? products.filter((p) => p.category?._id === selectedCat || p.category === selectedCat)
    : products;

  const chartData = categoryStats
    .filter((c) => c.productCount > 0)
    .sort((a, b) => b.totalStock - a.totalStock)
    .slice(0, 10);

  const pieData = chartData.map((c) => ({ name: c.name, value: c.totalStock })).filter((d) => d.value > 0);
  const totalStockValue = products.reduce((s, p) => s + (p.stock || 0) * (p.costPrice || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Category Wise Stock</h1>
        <div className="text-sm text-gray-500">Total Stock Value: <span className="font-semibold text-blue-700">৳{totalStockValue.toLocaleString()}</span></div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* Category Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {categoryStats.map((cat) => (
              <div
                key={cat._id}
                onClick={() => setSelectedCat((prev) => prev === cat._id ? "" : cat._id)}
                className={`rounded-xl p-4 border cursor-pointer transition-all touch-manipulation ${
                  selectedCat === cat._id ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200 hover:border-blue-300"
                }`}
              >
                <p className={`text-sm font-semibold mb-1 truncate ${selectedCat === cat._id ? "text-white" : "text-gray-700"}`}>{cat.name}</p>
                <p className={`text-xs ${selectedCat === cat._id ? "text-blue-100" : "text-gray-500"}`}>{cat.productCount} products</p>
                <p className={`text-lg font-bold ${selectedCat === cat._id ? "text-white" : "text-blue-700"}`}>{cat.totalStock} units</p>
                {cat.lowStock > 0 && (
                  <p className={`text-xs mt-1 ${selectedCat === cat._id ? "text-yellow-200" : "text-yellow-600"}`}>{cat.lowStock} low stock</p>
                )}
              </div>
            ))}
          </div>

          {/* Charts */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <ChartCard title="Stock Units by Category">
                <ResponsiveContainer width="100%" height={chartH}>
                  <BarChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
                    <YAxis width={yAxisW - 10} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(v) => [v, "Stock Units"]} />
                    <Bar dataKey="totalStock" radius={[4, 4, 0, 0]}>
                      {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Stock Distribution">
                <ResponsiveContainer width="100%" height={chartH}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={isMobile ? 70 : 90}
                      dataKey="value"
                      label={({ name, percent }) => isMobile ? "" : `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [v, "Units"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-700 text-sm">
                {selectedCat ? `${categories.find((c) => c._id === selectedCat)?.name || ""} Products` : "All Products"}
              </span>
              <span className="text-gray-400 text-sm">({filteredProducts.length})</span>
              {selectedCat && (
                <button onClick={() => setSelectedCat("")} className="text-xs text-blue-600 hover:underline touch-manipulation">Clear filter</button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left border-b">
                    <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Product</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">SKU</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Alert</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Value (৳)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No products found</td></tr>
                  ) : filteredProducts.map((p, i) => (
                    <tr key={p._id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">{p.category?.name || "—"}</td>
                      <td className="px-4 py-3 font-mono text-gray-500 hidden md:table-cell">{p.sku || "—"}</td>
                      <td className="px-4 py-3 text-orange-600 hidden sm:table-cell">{p.alertQuantity || 5}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(p.stock || 0) === 0 ? "bg-red-100 text-red-700" : (p.stock || 0) <= (p.alertQuantity || 5) ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"}`}>
                          {p.stock ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-blue-700 font-semibold hidden sm:table-cell">৳{((p.stock || 0) * (p.costPrice || 0)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
