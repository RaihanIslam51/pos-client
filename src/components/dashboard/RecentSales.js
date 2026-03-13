"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

export default function RecentSales({ sales = [] }) {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">{t("Recent Sales")}</h3>
        <Link
          href="/dashboard/sales"
          className="text-sm text-[#1E3A8A] hover:underline font-medium"
        >
          {t("View all")}
        </Link>
      </div>
      <div className="overflow-x-auto">
        {sales.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
            <p className="text-sm">{t("No sales yet today")}</p>
          </div>
        ) : (
          <table className="w-full min-w-120">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 lg:px-6 py-3">{t("Invoice")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 lg:px-4 py-3 hidden sm:table-cell">{t("Customer")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 lg:px-4 py-3">{t("Amount")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 lg:px-4 py-3 hidden md:table-cell">{t("Payment")}</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 lg:px-4 py-3">{t("Status")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 lg:px-6 py-3 text-sm font-medium text-[#1E3A8A] whitespace-nowrap">{sale.invoiceNumber}</td>
                  <td className="px-3 lg:px-4 py-3 text-sm text-gray-700 hidden sm:table-cell">{sale.customerName}</td>
                  <td className="px-3 lg:px-4 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">৳{sale.totalAmount?.toFixed(2)}</td>
                  <td className="px-3 lg:px-4 py-3 text-sm text-gray-600 capitalize hidden md:table-cell">{sale.paymentMethod}</td>
                  <td className="px-3 lg:px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      sale.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : sale.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
