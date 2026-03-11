"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const TAX_RATE = 0.15;

export default function TaxReportPage() {
  const [sales, setSales] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    Promise.all([api.getSales(), api.getPurchases()])
      .then(([sRes, pRes]) => { setSales(sRes.data || []); setPurchases(pRes.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const filtered = (arr) => arr.filter((r) => new Date(r.createdAt || r.purchaseDate).getFullYear() === Number(year));

  const filteredSales = filtered(sales).filter((s) => s.status !== "cancelled");
  const filteredPurchases = filtered(purchases);

  const totalSalesTax = filteredSales.reduce((sum, s) => sum + (s.taxAmount || s.totalAmount * TAX_RATE), 0);
  const totalPurchaseTax = filteredPurchases.reduce((sum, p) => sum + (p.taxAmount || (p.totalAmount || p.total || 0) * TAX_RATE), 0);
  const netTaxPayable = totalSalesTax - totalPurchaseTax;

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const byMonth = months.map((m, i) => {
    const mSales = filteredSales.filter((s) => new Date(s.createdAt).getMonth() === i);
    const mPurch = filteredPurchases.filter((p) => new Date(p.createdAt || p.purchaseDate).getMonth() === i);
    const salesTax = mSales.reduce((s, r) => s + (r.taxAmount || r.totalAmount * TAX_RATE), 0);
    const purchTax = mPurch.reduce((s, r) => s + (r.taxAmount || (r.totalAmount || r.total || 0) * TAX_RATE), 0);
    return { month: m, salesTax, purchTax, net: salesTax - purchTax };
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tax Report</h1>
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex gap-4 items-center">
        <label className="text-sm font-medium text-gray-700">Year:</label>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100"><p className="text-xs text-gray-500">Output Tax (Sales)</p><p className="text-2xl font-bold text-blue-700">৳{totalSalesTax.toFixed(2)}</p></div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100"><p className="text-xs text-gray-500">Input Tax (Purchases)</p><p className="text-2xl font-bold text-orange-600">৳{totalPurchaseTax.toFixed(2)}</p></div>
        <div className={`rounded-xl p-4 border ${netTaxPayable >= 0 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
          <p className="text-xs text-gray-500">Net Tax Payable</p>
          <p className={`text-2xl font-bold ${netTaxPayable >= 0 ? "text-red-600" : "text-green-700"}`}>৳{Math.abs(netTaxPayable).toFixed(2)}</p>
          <p className="text-xs text-gray-400">{netTaxPayable >= 0 ? "payable to govt" : "tax credit"}</p>
        </div>
      </div>
      {loading ? <p className="text-gray-400">Loading...</p> : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-3 font-semibold text-gray-600">Month</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Output Tax (৳)</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Input Tax (৳)</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Net Tax (৳)</th>
              </tr>
            </thead>
            <tbody>
              {byMonth.map((row) => (
                <tr key={row.month} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{row.month} {year}</td>
                  <td className="px-4 py-3 text-blue-600">৳{row.salesTax.toFixed(2)}</td>
                  <td className="px-4 py-3 text-orange-600">৳{row.purchTax.toFixed(2)}</td>
                  <td className={`px-4 py-3 font-semibold ${row.net >= 0 ? "text-red-600" : "text-green-600"}`}>৳{row.net.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
