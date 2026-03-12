"use client";
import { showError, showSuccess, showWarning } from "@/lib/swal";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import ImageUpload from "@/components/ui/ImageUpload";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const FIELD = (label, key, props = {}) => ({ label, key, ...props });

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeading({ title, subtitle }) {
  return (
    <div className="mb-5 pb-3 border-b border-gray-100">
      <h3 className="text-base font-bold text-[#1E3A8A]">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── Form Field ───────────────────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent bg-white";

// ─── Toggle switch ────────────────────────────────────────────────────────────
function YesNoToggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
      {["Yes", "No"].map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt === "Yes")}
          className={`px-5 py-2 text-sm font-medium transition-colors ${
            (opt === "Yes" ? value : !value)
              ? "bg-[#1E3A8A] text-white"
              : "bg-white text-gray-500 hover:bg-gray-50"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function CreateProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const [form, setForm] = useState({
    name: "",
    extraField1: "",
    extraField2: "",
    productCode: generateCode(),
    barcode: "",
    initial: "0",
    category: "",
    subcategory: "",
    brand: "",
    unit: "",
    origin: "",
    warranty: "0",
    sellTax: "0",
    purchaseTax: "0",
    taxType: "exclusive",
    sellingPrice: "0",
    wholeSellPrice: "0",
    purchasePrice: "0",
    manageStock: true,
    isOnline: true,
    status: "active",
    alertQuantity: "10",
    description: "",
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    Promise.all([
      api.getCategories().then((r) => setCategories(r.data)).catch(() => {}),
      api.getBrands().then((r) => setBrands(r.data)).catch(() => {}),
      api.getUnits().then((r) => setUnits(r.data)).catch(() => {}),
    ]);
  }, []);

  // Pre-fill if editing
  useEffect(() => {
    if (!editId) return;
    setLoading(true);
    api.getProduct(editId)
      .then((r) => {
        const p = r.data;
        setForm({
          name: p.name || "",
          extraField1: p.extraField1 || "",
          extraField2: p.extraField2 || "",
          productCode: p.productCode || generateCode(),
          barcode: p.barcode || "",
          initial: String(p.initial ?? 0),
          category: p.category?._id || p.category || "",
          subcategory: p.subcategory || "",
          brand: p.brand?._id || p.brand || "",
          unit: p.unit || "",
          origin: p.origin || "",
          warranty: String(p.warranty ?? 0),
          sellTax: String(p.sellTax ?? 0),
          purchaseTax: String(p.purchaseTax ?? 0),
          taxType: p.taxType || "exclusive",
          sellingPrice: String(p.sellingPrice ?? 0),
          wholeSellPrice: String(p.wholeSellPrice ?? 0),
          purchasePrice: String(p.purchasePrice ?? 0),
          manageStock: p.manageStock !== false,
          isOnline: p.isOnline !== false,
          status: p.isActive ? "active" : "inactive",
          alertQuantity: String(p.alertQuantity ?? 10),
          description: p.description || "",
        });
        if (p.image) setImageUrl(p.image);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [editId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        extraField1: form.extraField1,
        extraField2: form.extraField2,
        productCode: form.productCode || undefined,
        barcode: form.barcode || undefined,
        initial: Number(form.initial),
        category: form.category,
        subcategory: form.subcategory,
        brand: form.brand || undefined,
        unit: form.unit,
        origin: form.origin,
        warranty: Number(form.warranty),
        sellTax: Number(form.sellTax),
        purchaseTax: Number(form.purchaseTax),
        taxType: form.taxType,
        sellingPrice: Number(form.sellingPrice),
        wholeSellPrice: Number(form.wholeSellPrice),
        purchasePrice: Number(form.purchasePrice),
        manageStock: form.manageStock,
        isOnline: form.isOnline,
        isActive: form.status === "active",
        alertQuantity: Number(form.alertQuantity),
        description: form.description,
        image: imageUrl || undefined,
        stock: Number(form.initial),
      };

      if (editId) {
        await api.updateProduct(editId, payload);
      } else {
        await api.createProduct(payload);
      }
      router.push("/dashboard/products/list");
    } catch (err) {
      showError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-gray-800">
            {editId ? "Edit Product" : "Create Product"}
          </h2>
          <p className="text-xs lg:text-sm text-gray-400 mt-0.5">
            {editId ? "Update product information" : "Add a new product to your inventory"}
          </p>
        </div>
        <Link
          href="/dashboard/products/list"
          className="shrink-0 flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1E3A8A] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Back to List</span>
        </Link>
      </div>

      {/* ── Section 1: Product Information ───────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
        <SectionHeading title="Product Information" subtitle="Basic details about the product" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Product Name */}
          <div className="md:col-span-2">
            <Field label="Product Name" required>
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Enter product name"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Extra Fields */}
          <Field label="Extra Field 1">
            <input
              value={form.extraField1}
              onChange={(e) => set("extraField1", e.target.value)}
              placeholder="Field 1 (optional)"
              className={inputCls}
            />
          </Field>
          <Field label="Extra Field 2">
            <input
              value={form.extraField2}
              onChange={(e) => set("extraField2", e.target.value)}
              placeholder="Field 2 (optional)"
              className={inputCls}
            />
          </Field>

          {/* Product Code */}
          <Field label="Product Code" required>
            <div className="flex gap-2">
              <input
                required
                value={form.productCode}
                onChange={(e) => set("productCode", e.target.value)}
                placeholder="Di5oJgZf"
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={() => set("productCode", generateCode())}
                className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 transition-colors whitespace-nowrap"
                title="Auto-generate code"
              >
                Generate
              </button>
            </div>
          </Field>

          {/* Initial */}
          <Field label="Initial (Opening Stock)" required>
            <input
              required
              type="number"
              min="0"
              value={form.initial}
              onChange={(e) => set("initial", e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          </Field>

          {/* Category */}
          <Field label="Category" required>
            <div className="flex gap-2">
              <select
                required
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={`${inputCls} flex-1`}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <Link
                href="/dashboard/products/categories/create"
                title="Create new category"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1E3A8A] text-white hover:bg-blue-800 transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            </div>
          </Field>

          {/* Subcategory */}
          <Field label="Subcategory">
            <input
              value={form.subcategory}
              onChange={(e) => set("subcategory", e.target.value)}
              placeholder="Subcategory (optional)"
              className={inputCls}
            />
          </Field>

          {/* Brand */}
          <Field label="Brand" required>
            <div className="flex gap-2">
              <select
                value={form.brand}
                onChange={(e) => set("brand", e.target.value)}
                className={`${inputCls} flex-1`}
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
              <Link
                href="/dashboard/products/brands/create"
                title="Create new brand"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1E3A8A] text-white hover:bg-blue-800 transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            </div>
          </Field>

          {/* Unit */}
          <Field label="Unit" required>
            <div className="flex gap-2">
              <select
                required
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
                className={`${inputCls} flex-1`}
              >
                <option value="">Select unit</option>
                {units.map((u) => (
                  <option key={u._id} value={u.shortName}>{u.name} ({u.shortName})</option>
                ))}
                {/* Default fallbacks if no units created yet */}
                {units.length === 0 && (
                  <>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="gram">Gram</option>
                    <option value="litre">Litre</option>
                    <option value="ml">Millilitre (ml)</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                    <option value="dozen">Dozen</option>
                    <option value="meter">Meter</option>
                  </>
                )}
              </select>
              <Link
                href="/dashboard/products/units/create"
                title="Create new unit"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1E3A8A] text-white hover:bg-blue-800 transition-colors shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            </div>
          </Field>

          {/* Origin */}
          <Field label="Origin" required>
            <input
              value={form.origin}
              onChange={(e) => set("origin", e.target.value)}
              placeholder="e.g. Bangladesh, China"
              className={inputCls}
            />
          </Field>

          {/* Warranty */}
          <Field label="Warranty (months)" required>
            <input
              required
              type="number"
              min="0"
              value={form.warranty}
              onChange={(e) => set("warranty", e.target.value)}
              placeholder="0"
              className={inputCls}
            />
          </Field>

          {/* Description */}
          <div className="md:col-span-2">
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={3}
                placeholder="Optional product description"
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* ── Section 2: Tax & Pricing ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
        <SectionHeading title="Tax & Pricing" subtitle="Configure pricing and tax settings" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Sell Tax */}
          <Field label="Sell Tax %" required>
            <div className="relative">
              <input
                required
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.sellTax}
                onChange={(e) => set("sellTax", e.target.value)}
                placeholder="0"
                className={`${inputCls} pr-8`}
              />
              <span className="absolute right-3 top-2 text-sm text-gray-400">%</span>
            </div>
          </Field>

          {/* Purchase Tax */}
          <Field label="Purchase Tax %" required>
            <div className="relative">
              <input
                required
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.purchaseTax}
                onChange={(e) => set("purchaseTax", e.target.value)}
                placeholder="0"
                className={`${inputCls} pr-8`}
              />
              <span className="absolute right-3 top-2 text-sm text-gray-400">%</span>
            </div>
          </Field>

          {/* Tax Type */}
          <Field label="Tax Type" required>
            <select
              required
              value={form.taxType}
              onChange={(e) => set("taxType", e.target.value)}
              className={inputCls}
            >
              <option value="exclusive">Exclusive</option>
              <option value="inclusive">Inclusive</option>
            </select>
          </Field>

          {/* Purchase Price */}
          <Field label="Purchase Price (৳)" required>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-gray-400">৳</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.purchasePrice}
                onChange={(e) => set("purchasePrice", e.target.value)}
                placeholder="0"
                className={`${inputCls} pl-7`}
              />
            </div>
          </Field>

          {/* Sell Price */}
          <Field label="Sell Price (৳)" required>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-gray-400">৳</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.sellingPrice}
                onChange={(e) => set("sellingPrice", e.target.value)}
                placeholder="0"
                className={`${inputCls} pl-7`}
              />
            </div>
          </Field>

          {/* Wholesale Price */}
          <Field label="Whole Sell Price (৳)" required>
            <div className="relative">
              <span className="absolute left-3 top-2 text-sm text-gray-400">৳</span>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.wholeSellPrice}
                onChange={(e) => set("wholeSellPrice", e.target.value)}
                placeholder="0"
                className={`${inputCls} pl-7`}
              />
            </div>
          </Field>
        </div>

        {/* Profit margin indicator */}
        {Number(form.sellingPrice) > 0 && Number(form.purchasePrice) > 0 && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <svg className="w-4 h-4 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <p className="text-sm text-[#1E3A8A]">
              Profit Margin:{" "}
              <span className="font-bold">
                {(((Number(form.sellingPrice) - Number(form.purchasePrice)) / Number(form.purchasePrice)) * 100).toFixed(1)}%
              </span>
              {" "}(৳{(Number(form.sellingPrice) - Number(form.purchasePrice)).toFixed(2)} per unit)
            </p>
          </div>
        )}
      </div>

      {/* ── Section 3: Settings & Media ──────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:p-6">
        <SectionHeading title="Settings & Media" subtitle="Stock management, visibility and product image" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column — toggles */}
          <div className="space-y-5">
            {/* Alert Qty */}
            <Field label="Alert Quantity (Low Stock)">
              <input
                type="number"
                min="0"
                value={form.alertQuantity}
                onChange={(e) => set("alertQuantity", e.target.value)}
                className={inputCls}
              />
            </Field>

            {/* Manage Stock */}
            <Field label="Manage Stock">
              <YesNoToggle value={form.manageStock} onChange={(v) => set("manageStock", v)} />
            </Field>

            {/* Is Online */}
            <Field label="Is Online">
              <YesNoToggle value={form.isOnline} onChange={(v) => set("isOnline", v)} />
            </Field>

            {/* Status */}
            <Field label="Status">
              <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
                {["active", "inactive"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("status", s)}
                    className={`px-5 py-2 text-sm font-medium capitalize transition-colors ${
                      form.status === s
                        ? s === "active"
                          ? "bg-green-600 text-white"
                          : "bg-red-500 text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {s === "active" ? "Active" : "Inactive"}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* Right column — image upload */}
          <div>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="Product Image"
            />
          </div>
        </div>
      </div>

      {/* ── Action Buttons ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Link
          href="/dashboard/products/list"
          className="w-full sm:w-auto text-center px-6 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-8 py-2.5 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {editId ? "Update Product" : "Save Product"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function CreateProductPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]" />
      </div>
    }>
      <CreateProductContent />
    </Suspense>
  );
}
