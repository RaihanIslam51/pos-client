"use client";
import { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const STATUS_COLORS = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  hold: "bg-blue-100 text-blue-700",
  instalment: "bg-purple-100 text-purple-700",
};

function SaleViewContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSale(id)
      .then((r) => { setSale(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (sale && searchParams.get("print") === "1") {
      setTimeout(() => window.print(), 600);
    }
  }, [sale, searchParams]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-[#1E3A8A]" />
    </div>
  );
  if (!sale) return (
    <div className="text-center py-20 text-gray-400">Sale not found</div>
  );

  return (
    <div>
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

      {/* ── Action bar ── */}
      <div className="no-print flex items-center justify-between mb-5">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1E3A8A] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex gap-2">
          <Link href={`/dashboard/sales/${id}/edit`}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </Link>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-lg text-sm font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print / PDF
          </button>
        </div>
      </div>

      {/* ── Invoice card ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-2xl mx-auto shadow-sm">

        {/* Header */}
        <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-[#1E3A8A]">INVOICE</h1>
            <p className="text-gray-500 text-sm mt-0.5 font-mono">{sale.invoiceNumber}</p>
          </div>
          <div className="text-right text-sm">
            <p className="text-gray-600">{new Date(sale.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[sale.status] || "bg-gray-100 text-gray-600"}`}>
              {sale.status}
            </span>
          </div>
        </div>

        {/* Customer + Payment */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Customer</p>
            <p className="font-medium text-gray-800">{sale.customerName}</p>
            {sale.customer?.phone && <p className="text-gray-500 text-xs mt-0.5">{sale.customer.phone}</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Payment Method</p>
            <p className="font-medium text-gray-800 capitalize">{sale.paymentMethod}</p>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-[#1E3A8A]">
              <th className="text-left py-2 text-xs font-semibold text-[#1E3A8A]">#</th>
              <th className="text-left py-2 text-xs font-semibold text-[#1E3A8A]">Item</th>
              <th className="text-center py-2 text-xs font-semibold text-[#1E3A8A]">Qty</th>
              <th className="text-right py-2 text-xs font-semibold text-[#1E3A8A]">Unit Price</th>
              <th className="text-right py-2 text-xs font-semibold text-[#1E3A8A]">Disc</th>
              <th className="text-right py-2 text-xs font-semibold text-[#1E3A8A]">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((it, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-2.5 text-gray-500">{i + 1}</td>
                <td className="py-2.5 font-medium text-gray-800">{it.productName}</td>
                <td className="py-2.5 text-center text-gray-700">{it.quantity}</td>
                <td className="py-2.5 text-right text-gray-700">৳{it.unitPrice.toFixed(2)}</td>
                <td className="py-2.5 text-right text-gray-500">৳{it.discount.toFixed(2)}</td>
                <td className="py-2.5 text-right font-semibold text-gray-800">৳{it.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-56 text-sm space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>৳{sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discountAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span className="text-red-500">-৳{sale.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {sale.taxAmount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>৳{sale.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-gray-300 pt-2 font-bold text-[#1E3A8A] text-base">
              <span>Total</span>
              <span>৳{sale.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600 font-medium">
              <span>Paid</span>
              <span>৳{sale.paidAmount.toFixed(2)}</span>
            </div>
            {sale.dueAmount > 0 && (
              <div className="flex justify-between text-red-500 font-semibold">
                <span>Due</span>
                <span>৳{sale.dueAmount.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {sale.notes && (
          <p className="mt-6 pt-4 border-t border-gray-100 text-sm text-gray-500 italic">
            Notes: {sale.notes}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SaleViewPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-[#1E3A8A]" />
      </div>
    }>
      <SaleViewContent />
    </Suspense>
  );
}
