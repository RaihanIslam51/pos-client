"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Lazy-load calculator (avoids SSR issues with useReducer keyboard listeners)
const Calculator = dynamic(() => import("@/components/ui/Calculator"), { ssr: false });

const LANGUAGES = [
  { code: "en", label: "English",  flag: "🇺🇸" },
  { code: "bn", label: "বাংলা",     flag: "🇧🇩" },
  { code: "ar", label: "العربية",   flag: "🇸🇦" },
  { code: "hi", label: "हिंदी",     flag: "🇮🇳" },
];

function getTitle(pathname) {
  const map = {
    "/dashboard":           "Dashboard",
    "/dashboard/pos":       "Point of Sale",
    "/dashboard/products":  "Products",
    "/dashboard/categories":"Categories",
    "/dashboard/inventory": "Inventory",
    "/dashboard/sales":     "Sales",
    "/dashboard/customers": "Customers",
    "/dashboard/suppliers": "Suppliers",
    "/dashboard/reports":   "Reports",
    "/dashboard/settings":  "Settings",
  };
  if (map[pathname]) return map[pathname];
  const last = pathname.split("/").filter(Boolean).pop() || "dashboard";
  return last.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

export default function Header({ showStock, onToggleStock }) {
  const pathname = usePathname();
  const [showCalc,  setShowCalc]    = useState(false);
  const [showLang,  setShowLang]    = useState(false);
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("pos_lang") || "en";
  });

  const langRef = useRef(null);

  const title   = getTitle(pathname);
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const activeLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  // Close language dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setShowLang(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectLang = (code) => {
    setLang(code);
    localStorage.setItem("pos_lang", code);
    setShowLang(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        {/* Left — page title */}
        <div>
          <h1 className="text-xl font-bold text-[#1E3A8A]">{title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{dateStr}</p>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2">

          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Quick search..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent w-52"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* ── Calculator ── */}
          <button
            onClick={() => setShowCalc(true)}
            title="Calculator"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-[#1E3A8A]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>

          {/* ── Language ── */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setShowLang((v) => !v)}
              title="Change language"
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 ${showLang ? "bg-gray-100 text-[#1E3A8A]" : "text-gray-600"}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              <span className="hidden md:inline">{activeLang.flag} {activeLang.code.toUpperCase()}</span>
            </button>

            {showLang && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden py-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 py-1.5">Select Language</p>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => selectLang(l.code)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-gray-50 ${
                      lang === l.code ? "text-[#1E3A8A] font-semibold bg-blue-50" : "text-gray-700"
                    }`}
                  >
                    <span className="text-base">{l.flag}</span>
                    <span>{l.label}</span>
                    {lang === l.code && (
                      <svg className="w-3.5 h-3.5 ml-auto text-[#1E3A8A]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Notification / Stock ── */}
          <button
            onClick={onToggleStock}
            title="Stock overview"
            className={`relative p-2 rounded-lg transition-colors hover:bg-gray-100 ${showStock ? "bg-gray-100 text-[#1E3A8A]" : "text-gray-600"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button>

          {/* ── User Avatar ── */}
          <div className="flex items-center gap-2 cursor-pointer pl-1">
            <div className="w-8 h-8 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white text-sm font-bold">
              A
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block">Admin</span>
          </div>

        </div>
      </header>

      {/* Calculator modal — rendered outside header to avoid z-index issues */}
      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}
    </>
  );
}

