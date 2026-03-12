"use client";
import { useState, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]";

function ToggleBtn({ value, onChange }) {
  return (
    <div className="flex">
      {["Yes", "No"].map((opt) => {
        const active = (opt === "Yes") === value;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt === "Yes")}
            className={`px-5 py-2 text-sm font-semibold border transition-colors first:rounded-l-lg last:rounded-r-lg ${
              active
                ? "bg-[#1E3A8A] text-white border-[#1E3A8A]"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ImageField({ label, name, preview, onFile }) {
  const ref = useRef();
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1">{label} :</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => ref.current.click()}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Choose File
        </button>
        <span className="text-xs text-gray-400">{preview ? preview : "No file chosen"}</span>
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files[0])} />
      </div>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={label} className="mt-2 h-16 rounded-lg border border-gray-200 object-cover" />
      )}
    </div>
  );
}

function CreateCustomerContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [form, setForm] = useState({
    name:         "",
    nameLine2:    "",
    initialDue:   "0",
    email:        "",
    phone:        "",
    address:      "",
    state:        "",
    gstin:        "",
    latitude:     "",
    longitude:    "",
    isWholesaler: false,
    dueAllowed:   false,
    barcode:      "",
    notes:        "",
    status:       "active",
  });
  const [shopImagePreview,     setShopImagePreview]     = useState("");
  const [customerImagePreview, setCustomerImagePreview] = useState("");

  const set  = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setB = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const toBase64 = (file) =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload  = () => res(reader.result);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const handleShopImage = async (file) => {
    if (!file) return;
    const b64 = await toBase64(file);
    setShopImagePreview(b64);
    setForm((f) => ({ ...f, shopImage: b64 }));
  };

  const handleCustomerImage = async (file) => {
    if (!file) return;
    const b64 = await toBase64(file);
    setCustomerImagePreview(b64);
    setForm((f) => ({ ...f, customerImage: b64 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.createCustomer({ ...form, initialDue: parseFloat(form.initialDue) || 0 });
      router.push("/dashboard/customers/list");
    } catch (err) {
      setError(err.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard" className="hover:text-[#1E3A8A] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/dashboard/customers/list" className="hover:text-[#1E3A8A] transition-colors">Customer</Link>
        <span>/</span>
        <span className="text-[#1E3A8A] font-semibold">Customer Add</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-bold text-[#1E3A8A]">Customer Add</h2>
          <p className="text-xs text-gray-400 mt-0.5">Customer Information</p>
        </div>

        <div className="p-4 sm:p-6">
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
                <input required type="text" value={form.name} onChange={set("name")}
                  placeholder="Customer Name" className={INPUT} />
              </div>

              {/* Customer Name 2nd Line */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Customer Name 2nd Line<span className="text-red-500">*</span> :
                </label>
                <input type="text" value={form.nameLine2} onChange={set("nameLine2")}
                  placeholder="Customer Name" className={INPUT} />
              </div>

              {/* Initial Due */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Initial Due<span className="text-red-500">*</span> :
                </label>
                <input required type="number" min="0" step="0.01" value={form.initialDue} onChange={set("initialDue")}
                  placeholder="0" className={INPUT} />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Email Address<span className="text-red-500">*</span> :
                </label>
                <input type="email" value={form.email} onChange={set("email")}
                  placeholder="customer@gmail.com" className={INPUT} />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Mobile number<span className="text-red-500">*</span> :
                </label>
                <input required type="text" value={form.phone} onChange={set("phone")}
                  placeholder="01XXXXXXXXX" className={INPUT} />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Address<span className="text-red-500">*</span> :
                </label>
                <input type="text" value={form.address} onChange={set("address")}
                  placeholder="Rajshahi" className={INPUT} />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  State<span className="text-red-500">*</span> :
                </label>
                <input type="text" value={form.state} onChange={set("state")}
                  placeholder="State" className={INPUT} />
              </div>

              {/* GSTIN */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">GSTIN :</label>
                <input type="text" value={form.gstin} onChange={set("gstin")}
                  placeholder="GSTIN" className={INPUT} />
              </div>

              {/* Latitude */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Latitude<span className="text-red-500">*</span> :
                </label>
                <input type="text" value={form.latitude} onChange={set("latitude")}
                  placeholder="Latitude" className={INPUT} />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Longitude<span className="text-red-500">*</span> :
                </label>
                <input type="text" value={form.longitude} onChange={set("longitude")}
                  placeholder="Longitude" className={INPUT} />
              </div>

              {/* Is Wholesaler */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Is wholesaler :</label>
                <ToggleBtn value={form.isWholesaler} onChange={setB("isWholesaler")} />
              </div>

              {/* Due Allowed */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Due Allowed :</label>
                <ToggleBtn value={form.dueAllowed} onChange={setB("dueAllowed")} />
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Barcode<span className="text-red-500">*</span> :
                </label>
                <input type="text" value={form.barcode} onChange={set("barcode")}
                  placeholder="Barcode" className={INPUT} />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status :</label>
                <select value={form.status} onChange={set("status")}
                  className={INPUT + " bg-white"}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Shop Image */}
              <div>
                <ImageField
                  label="Shop Image"
                  name="shopImage"
                  preview={shopImagePreview}
                  onFile={handleShopImage}
                />
              </div>

              {/* Customer Image */}
              <div>
                <ImageField
                  label="Customer Image"
                  name="customerImage"
                  preview={customerImagePreview}
                  onFile={handleCustomerImage}
                />
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes :</label>
                <textarea rows={3} value={form.notes} onChange={set("notes")}
                  placeholder="Notes"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none" />
              </div>

            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 border-t border-gray-100">
              <Link
                href="/dashboard/customers/list"
                className="px-6 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 bg-[#1E3A8A] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 transition-colors w-full sm:w-auto"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CreateCustomerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div></div>}>
      <CreateCustomerContent />
    </Suspense>
  );
}
