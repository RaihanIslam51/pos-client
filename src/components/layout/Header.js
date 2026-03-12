"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/AuthContext";
import { api } from "@/lib/api";

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
    "/dashboard/pos":       "Quick Sale",
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

export default function Header({ showStock, onToggleStock, onMenuClick }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showCalc,  setShowCalc]    = useState(false);
  const [showLang,  setShowLang]    = useState(false);
  const [showUser,  setShowUser]    = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lang, setLang] = useState(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("pos_lang") || "en";
  });

  // ── Global search state ──────────────────────────────────────────────────
  const [searchQ,      setSearchQ]      = useState("");
  const [searchResults, setSearchResults] = useState({ products: [], customers: [], suppliers: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchDD,  setShowSearchDD]  = useState(false);
  const searchRef = useRef(null);
  const searchTimer = useRef(null);

  const langRef = useRef(null);
  const userRef = useRef(null);

  const title   = getTitle(pathname);
  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const activeLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setShowLang(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUser(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDD(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Debounced global search ──────────────────────────────────────────────
  const runSearch = useCallback(async (q) => {
    const term = q.trim();
    if (!term) { setSearchResults({ products: [], customers: [], suppliers: [] }); setShowSearchDD(false); return; }
    setSearchLoading(true);
    setShowSearchDD(true);
    try {
      const [prodRes, custRes, supRes] = await Promise.allSettled([
        api.getProducts(`?search=${encodeURIComponent(term)}`),
        api.getCustomers(`?search=${encodeURIComponent(term)}`),
        api.getSuppliers(`?search=${encodeURIComponent(term)}`),
      ]);
      setSearchResults({
        products:  prodRes.status  === "fulfilled" ? (prodRes.value.data  || []).slice(0, 5) : [],
        customers: custRes.status  === "fulfilled" ? (custRes.value.data  || []).slice(0, 5) : [],
        suppliers: supRes.status   === "fulfilled" ? (supRes.value.data   || []).slice(0, 5) : [],
      });
    } catch {
      setSearchResults({ products: [], customers: [], suppliers: [] });
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQ(val);
    clearTimeout(searchTimer.current);
    if (!val.trim()) { setSearchResults({ products: [], customers: [], suppliers: [] }); setShowSearchDD(false); return; }
    searchTimer.current = setTimeout(() => runSearch(val), 350);
  };

  const goTo = (url) => { setShowSearchDD(false); setSearchQ(""); router.push(url); };

  const totalResults = searchResults.products.length + searchResults.customers.length + searchResults.suppliers.length;

  // ── Refresh ──────────────────────────────────────────────────────────────
  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 800);
  };

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const selectLang = (code) => {
    setLang(code);
    localStorage.setItem("pos_lang", code);
    setShowLang(false);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors lg:hidden mr-1 shrink-0"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Left — page title */}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg lg:text-xl font-bold text-[#1E3A8A] truncate">{title}</h1>
          <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{dateStr}</p>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2">

          {/* Search */}
          <div className="relative hidden md:block" ref={searchRef}>
            <input
              type="text"
              placeholder="Search products, customers..."
              value={searchQ}
              onChange={handleSearchChange}
              onFocus={() => { if (searchQ.trim()) setShowSearchDD(true); }}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent w-56"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            {/* Search dropdown */}
            {showSearchDD && (
              <div className="absolute left-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                {searchLoading ? (
                  <div className="flex items-center justify-center gap-2 py-5 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-[#1E3A8A] rounded-full animate-spin" />
                    Searching…
                  </div>
                ) : totalResults === 0 ? (
                  <div className="py-6 text-center text-sm text-gray-400">No results found</div>
                ) : (
                  <>
                    {/* Products */}
                    {searchResults.products.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 pt-2.5 pb-1">Products</p>
                        {searchResults.products.map((p) => (
                          <button key={p._id} onMouseDown={() => goTo(`/dashboard/pos`)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition-colors text-left">
                            {p.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover border border-gray-100 shrink-0" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0 text-sm">📦</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.category?.name || ""} · ৳{p.sellingPrice}</p>
                            </div>
                            <span className={`text-xs font-semibold shrink-0 ${p.stock <= p.alertQuantity ? "text-red-500" : "text-green-600"}`}>
                              {p.stock} {p.unit}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Customers */}
                    {searchResults.customers.length > 0 && (
                      <div className={searchResults.products.length > 0 ? "border-t border-gray-100" : ""}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 pt-2.5 pb-1">Customers</p>
                        {searchResults.customers.map((c) => (
                          <button key={c._id} onMouseDown={() => goTo(`/dashboard/customers`)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition-colors text-left">
                            <div className="w-8 h-8 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {c.name?.[0]?.toUpperCase() || "C"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{c.name}</p>
                              <p className="text-xs text-gray-400">{c.phone || c.mobile || "—"}</p>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0">Customer</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Suppliers */}
                    {searchResults.suppliers.length > 0 && (
                      <div className={(searchResults.products.length + searchResults.customers.length) > 0 ? "border-t border-gray-100" : ""}>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 pt-2.5 pb-1">Suppliers</p>
                        {searchResults.suppliers.map((s) => (
                          <button key={s._id} onMouseDown={() => goTo(`/dashboard/suppliers`)}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 transition-colors text-left">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold shrink-0">
                              {s.name?.[0]?.toUpperCase() || "S"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                              <p className="text-xs text-gray-400">{s.phone || s.mobile || "—"}</p>
                            </div>
                            <span className="text-xs text-gray-400 shrink-0">Supplier</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── Fullscreen ── */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="hidden md:flex p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-[#1E3A8A]"
          >
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>

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

          {/* ── Refresh ── */}
          <button
            onClick={handleRefresh}
            title="Refresh page"
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100 text-gray-600 hover:text-[#1E3A8A]`}
          >
            <svg className={`w-4 h-4 shrink-0 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden md:inline">Refresh</span>
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

          {/* ── User Avatar Dropdown ── */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUser((v) => !v)}
              className="flex items-center gap-2 cursor-pointer pl-1 rounded-lg hover:bg-gray-100 px-2 py-1.5 transition-colors"
            >
              <div className="w-8 h-8 bg-[#1E3A8A] rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800 leading-none">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{user?.role || "admin"}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUser && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <span className={`inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    user?.role === "admin" ? "bg-purple-100 text-purple-700"
                    : user?.role === "manager" ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                  }`}>
                    {user?.role}
                  </span>
                </div>
                {/* Logout */}
                <button
                  onClick={() => { setShowUser(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Calculator modal — rendered outside header to avoid z-index issues */}
      {showCalc && <Calculator onClose={() => setShowCalc(false)} />}
    </>
  );
}

