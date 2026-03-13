"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

const LanguageContext = createContext(null);

const BENGALI_RE = /[\u0980-\u09FF]/;
const ENGLISH_RE = /[A-Za-z]/;

const ATTRS_TO_TRANSLATE = ["placeholder", "title", "aria-label", "alt"];

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const BN = {
  "English": "ইংরেজি",
  "Bangla": "বাংলা",
  "Dashboard": "ড্যাশবোর্ড",
  "Quick Sale": "দ্রুত বিক্রয়",
  "Products": "পণ্য",
  "Categories": "ক্যাটাগরি",
  "Inventory": "ইনভেন্টরি",
  "Sales": "বিক্রয়",
  "Customers": "গ্রাহক",
  "Suppliers": "সরবরাহকারী",
  "Reports": "রিপোর্ট",
  "Settings": "সেটিংস",
  "Recent Sales": "সাম্প্রতিক বিক্রয়",
  "View all": "সব দেখুন",
  "No sales yet today": "আজ এখনো কোনো বিক্রয় হয়নি",
  "Invoice": "ইনভয়েস",
  "Customer": "গ্রাহক",
  "Amount": "পরিমাণ",
  "Payment": "পেমেন্ট",
  "Status": "স্ট্যাটাস",
  "Stock": "স্টক",
  "Low Stock Alert": "কম স্টক সতর্কতা",
  "Manage": "ম্যানেজ করুন",
  "Alert": "সতর্কতা",
  "Monthly Sales Overview": "মাসিক বিক্রয়ের সারসংক্ষেপ",
  "Daily sales for": "দৈনিক বিক্রয়",
  "Day": "দিন",
  "Hover a bar": "বারে কার্সর নিন",
  "sales": "বিক্রয়",
  "Sales/day": "প্রতি দিনের বিক্রয়",
  "Active": "সক্রিয়",
  "High": "সর্বোচ্চ",
  "Total": "মোট",
  "Today's Sales": "আজকের বিক্রয়",
  "Monthly Revenue": "মাসিক আয়",
  "Total Sales": "মোট বিক্রয়",
  "Total Products": "মোট পণ্য",
  "Low Stock": "কম স্টক",
  "transactions": "লেনদেন",
  "this month": "এই মাসে",
  "all transactions": "সকল লেনদেন",
  "Active products": "সক্রিয় পণ্য",
  "Need restocking": "রিস্টক প্রয়োজন",
  "Search products, customers...": "পণ্য, গ্রাহক খুঁজুন...",
  "Searching...": "খোঁজা হচ্ছে...",
  "No results found": "কোনো ফলাফল পাওয়া যায়নি",
  "Refresh": "রিফ্রেশ",
  "Refresh page": "পৃষ্ঠা রিফ্রেশ",
  "Calculator": "ক্যালকুলেটর",
  "Fullscreen": "ফুলস্ক্রিন",
  "Exit fullscreen": "ফুলস্ক্রিন বন্ধ করুন",
  "Change language": "ভাষা পরিবর্তন",
  "Select Language": "ভাষা নির্বাচন",
  "Stock overview": "স্টক সারসংক্ষেপ",
  "Sign Out": "সাইন আউট",
  "Open menu": "মেনু খুলুন",
  "Stock Overview": "স্টক সারসংক্ষেপ",
  "All products sorted by stock level · lowest to highest": "স্টক লেভেল অনুযায়ী সব পণ্য সাজানো · কম থেকে বেশি",
  "Back": "ফিরুন",
  "Out of Stock": "স্টক শেষ",
  "In Stock": "স্টকে আছে",
  "Search by name, barcode, category...": "নাম, বারকোড, ক্যাটাগরি দিয়ে খুঁজুন...",
  "All": "সব",
  "Out": "স্টক শেষ",
  "Low": "কম",
  "OK": "স্বাভাবিক",
  "Loading products...": "পণ্য লোড হচ্ছে...",
  "No products found": "কোনো পণ্য পাওয়া যায়নি",
  "Product": "পণ্য",
  "Category": "ক্যাটাগরি",
  "Barcode": "বারকোড",
  "Alert Qty": "সতর্কতা পরিমাণ",
  "Unit": "ইউনিট",
  "Showing": "দেখানো হচ্ছে",
  "of": "এর মধ্যে",
  "sorted by stock ascending": "স্টক অনুযায়ী ঊর্ধ্বক্রমে সাজানো",
  "Purchase": "ক্রয়",
  "Warranty": "ওয়ারেন্টি",
  "Quotation": "কোটেশন",
  "Sales Person": "সেলস পারসন",
  "Accounting": "হিসাবরক্ষণ",
  "Banking": "ব্যাংকিং",
  "HRM": "এইচআরএম",
  "Salary": "বেতন",
  "GST Report": "জিএসটি রিপোর্ট",
  "Loan Management": "ঋণ ব্যবস্থাপনা",
  "Report": "রিপোর্ট",
  "SMS & Email": "এসএমএস ও ইমেইল",
  "Task Management": "কাজ ব্যবস্থাপনা",
  "User Management": "ব্যবহারকারী ব্যবস্থাপনা"
  ,"Create Product": "পণ্য তৈরি",
  "List Product": "পণ্যের তালিকা",
  "Import Product": "পণ্য ইমপোর্ট",
  "Expired Product": "মেয়াদোত্তীর্ণ পণ্য",
  "Barcode Generate": "বারকোড তৈরি",
  "Price All": "সব পণ্যের মূল্য",
  "Update Cost": "খরচ আপডেট",
  "Product Adjustment": "পণ্য সমন্বয়",
  "Create Category": "ক্যাটাগরি তৈরি",
  "List Category": "ক্যাটাগরি তালিকা",
  "Create Brand": "ব্র্যান্ড তৈরি",
  "List Brand": "ব্র্যান্ড তালিকা",
  "Create Unit": "ইউনিট তৈরি",
  "List Unit": "ইউনিট তালিকা",
  "Create Purchase": "ক্রয় তৈরি",
  "List Purchase": "ক্রয়ের তালিকা",
  "List Due Purchase": "বকেয়া ক্রয় তালিকা",
  "List Hold Order": "হোল্ড অর্ডার তালিকা",
  "Create Invoice": "ইনভয়েস তৈরি",
  "List Invoice": "ইনভয়েস তালিকা",
  "List Due Invoice": "বকেয়া ইনভয়েস তালিকা",
  "Instalment Invoice": "কিস্তি ইনভয়েস",
  "Create Quotation": "কোটেশন তৈরি",
  "List Quotation": "কোটেশন তালিকা",
  "Pending Quotation": "অমীমাংসিত কোটেশন",
  "Create Warranty": "ওয়ারেন্টি তৈরি",
  "List Warranty": "ওয়ারেন্টি তালিকা",
  "Pending Warranty": "অমীমাংসিত ওয়ারেন্টি",
  "Create Supplier": "সরবরাহকারী তৈরি",
  "List Suppliers": "সরবরাহকারী তালিকা",
  "Create Customer": "গ্রাহক তৈরি",
  "List Customer": "গ্রাহক তালিকা",
  "Important Customer": "গুরুত্বপূর্ণ গ্রাহক",
  "Customer Bulk Update": "গ্রাহক বাল্ক আপডেট",
  "Add Sales Person": "সেলস পারসন যুক্ত করুন",
  "List Sales Person": "সেলস পারসন তালিকা",
  "Add Expense": "খরচ যোগ করুন",
  "List Expense": "খরচের তালিকা",
  "Add Deposit": "জমা যোগ করুন",
  "List Deposit": "জমার তালিকা",
  "Add Expense Category": "খরচ ক্যাটাগরি যোগ করুন",
  "List Expense Category": "খরচ ক্যাটাগরি তালিকা",
  "Transaction": "লেনদেন",
  "Add Bank Account": "ব্যাংক অ্যাকাউন্ট যোগ করুন",
  "List Bank Account": "ব্যাংক অ্যাকাউন্ট তালিকা",
  "Deposit / Withdraw": "জমা / উত্তোলন",
  "Add Employee": "কর্মচারী যোগ করুন",
  "List Employee": "কর্মচারী তালিকা",
  "Search Employee": "কর্মচারী অনুসন্ধান",
  "Salary Generate": "বেতন তৈরি",
  "List Salary": "বেতন তালিকা",
  "View Salary Sheet": "বেতন শিট দেখুন",
  "Sales Report": "বিক্রয় রিপোর্ট",
  "Purchase Report": "ক্রয় রিপোর্ট",
  "Add Loan": "ঋণ যোগ করুন",
  "List Loan": "ঋণ তালিকা",
  "Item Report": "আইটেম রিপোর্ট",
  "Invoice Report": "ইনভয়েস রিপোর্ট",
  "Stock Report": "স্টক রিপোর্ট",
  "Overview Report": "সারসংক্ষেপ রিপোর্ট",
  "Tax Report": "কর রিপোর্ট",
  "Master Report": "মাস্টার রিপোর্ট",
  "Expense Overview": "খরচের সারসংক্ষেপ",
  "Customer Report": "গ্রাহক রিপোর্ট",
  "Collection Report": "কালেকশন রিপোর্ট",
  "Analytics Report": "অ্যানালিটিক্স রিপোর্ট",
  "Category Wise Stock": "ক্যাটাগরি অনুযায়ী স্টক",
  "Brand Wise Report": "ব্র্যান্ড অনুযায়ী রিপোর্ট",
  "📊 Comprehensive Report": "📊 পূর্ণাঙ্গ রিপোর্ট",
  "Send SMS": "এসএমএস পাঠান",
  "Send Email": "ইমেইল পাঠান",
  "Add Task": "কাজ যোগ করুন",
  "List Task": "কাজের তালিকা",
  "Add New Users": "নতুন ব্যবহারকারী যোগ করুন",
  "User List": "ব্যবহারকারী তালিকা"
};

const BN_REVERSED = Object.fromEntries(Object.entries(BN).map(([en, bn]) => [bn, en]));

const SORTED_EN_KEYS = Object.keys(BN).sort((a, b) => b.length - a.length);

const looksEnglish = (text) => ENGLISH_RE.test(text) && !BENGALI_RE.test(text);

function translateToBangla(text) {
  if (!text || !looksEnglish(text)) return text;

  const trimmed = text.trim();
  const leading = text.slice(0, text.indexOf(trimmed));
  const trailing = text.slice(text.indexOf(trimmed) + trimmed.length);

  let translated = BN[trimmed] || trimmed;

  if (translated === trimmed) {
    for (const key of SORTED_EN_KEYS) {
      if (!translated.includes(key)) continue;
      translated = translated.replace(new RegExp(escapeRegExp(key), "g"), BN[key]);
    }
  }

  return `${leading}${translated}${trailing}`;
}

function restoreToEnglish(text) {
  if (!text || looksEnglish(text)) return text;
  return BN_REVERSED[text] || text;
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window === "undefined") return "en";
    const saved = localStorage.getItem("pos_lang");
    return saved === "bn" ? "bn" : "en";
  });
  const observerRef = useRef(null);
  const textOriginalRef = useRef(new WeakMap());

  const setLanguage = (nextLanguage) => {
    const safeLanguage = nextLanguage === "bn" ? "bn" : "en";
    setLanguageState(safeLanguage);
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_lang", safeLanguage);
    }
  };

  useEffect(() => {
    localStorage.setItem("pos_lang", language);
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const textOriginal = textOriginalRef.current;

    const translateAttributes = (root) => {
      const nodes = root.querySelectorAll("*");
      nodes.forEach((el) => {
        ATTRS_TO_TRANSLATE.forEach((attr) => {
          const current = el.getAttribute(attr);
          if (!current) return;

          const storeAttr = `data-i18n-orig-${attr}`;

          if (language === "bn") {
            if (!el.getAttribute(storeAttr) && looksEnglish(current)) {
              el.setAttribute(storeAttr, current);
            }

            const original = el.getAttribute(storeAttr) || current;
            const translated = translateToBangla(original);
            if (translated !== current) el.setAttribute(attr, translated);
          } else {
            const original = el.getAttribute(storeAttr);
            if (original) {
              el.setAttribute(attr, original);
              el.removeAttribute(storeAttr);
            } else {
              const restored = restoreToEnglish(current);
              if (restored !== current) el.setAttribute(attr, restored);
            }
          }
        });
      });
    };

    const translateTextNodes = (root) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      let node = walker.nextNode();

      while (node) {
        const parentTag = node.parentElement?.tagName;
        if (parentTag !== "SCRIPT" && parentTag !== "STYLE" && parentTag !== "NOSCRIPT") {
          textNodes.push(node);
        }
        node = walker.nextNode();
      }

      textNodes.forEach((textNode) => {
        const current = textNode.nodeValue;
        if (!current || !current.trim()) return;

        if (language === "bn") {
          if (!textOriginal.has(textNode) && looksEnglish(current)) {
            textOriginal.set(textNode, current);
          }
          const source = textOriginal.get(textNode) || current;
          const translated = translateToBangla(source);
          if (translated !== current) textNode.nodeValue = translated;
        } else {
          const original = textOriginal.get(textNode);
          if (original) {
            textNode.nodeValue = original;
            textOriginal.delete(textNode);
          } else {
            const restored = restoreToEnglish(current);
            if (restored !== current) textNode.nodeValue = restored;
          }
        }
      });
    };

    const applyLanguageToDom = () => {
      translateAttributes(document.body);
      translateTextNodes(document.body);
    };

    applyLanguageToDom();

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (language === "bn") {
      observerRef.current = new MutationObserver(() => applyLanguageToDom());
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ATTRS_TO_TRANSLATE,
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [language]);

  const t = (text) => {
    if (!text) return "";
    if (language !== "bn") return text;
    return BN[text] || text;
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggleLanguage: () => setLanguage(language === "en" ? "bn" : "en"),
    t,
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
