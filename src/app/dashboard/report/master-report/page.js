"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function MasterReportPage() {
  const [data, setData] = useState({ products: [], customers: [], suppliers: [], categories: [], brands: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("products");

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

  const tabs = ["products","customers","suppliers","categories","brands"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Master Report</h1>
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? "bg-blue-600 text-white" : "bg-white text-gray-700 border hover:bg-gray-50"}`}>
            {t} ({data[t].length})
          </button>
        ))}
      </div>
      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          {tab === "products" && (
            <table className="min-w-full text-sm">
              <thead><tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600">SKU</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Category</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Cost (৳)</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Price (৳)</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Stock</th>
              </tr></thead>
              <tbody>{data.products.map((p, i) => (
                <tr key={p._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i+1}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{p.sku || "—"}</td>
                  <td className="px-4 py-3">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3">৳{p.costPrice?.toLocaleString()}</td>
                  <td className="px-4 py-3 text-blue-700 font-semibold">৳{p.sellingPrice?.toLocaleString()}</td>
                  <td className="px-4 py-3">{p.stock ?? 0}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
          {tab === "customers" && (
            <table className="min-w-full text-sm">
              <thead><tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Phone</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Address</th>
              </tr></thead>
              <tbody>{data.customers.map((c, i) => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i+1}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.phone || "—"}</td>
                  <td className="px-4 py-3">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.address || "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
          {tab === "suppliers" && (
            <table className="min-w-full text-sm">
              <thead><tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Phone</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Company</th>
              </tr></thead>
              <tbody>{data.suppliers.map((s, i) => (
                <tr key={s._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i+1}</td>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3">{s.phone || "—"}</td>
                  <td className="px-4 py-3">{s.email || "—"}</td>
                  <td className="px-4 py-3">{s.company || "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
          {tab === "categories" && (
            <table className="min-w-full text-sm">
              <thead><tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Category Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Description</th>
              </tr></thead>
              <tbody>{data.categories.map((c, i) => (
                <tr key={c._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i+1}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500">{c.description || "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
          {tab === "brands" && (
            <table className="min-w-full text-sm">
              <thead><tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">#</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Brand Name</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Description</th>
              </tr></thead>
              <tbody>{data.brands.map((b, i) => (
                <tr key={b._id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">{i+1}</td>
                  <td className="px-4 py-3 font-medium">{b.name}</td>
                  <td className="px-4 py-3 text-gray-500">{b.description || "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
