"use client";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { uploadToImgBB } from "@/lib/imgbb";
import { useSettings } from "@/lib/SettingsContext";

const TIMEZONES = [
  "Asia/Dhaka", "Asia/Kolkata", "Asia/Karachi", "Asia/Dubai",
  "Asia/Singapore", "Asia/Tokyo", "Europe/London", "Europe/Paris",
  "America/New_York", "America/Chicago", "America/Los_Angeles",
  "Australia/Sydney", "UTC",
];

const CURRENCIES = [
  { label: "BDT (৳)", value: "BDT", symbol: "৳" },
  { label: "USD ($)", value: "USD", symbol: "$" },
  { label: "EUR (€)", value: "EUR", symbol: "€" },
  { label: "GBP (£)", value: "GBP", symbol: "£" },
  { label: "INR (₹)", value: "INR", symbol: "₹" },
  { label: "AED (د.إ)", value: "AED", symbol: "د.إ" },
];

function SectionCard({ icon, title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
        <span className="text-xl">{icon}</span>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InputField({ label, hint, ...props }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <input
        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
        {...props}
      />
    </div>
  );
}

function TextareaField({ label, hint, rows = 2, ...props }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      <textarea
        rows={rows}
        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition resize-none"
        {...props}
      />
    </div>
  );
}

function ImageUploadField({ label, hint, currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const result = await uploadToImgBB(file);
      onUploaded(result.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      {hint && <p className="text-xs text-gray-400 mt-0.5 mb-2">{hint}</p>}
      <div className="mt-1 flex items-center gap-4">
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={label}
            className="h-14 w-14 rounded-lg object-contain border border-gray-200 bg-gray-50"
          />
        ) : (
          <div className="h-14 w-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
            None
          </div>
        )}
        <div className="flex-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:border-[#1E3A8A] hover:text-[#1E3A8A] transition disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Choose Image"}
          </button>
          {currentUrl && (
            <button
              type="button"
              onClick={() => onUploaded("")}
              className="ml-2 px-3 py-2 text-xs text-red-500 hover:text-red-700 transition"
            >
              Remove
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}

function SaveButton({ saving, saved, error }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <button
        type="submit"
        disabled={saving}
        className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
      {saved && <span className="text-green-600 text-sm font-medium flex items-center gap-1">✅ Saved successfully!</span>}
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  );
}

export default function SettingsPage() {
  const { refresh: refreshSettings } = useSettings();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");

  // Section states
  const [general, setGeneral] = useState({ logo: "", favicon: "", invoiceHeader: "", invoiceFooter: "" });
  const [shop, setShop] = useState({ shopName: "", address: "", phone: "", email: "", timezone: "Asia/Dhaka" });
  const [config, setConfig] = useState({ currency: "BDT", currencySymbol: "৳", taxRate: 0, lowStockThreshold: 10, receiptNote: "", enableSms: false, enableEmail: false });
  const [social, setSocial] = useState({ facebook: "", instagram: "", twitter: "", youtube: "", website: "" });

  // Per-section save state
  const [status, setStatus] = useState({ general: {}, shop: {}, config: {}, social: {} });

  useEffect(() => {
    api.getSettings().then((res) => {
      const d = res.data;
      setGeneral({ logo: d.logo || "", favicon: d.favicon || "", invoiceHeader: d.invoiceHeader || "", invoiceFooter: d.invoiceFooter || "" });
      setShop({ shopName: d.shopName || "", address: d.address || "", phone: d.phone || "", email: d.email || "", timezone: d.timezone || "Asia/Dhaka" });
      setConfig({ currency: d.currency || "BDT", currencySymbol: d.currencySymbol || "৳", taxRate: d.taxRate ?? 0, lowStockThreshold: d.lowStockThreshold ?? 10, receiptNote: d.receiptNote || "", enableSms: d.enableSms || false, enableEmail: d.enableEmail || false });
      setSocial({ facebook: d.facebook || "", instagram: d.instagram || "", twitter: d.twitter || "", youtube: d.youtube || "", website: d.website || "" });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const saveSection = async (section, data) => {
    setStatus((s) => ({ ...s, [section]: { saving: true, saved: false, error: "" } }));
    try {
      await api.updateSettings(data);
      setStatus((s) => ({ ...s, [section]: { saving: false, saved: true, error: "" } }));
      // Refresh context so sidebar logo & name update instantly
      refreshSettings();
      // Apply favicon instantly if this is the general section
      if (section === "general" && data.favicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = data.favicon;
      }
      setTimeout(() => setStatus((s) => ({ ...s, [section]: { saving: false, saved: false, error: "" } })), 3000);
    } catch (err) {
      setStatus((s) => ({ ...s, [section]: { saving: false, saved: false, error: err.message } }));
    }
  };

  const tabs = [
    { key: "general", label: "General", icon: "⚙️" },
    { key: "shop", label: "Shop Info", icon: "🏪" },
    { key: "config", label: "Configuration", icon: "🔧" },
    { key: "social", label: "Social Links", icon: "🌐" },
    { key: "system", label: "System", icon: "ℹ️" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E3A8A]" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your store configuration and preferences.</p>
      </div>

      {/* Tab Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            const hasSaved = status[tab.key]?.saved;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  isActive
                    ? "border-[#1E3A8A] text-[#1E3A8A] bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {hasSaved && <span className="w-2 h-2 bg-green-500 rounded-full ml-1" />}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">

          {/* ─── General Settings ─── */}
          {activeTab === "general" && (
            <form onSubmit={(e) => { e.preventDefault(); saveSection("general", general); }} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ImageUploadField
                  label="Store Logo"
                  hint="Shown in header & invoices (PNG/JPG, max 2MB)"
                  currentUrl={general.logo}
                  onUploaded={(url) => setGeneral({ ...general, logo: url })}
                />
                <ImageUploadField
                  label="Favicon"
                  hint="Browser tab icon (32×32 or 64×64 PNG recommended)"
                  currentUrl={general.favicon}
                  onUploaded={(url) => setGeneral({ ...general, favicon: url })}
                />
              </div>
              <TextareaField
                label="Invoice Header"
                hint="Text printed at the top of every invoice"
                rows={2}
                value={general.invoiceHeader}
                onChange={(e) => setGeneral({ ...general, invoiceHeader: e.target.value })}
                placeholder="e.g. Thank you for shopping with us!"
              />
              <TextareaField
                label="Invoice Footer"
                hint="Text printed at the bottom of every invoice"
                rows={2}
                value={general.invoiceFooter}
                onChange={(e) => setGeneral({ ...general, invoiceFooter: e.target.value })}
                placeholder="e.g. No returns after 7 days. All prices include VAT."
              />
              <SaveButton {...(status.general)} />
            </form>
          )}

          {/* ─── Shop Information ─── */}
          {activeTab === "shop" && (
            <form onSubmit={(e) => { e.preventDefault(); saveSection("shop", shop); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Shop Name" value={shop.shopName} onChange={(e) => setShop({ ...shop, shopName: e.target.value })} placeholder="My POS Store" />
                <InputField label="Phone" type="tel" value={shop.phone} onChange={(e) => setShop({ ...shop, phone: e.target.value })} placeholder="+880 1700 000000" />
                <InputField label="Email" type="email" value={shop.email} onChange={(e) => setShop({ ...shop, email: e.target.value })} placeholder="shop@example.com" />
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Timezone</label>
                  <select
                    value={shop.timezone}
                    onChange={(e) => setShop({ ...shop, timezone: e.target.value })}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white transition"
                  >
                    {TIMEZONES.map((tz) => <option key={tz}>{tz}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <TextareaField label="Shop Address" rows={2} value={shop.address} onChange={(e) => setShop({ ...shop, address: e.target.value })} placeholder="123 Main Street, Dhaka, Bangladesh" />
                </div>
              </div>
              <SaveButton {...(status.shop)} />
            </form>
          )}

          {/* ─── Other Configuration ─── */}
          {activeTab === "config" && (
            <form onSubmit={(e) => { e.preventDefault(); saveSection("config", config); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Currency</label>
                  <select
                    value={config.currency}
                    onChange={(e) => {
                      const cur = CURRENCIES.find((c) => c.value === e.target.value);
                      setConfig({ ...config, currency: cur.value, currencySymbol: cur.symbol });
                    }}
                    className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white transition"
                  >
                    {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <InputField label="Tax Rate (%)" type="number" min="0" max="100" step="0.1" value={config.taxRate} onChange={(e) => setConfig({ ...config, taxRate: parseFloat(e.target.value) || 0 })} />
                <InputField label="Low Stock Alert Threshold" hint="Alert when stock falls below this quantity" type="number" min="1" value={config.lowStockThreshold} onChange={(e) => setConfig({ ...config, lowStockThreshold: parseInt(e.target.value) || 1 })} />
                <div className="sm:col-span-2">
                  <TextareaField label="Receipt Note" hint="Printed on POS receipts" rows={2} value={config.receiptNote} onChange={(e) => setConfig({ ...config, receiptNote: e.target.value })} placeholder="e.g. Thank you! Visit again." />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[#1E3A8A] transition">
                  <input type="checkbox" checked={config.enableSms} onChange={(e) => setConfig({ ...config, enableSms: e.target.checked })} className="w-4 h-4 rounded accent-[#1E3A8A]" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Enable SMS Notifications</p>
                    <p className="text-xs text-gray-400">Send SMS for sales & alerts</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-[#1E3A8A] transition">
                  <input type="checkbox" checked={config.enableEmail} onChange={(e) => setConfig({ ...config, enableEmail: e.target.checked })} className="w-4 h-4 rounded accent-[#1E3A8A]" />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Enable Email Notifications</p>
                    <p className="text-xs text-gray-400">Send email receipts & summaries</p>
                  </div>
                </label>
              </div>
              <SaveButton {...(status.config)} />
            </form>
          )}

          {/* ─── Social Links ─── */}
          {activeTab === "social" && (
            <form onSubmit={(e) => { e.preventDefault(); saveSection("social", social); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "website", label: "Website", placeholder: "https://yourstore.com", icon: "🌍" },
                  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage", icon: "📘" },
                  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourprofile", icon: "📸" },
                  { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/yourhandle", icon: "🐦" },
                  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@yourchannel", icon: "▶️" },
                ].map(({ key, label, placeholder, icon }) => (
                  <div key={key}>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                      <span>{icon}</span> {label}
                    </label>
                    <input
                      type="url"
                      value={social[key]}
                      onChange={(e) => setSocial({ ...social, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition"
                    />
                  </div>
                ))}
              </div>
              <SaveButton {...(status.social)} />
            </form>
          )}

          {/* ─── System Information ─── */}
          {activeTab === "system" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "App Version", value: "1.0.0" },
                { label: "Database", value: "MongoDB Atlas" },
                { label: "Framework", value: "Next.js 16 + Express" },
                { label: "Environment", value: process.env.NODE_ENV || "development" },
              ].map((info) => (
                <div key={info.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-500">{info.label}</span>
                  <span className="text-sm font-semibold text-gray-800">{info.value}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
