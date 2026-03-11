"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [shopForm, setShopForm] = useState({
    shopName: "My POS Store",
    address: "",
    phone: "",
    email: "",
    currency: "BDT (৳)",
    taxRate: "0",
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const settingSections = [
    {
      title: "Shop Information",
      icon: "🏪",
      content: (
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600">Shop Name</label>
              <input value={shopForm.shopName} onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Phone</label>
              <input value={shopForm.phone} onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Email</label>
              <input type="email" value={shopForm.email} onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Currency</label>
              <select value={shopForm.currency} onChange={(e) => setShopForm({ ...shopForm, currency: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white">
                <option>BDT (৳)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Tax Rate (%)</label>
              <input type="number" min="0" max="100" value={shopForm.taxRate} onChange={(e) => setShopForm({ ...shopForm, taxRate: e.target.value })} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600">Address</label>
              <textarea value={shopForm.address} onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })} rows={2} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-none" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
              Save Changes
            </button>
            {saved && <span className="text-green-600 text-sm font-medium">✅ Settings saved!</span>}
          </div>
        </form>
      ),
    },
  ];

  const systemInfo = [
    { label: "App Version", value: "1.0.0" },
    { label: "Database", value: "MongoDB Atlas" },
    { label: "Framework", value: "Next.js 16 + Express" },
    { label: "Store Type", value: "Pharmacy / Electronics / General" },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Shop Settings */}
      {settingSections.map((section) => (
        <div key={section.title} className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
            <span className="text-xl">{section.icon}</span>
            <h2 className="text-base font-semibold text-gray-800">{section.title}</h2>
          </div>
          <div className="p-6">{section.content}</div>
        </div>
      ))}

      {/* System Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <span className="text-xl">ℹ️</span>
          <h2 className="text-base font-semibold text-gray-800">System Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {systemInfo.map((info) => (
              <div key={info.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">{info.label}</span>
                <span className="text-sm font-semibold text-gray-800">{info.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <span className="text-xl">🔗</span>
          <h2 className="text-base font-semibold text-gray-800">Quick Links</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "API Health Check", href: "http://localhost:5000/api/health", desc: "Server status" },
            { label: "Products", href: "/dashboard/products", desc: "Manage products" },
            { label: "POS Terminal", href: "/dashboard/pos", desc: "Start selling" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="p-4 border border-gray-200 rounded-xl hover:border-[#1E3A8A] hover:bg-blue-50 transition-all group"
            >
              <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1E3A8A]">{link.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{link.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
