"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

export default function SupplierViewPage() {
  const { id } = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSupplier(id)
      .then((r) => { setSupplier(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-[#1E3A8A]" />
    </div>
  );
  if (!supplier) return (
    <div className="text-center py-20 text-gray-400">Supplier not found</div>
  );

  const rows = [
    { label: "Supplier Name", value: supplier.name },
    { label: "Mobile", value: supplier.phone },
    { label: "Email", value: supplier.email || "—" },
    { label: "Address", value: supplier.address || "—" },
    { label: "State", value: supplier.state || "—" },
    { label: "GSTIN", value: supplier.gstin || "—" },
    { label: "Company", value: supplier.company || "—" },
    { label: "Initial Due", value: `৳${(supplier.dueAmount || 0).toFixed(2)}` },
    { label: "Total Supplied", value: `৳${(supplier.totalSupplied || 0).toFixed(2)}` },
    { label: "Added On", value: new Date(supplier.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) },
  ];

  return (
    <div className="space-y-4 max-w-2xl">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-[#1E3A8A] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/dashboard/suppliers/list" className="hover:text-[#1E3A8A] transition-colors">Supplier</Link>
        <span>/</span>
        <span className="text-[#1E3A8A] font-semibold">View</span>
      </div>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#1E3A8A] transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <Link href={`/dashboard/suppliers/${id}/edit`}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Edit
        </Link>
      </div>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {supplier.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1E3A8A]">{supplier.name}</h2>
            {supplier.company && <p className="text-sm text-gray-500">{supplier.company}</p>}
            <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
              supplier.isActive !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {supplier.isActive !== false ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Details grid */}
        <div className="divide-y divide-gray-100">
          {rows.map(({ label, value }) => (
            <div key={label} className="grid grid-cols-2 px-6 py-3 text-sm">
              <span className="text-gray-500 font-medium">{label}</span>
              <span className="text-gray-800 font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
