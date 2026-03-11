"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

function CreateWarrantyContent() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [products,  setProducts]  = useState([]);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");

  const [form, setForm] = useState({
    customerName:  "",
    customerPhone: "",
    customerId:    "",
    saleInvoice:   "",
    productId:     "",
    productName:   "",
    serialNumber:  "",
    warrantyPeriod: "",
    purchaseDate:  "",
    status:        "pending",
    description:   "",
  });

  // Auto-calculate dayPassed from purchaseDate
  const dayPassed = (() => {
    if (!form.purchaseDate) return "";
    const diff = new Date() - new Date(form.purchaseDate);
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  })();

  useEffect(() => {
    Promise.all([api.getCustomers(), api.getProducts()]).then(([c, p]) => {
      setCustomers(c.data || []);
      setProducts(p.data || []);
    }).catch(() => {});
  }, []);

  const handleCustomerSelect = (id) => {
    const c = customers.find((x) => x._id === id);
    if (c) {
      setForm((f) => ({ ...f, customerId: id, customerName: c.name, customerPhone: c.phone || "" }));
    } else {
      setForm((f) => ({ ...f, customerId: "", customerName: "", customerPhone: "" }));
    }
  };

  const handleProductSelect = (id) => {
    const p = products.find((x) => x._id === id);
    setForm((f) => ({ ...f, productId: id, productName: p?.name || "" }));
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.productName)    { setError("Item name is required"); return; }
    if (!form.purchaseDate)   { setError("Purchase date is required"); return; }
    if (!form.warrantyPeriod) { setError("Warranty days is required"); return; }
    setSaving(true); setError("");
    try {
      await api.createWarranty({
        customer:      form.customerId || null,
        customerName:  form.customerName,
        customerPhone: form.customerPhone,
        product:       form.productId || null,
        productName:   form.productName,
        saleInvoice:   form.saleInvoice,
        serialNumber:  form.serialNumber,
        purchaseDate:  form.purchaseDate,
        warrantyPeriod: parseInt(form.warrantyPeriod) || 0,
        dayPassed,
        status:        form.status,
        description:   form.description,
      });
      router.push("/dashboard/warranty/list");
    } catch (err) {
      setError(err.message || "Failed to create warranty");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-[#1E3A8A] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/dashboard/warranty/list" className="hover:text-[#1E3A8A] transition-colors">Warranty</Link>
        <span>/</span>
        <span className="text-[#1E3A8A] font-semibold">Information</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

        {/* Card header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-[#1E3A8A]">Warranty Claim Add</h2>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Customer Name<span className="text-red-500">*</span> :
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.customerId}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    className="w-28 border border-gray-200 rounded-lg px-2 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] shrink-0"
                  >
                    <option value="">Select</option>
                    {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <input
                    required
                    type="text"
                    value={form.customerName}
                    onChange={set("customerName")}
                    placeholder="Customer Name"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Mobile number<span className="text-red-500">*</span> :
                </label>
                <input
                  required
                  type="text"
                  value={form.customerPhone}
                  onChange={set("customerPhone")}
                  placeholder="Mobile number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* Sell Invoice ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Sell Invoice id<span className="text-red-500">*</span> :
                </label>
                <input
                  required
                  type="text"
                  value={form.saleInvoice}
                  onChange={set("saleInvoice")}
                  placeholder="e.g. INV-00001"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* Item ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Item id<span className="text-red-500">*</span> :
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.productId}
                    onChange={(e) => handleProductSelect(e.target.value)}
                    className="w-28 border border-gray-200 rounded-lg px-2 py-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] shrink-0"
                  >
                    <option value="">Select</option>
                    {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                  <input
                    required
                    type="text"
                    value={form.productName}
                    onChange={set("productName")}
                    placeholder="Item name"
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>

              {/* Sl No */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Sl No<span className="text-red-500">*</span> :
                </label>
                <input
                  required
                  type="text"
                  value={form.serialNumber}
                  onChange={set("serialNumber")}
                  placeholder="Serial Number"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* Wty day */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Wty day<span className="text-red-500">*</span> :
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  value={form.warrantyPeriod}
                  onChange={set("warrantyPeriod")}
                  placeholder="Warranty days"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* Purchase Date (hidden label, needed for Day Passed calc) */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Purchase Date<span className="text-red-500">*</span> :
                </label>
                <input
                  required
                  type="date"
                  value={form.purchaseDate}
                  onChange={set("purchaseDate")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
              </div>

              {/* Day Passed (auto-calculated) */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Day Passed<span className="text-red-500">*</span> :
                </label>
                <input
                  readOnly
                  type="text"
                  value={dayPassed === "" ? "" : `${dayPassed} day${dayPassed !== 1 ? "s" : ""}`}
                  placeholder="Auto-calculated"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-600 cursor-default"
                />
              </div>

              {/* Customer ID */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Customer ID<span className="text-red-500">*</span> :
                </label>
                <input
                  readOnly
                  type="text"
                  value={form.customerId}
                  placeholder="Auto-filled on customer select"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-600 font-mono cursor-default"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status :</label>
                <select
                  value={form.status}
                  onChange={set("status")}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="claimed">Claimed</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes :</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Notes..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none"
                />
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <Link
                href="/dashboard/warranty/list"
                className="px-6 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-8 bg-[#1E3A8A] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CreateWarrantyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <CreateWarrantyContent />
    </Suspense>
  );
}

