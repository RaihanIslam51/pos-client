"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell,
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

const COLORS = ["#1E3A8A", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];

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

export default function MasterReportPage() {
  const [data, setData] = useState({ products: [], customers: [], suppliers: [], categories: [], brands: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("products");
  const windowWidth = useWindowSize();
  const isMobile = windowWidth < 640;
  const chartH = isMobile ? 180 : 220;

  useEffect(() => {
    Promise.all([
      api.getProducts(),
      api.getCustomers(),
      api.getSuppliers(),
      api.getCategories(),
      api.getBrands(),
    ]).then(([p, c, s, cat, b]) => {
      setData({ products: p.data || [], customers: c.data || [], suppliers: s.data || [], categories: cat.data || [], brands: b.data || [] });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const tabs = ["products", "customers", "suppliers", "categories", "brands"];
  const tabLabels = { products: "Products", customers: "Customers", suppliers: "Suppliers", categories: "Categories", brands: "Brands" };

  // Summary data for overview chart
  const summaryData = [
    { name: "Products", count: data.products.length, fill: "#1E3A8A" },
    { name: "Customers", count: data.customers.length, fill: "#10B981" },
    { name: "Suppliers", count: data.suppliers.length, fill: "#F59E0B" },
    { name: "Categories", count: data.categories.length, fill: "#8B5CF6" },
    { name: "Brands", count: data.brands.length, fill: "#06B6D4" },
  ];

  // Category stock chart
  const catStockData = data.categories.slice(0, 8).map((cat) => ({
    name: cat.name,
    products: data.products.filter((p) => p.category?._id === cat._id || p.category === cat._id).length,
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Master Report</h1>

      {/* Overview Charts */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ChartCard title="Database Overview">
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={summaryData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: isMobile ? 9 : 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [v, "Count"]} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {summaryData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Products per Category">
            <ResponsiveContainer width="100%" height={chartH}>
              <BarChart data={catStockData} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [v, "Products"]} />
                <Bar dataKey="products" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium touch-manipulation ${
              tab === t ? "bg-blue-600 text-white" : "bg-white text-gray-700 border hover:bg-gray-50"
            }`}
          >
            {tabLabels[t]} ({data[t].length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            {tab === "products" && (
              <table className="min-w-full text-sm">
                <thead><tr className="bg-gray-50 text-left border-b">
                  <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">SKU</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Category</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Cost (৳)</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Price (৳)</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
                </tr></thead>
                <tbody>{data.products.map((p, i) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-gray-500 hidden md:table-cell">{p.sku || "—"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">৳{p.costPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-blue-700 font-semibold">৳{p.sellingPrice?.toLocaleString()}</td>
                    <td className="px-4 py-3">{p.stock ?? 0}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
            {tab === "customers" && (
              <table className="min-w-full text-sm">
                <thead><tr className="bg-gray-50 text-left border-b">
                  <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Phone</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Address</th>
                </tr></thead>
                <tbody>{data.customers.map((c, i) => (
                  <tr key={c._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3">{c.phone || "—"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{c.email || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{c.address || "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
            {tab === "suppliers" && (
              <table className="min-w-full text-sm">
                <thead><tr className="bg-gray-50 text-left border-b">
                  <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Phone</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Company</th>
                </tr></thead>
                <tbody>{data.suppliers.map((s, i) => (
                  <tr key={s._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3">{s.phone || "—"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{s.email || "—"}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{s.company || "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
            {tab === "categories" && (
              <table className="min-w-full text-sm">
                <thead><tr className="bg-gray-50 text-left border-b">
                  <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Category Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Description</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Products</th>
                </tr></thead>
                <tbody>{data.categories.map((c, i) => (
                  <tr key={c._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{c.description || "—"}</td>
                    <td className="px-4 py-3">{data.products.filter((p) => p.category?._id === c._id || p.category === c._id).length}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
            {tab === "brands" && (
              <table className="min-w-full text-sm">
                <thead><tr className="bg-gray-50 text-left border-b">
                  <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Brand Name</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Description</th>
                  <th className="px-4 py-3 font-semibold text-gray-600">Products</th>
                </tr></thead>
                <tbody>{data.brands.map((b, i) => (
                  <tr key={b._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{b.name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{b.description || "—"}</td>
                    <td className="px-4 py-3">{data.products.filter((p) => p.brand?._id === b._id || p.brand === b._id).length}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
