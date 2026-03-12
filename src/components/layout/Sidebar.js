"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const IconDashboard = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const IconPOS = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);
const IconProduct = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);
const IconInventory = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);
const IconSales = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
  </svg>
);
const IconCustomers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconSuppliers = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);
const IconReports = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const IconSettings = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const IconPurchase = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const IconChevron = ({ open }) => (
  <svg className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const productSubItems = [
  {
    group: "Products",
    items: [
      { label: "Create Product", href: "/dashboard/products/create" },
      { label: "List Product", href: "/dashboard/products/list" },
      { label: "Import Product", href: "/dashboard/products/import" },
      { label: "Expired Product", href: "/dashboard/products/expired" },
      { label: "Barcode Generate", href: "/dashboard/products/barcode" },
      { label: "Price All", href: "/dashboard/products/price" },
      { label: "Update Cost", href: "/dashboard/products/update-cost" },
      { label: "Product Adjustment", href: "/dashboard/products/adjustment" },
    ],
  },
  {
    group: "Categories",
    items: [
      { label: "Create Category", href: "/dashboard/products/categories/create" },
      { label: "List Category", href: "/dashboard/products/categories/list" },
    ],
  },
  {
    group: "Brands",
    items: [
      { label: "Create Brand", href: "/dashboard/products/brands/create" },
      { label: "List Brand", href: "/dashboard/products/brands/list" },
    ],
  },
  {
    group: "Units",
    items: [
      { label: "Create Unit", href: "/dashboard/products/units/create" },
      { label: "List Unit", href: "/dashboard/products/units/list" },
    ],
  },
];

const purchaseSubItems = [
  {
    group: "Purchase",
    items: [
      { label: "Create Purchase", href: "/dashboard/purchase/create" },
      { label: "List Purchase", href: "/dashboard/purchase/list" },
      { label: "List Due Purchase", href: "/dashboard/purchase/list-due" },
      { label: "List Hold Order", href: "/dashboard/purchase/list-hold" },
    ],
  },
];

const salesSubItems = [
  {
    group: "Sales",
    items: [
      { label: "Create Invoice", href: "/dashboard/sales/create" },
      { label: "List Invoice", href: "/dashboard/sales/list" },
      { label: "List Due Invoice", href: "/dashboard/sales/list-due" },
      { label: "List Hold Order", href: "/dashboard/sales/list-hold" },
      { label: "Instalment Invoice", href: "/dashboard/sales/instalment" },
    ],
  },
];

const quotationSubItems = [
  {
    group: "Quotation",
    items: [
      { label: "Create Quotation", href: "/dashboard/quotation/create" },
      { label: "List Quotation", href: "/dashboard/quotation/list" },
      { label: "Pending Quotation", href: "/dashboard/quotation/pending" },
    ],
  },
];

const warrantySubItems = [
  {
    group: "Warranty",
    items: [
      { label: "Create Warranty", href: "/dashboard/warranty/create" },
      { label: "List Warranty", href: "/dashboard/warranty/list" },
      { label: "Pending Warranty", href: "/dashboard/warranty/pending" },
    ],
  },
];

const supplierSubItems = [
  {
    group: "Suppliers",
    items: [
      { label: "Create Supplier", href: "/dashboard/suppliers/create" },
      { label: "List Suppliers", href: "/dashboard/suppliers/list" },
    ],
  },
];

const customerSubItems = [
  {
    group: "Customers",
    items: [
      { label: "Create Customer", href: "/dashboard/customers/create" },
      { label: "List Customer", href: "/dashboard/customers/list" },
      { label: "Important Customer", href: "/dashboard/customers/important" },
      { label: "Customer Bulk Update", href: "/dashboard/customers/bulk-update" },
    ],
  },
];

const salesPersonSubItems = [
  {
    group: "Sales Person",
    items: [
      { label: "Add Sales Person", href: "/dashboard/salesperson/add" },
      { label: "List Sales Person", href: "/dashboard/salesperson/list" },
    ],
  },
];

const accountingSubItems = [
  {
    group: "Accounting",
    items: [
      { label: "Add Expense", href: "/dashboard/accounting/add-expense" },
      { label: "List Expense", href: "/dashboard/accounting/list-expense" },
      { label: "Add Deposit", href: "/dashboard/accounting/add-deposit" },
      { label: "List Deposit", href: "/dashboard/accounting/list-deposit" },
      { label: "Add Expense Category", href: "/dashboard/accounting/add-expense-category" },
      { label: "List Expense Category", href: "/dashboard/accounting/list-expense-category" },
      { label: "Transaction", href: "/dashboard/accounting/transaction" },
    ],
  },
];

const bankingSubItems = [
  {
    group: "Banking",
    items: [
      { label: "Add Bank Account", href: "/dashboard/banking/add-bank-account" },
      { label: "List Bank Account", href: "/dashboard/banking/list-bank-account" },
      { label: "Deposit / Withdraw", href: "/dashboard/banking/deposit-withdraw" },
      { label: "Transaction", href: "/dashboard/banking/transaction" },
    ],
  },
];

const hrmSubItems = [
  {
    group: "HRM",
    items: [
      { label: "Add Employee", href: "/dashboard/hrm/add-employee" },
      { label: "List Employee", href: "/dashboard/hrm/list-employee" },
      { label: "Search Employee", href: "/dashboard/hrm/search-employee" },
    ],
  },
];

const salarySubItems = [
  {
    group: "Salary",
    items: [
      { label: "Salary Generate", href: "/dashboard/salary/generate" },
      { label: "List Salary", href: "/dashboard/salary/list" },
      { label: "View Salary Sheet", href: "/dashboard/salary/salary-sheet" },
    ],
  },
];

const gstReportSubItems = [
  {
    group: "GST Report",
    items: [
      { label: "Sales Report", href: "/dashboard/gst-report/sales-report" },
      { label: "Purchase Report", href: "/dashboard/gst-report/purchase-report" },
    ],
  },
];

const loanSubItems = [
  {
    group: "Loan Management",
    items: [
      { label: "Add Loan", href: "/dashboard/loan/add-loan" },
      { label: "List Loan", href: "/dashboard/loan/list-loan" },
    ],
  },
];

const reportSubItems = [
  {
    group: "Report",
    items: [
      { label: "Item Report", href: "/dashboard/report/item-report" },
      { label: "Invoice Report", href: "/dashboard/report/invoice-report" },
      { label: "Stock Report", href: "/dashboard/report/stock-report" },
      { label: "Overview Report", href: "/dashboard/report/overview-report" },
      { label: "Tax Report", href: "/dashboard/report/tax-report" },
      { label: "Master Report", href: "/dashboard/report/master-report" },
      { label: "Expense Overview", href: "/dashboard/report/expense-overview" },
      { label: "Customer Report", href: "/dashboard/report/customer-report" },
      { label: "Collection Report", href: "/dashboard/report/collection-report" },
      { label: "Analytics Report", href: "/dashboard/report/analytics-report" },
      { label: "Category Wise Stock", href: "/dashboard/report/category-wise-stock" },
      { label: "Brand Wise Report", href: "/dashboard/report/brand-wise-report" },
    ],
  },
];

const smsEmailSubItems = [
  {
    group: "SMS & Email",
    items: [
      { label: "Send SMS", href: "/dashboard/sms-email/send-sms" },
      { label: "Send Email", href: "/dashboard/sms-email/send-email" },
    ],
  },
];

const taskSubItems = [
  {
    group: "Task Management",
    items: [
      { label: "Add Task", href: "/dashboard/task/add-task" },
      { label: "List Task", href: "/dashboard/task/list-task" },
    ],
  },
];

const userManagementSubItems = [
  {
    group: "User Management",
    items: [
      { label: "Add New Users", href: "/dashboard/user-management/add-user" },
      { label: "User List", href: "/dashboard/user-management/user-list" },
    ],
  },
];

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: <IconDashboard /> },
  { label: "Quick Sale", href: "/dashboard/pos", icon: <IconPOS /> },
  // { label: "Inventory", href: "/dashboard/inventory", icon: <IconInventory /> },
  { label: "Reports", href: "/dashboard/reports", icon: <IconReports /> },
  { label: "Settings", href: "/dashboard/settings", icon: <IconSettings /> },
];

export default function Sidebar({ mobileOpen = false, onClose }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [productsOpen, setProductsOpen] = useState(() => false);
  const [purchaseOpen, setPurchaseOpen] = useState(() => false);
  const [salesOpen, setSalesOpen] = useState(() => false);
  const [customersOpen, setCustomersOpen] = useState(() => false);
  const [salesPersonOpen, setSalesPersonOpen] = useState(() => false);
  const [quotationOpen, setQuotationOpen] = useState(() => false);
  const [warrantyOpen, setWarrantyOpen] = useState(() => false);
  const [suppliersOpen, setSuppliersOpen] = useState(() => false);
  const [accountingOpen, setAccountingOpen] = useState(() => false);
  const [bankingOpen, setBankingOpen] = useState(() => false);
  const [hrmOpen, setHrmOpen] = useState(() => false);
  const [salaryOpen, setSalaryOpen] = useState(() => false);
  const [gstReportOpen, setGstReportOpen] = useState(() => false);
  const [loanOpen, setLoanOpen] = useState(() => false);
  const [reportOpen, setReportOpen] = useState(() => false);
  const [smsEmailOpen, setSmsEmailOpen] = useState(() => false);
  const [taskOpen, setTaskOpen] = useState(() => false);
  const [userMgmtOpen, setUserMgmtOpen] = useState(() => false);

  const isProductsActive = pathname.startsWith("/dashboard/products");
  const isPurchaseActive = pathname.startsWith("/dashboard/purchase");
  const isSalesActive = pathname.startsWith("/dashboard/sales");
  const isCustomersActive = pathname.startsWith("/dashboard/customers");
  const isSalesPersonActive = pathname.startsWith("/dashboard/salesperson");
  const isQuotationActive = pathname.startsWith("/dashboard/quotation");
  const isWarrantyActive = pathname.startsWith("/dashboard/warranty");
  const isSuppliersActive = pathname.startsWith("/dashboard/suppliers");
  const isAccountingActive = pathname.startsWith("/dashboard/accounting");
  const isBankingActive = pathname.startsWith("/dashboard/banking");
  const isHrmActive = pathname.startsWith("/dashboard/hrm");
  const isSalaryActive = pathname.startsWith("/dashboard/salary");
  const isGstReportActive = pathname.startsWith("/dashboard/gst-report");
  const isLoanActive = pathname.startsWith("/dashboard/loan");
  const isReportActive = pathname.startsWith("/dashboard/report");
  const isSmsEmailActive = pathname.startsWith("/dashboard/sms-email");
  const isTaskActive = pathname.startsWith("/dashboard/task");
  const isUserMgmtActive = pathname.startsWith("/dashboard/user-management");

  // Sync accordion open state when navigating to a sub-route
  useEffect(() => {
    if (isProductsActive) setProductsOpen(true);
    if (isPurchaseActive) setPurchaseOpen(true);
    if (isSalesActive) setSalesOpen(true);
    if (isCustomersActive) setCustomersOpen(true);
    if (isSalesPersonActive) setSalesPersonOpen(true);
    if (isQuotationActive) setQuotationOpen(true);
    if (isWarrantyActive) setWarrantyOpen(true);
    if (isSuppliersActive) setSuppliersOpen(true);
    if (isAccountingActive) setAccountingOpen(true);
    if (isBankingActive) setBankingOpen(true);
    if (isHrmActive) setHrmOpen(true);
    if (isSalaryActive) setSalaryOpen(true);
    if (isGstReportActive) setGstReportOpen(true);
    if (isLoanActive) setLoanOpen(true);
    if (isReportActive) setReportOpen(true);
    if (isSmsEmailActive) setSmsEmailOpen(true);
    if (isTaskActive) setTaskOpen(true);
    if (isUserMgmtActive) setUserMgmtOpen(true);
    // Close sidebar on mobile after navigation
    onClose?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-[#1E3A8A] text-white flex flex-col h-screen
        fixed top-0 left-0 z-40 shadow-xl
        transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:sticky lg:inset-auto`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-blue-700 shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-[#1E3A8A]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-wide">POS Pro</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-blue-700 transition-colors lg:hidden"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Desktop collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-blue-700 transition-colors hidden lg:block"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {collapsed ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">

        {/* Dashboard & POS */}
        {navItems.slice(0, 2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : ""}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive(item.href)
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
          </Link>
        ))}


        {/* Sales Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setSalesOpen(!salesOpen)}
            title={collapsed ? "Sales" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isSalesActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0"><IconSales /></span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Sales</span>
                <IconChevron open={salesOpen} />
              </>
            )}
          </button>

          {!collapsed && salesOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {salesSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">
                    {section.group}
                  </p>
                  {section.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href)
                          ? "bg-blue-500 text-white font-semibold"
                          : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

           {/* Suppliers Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setSuppliersOpen(!suppliersOpen)}
            title={collapsed ? "Suppliers" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isSuppliersActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0"><IconSuppliers /></span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Suppliers</span>
                <IconChevron open={suppliersOpen} />
              </>
            )}
          </button>

          {/* Dropdown */}
          {!collapsed && suppliersOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {supplierSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">
                    {section.group}
                  </p>
                  {section.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href)
                          ? "bg-blue-500 text-white font-semibold"
                          : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setProductsOpen(!productsOpen)}
            title={collapsed ? "Products" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isProductsActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0"><IconProduct /></span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Products</span>
                <IconChevron open={productsOpen} />
              </>
            )}
          </button>

          {/* Dropdown */}
          {!collapsed && productsOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {productSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">
                    {section.group}
                  </p>
                  {section.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href)
                          ? "bg-blue-500 text-white font-semibold"
                          : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>



        {/* Purchase Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setPurchaseOpen(!purchaseOpen)}
            title={collapsed ? "Purchase" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isPurchaseActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0"><IconPurchase /></span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Purchase</span>
                <IconChevron open={purchaseOpen} />
              </>
            )}
          </button>

          {!collapsed && purchaseOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {purchaseSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">
                    {section.group}
                  </p>
                  {section.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href)
                          ? "bg-blue-500 text-white font-semibold"
                          : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

         {/* Warranty Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setWarrantyOpen(!warrantyOpen)}
            title={collapsed ? "Warranty" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isWarrantyActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Warranty</span>
                <IconChevron open={warrantyOpen} />
              </>
            )}
          </button>

          {!collapsed && warrantyOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {warrantySubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">
                    {section.group}
                  </p>
                  {section.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href)
                          ? "bg-blue-500 text-white font-semibold"
                          : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

          {/* Quotation Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setQuotationOpen(!quotationOpen)}
            title={collapsed ? "Quotation" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isQuotationActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Quotation</span>
                <IconChevron open={quotationOpen} />
              </>
            )}
          </button>

          {!collapsed && quotationOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {quotationSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">
                    {section.group}
                  </p>
                  {section.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href)
                          ? "bg-blue-500 text-white font-semibold"
                          : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory */}
        {/* {navItems.slice(2, 3).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : ""}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive(item.href)
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
          </Link>
        ))} */}

       

        {/* Customers Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setCustomersOpen(!customersOpen)}
            title={collapsed ? "Customers" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isCustomersActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0"><IconCustomers /></span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Customers</span>
                <IconChevron open={customersOpen} />
              </>
            )}
          </button>

          {!collapsed && customersOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {customerSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">
                    {section.group}
                  </p>
                  {section.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href)
                          ? "bg-blue-500 text-white font-semibold"
                          : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

     

        {/* Sales Person Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setSalesPersonOpen(!salesPersonOpen)}
            title={collapsed ? "Sales Person" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isSalesPersonActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Sales Person</span>
                <IconChevron open={salesPersonOpen} />
              </>
            )}
          </button>

          {!collapsed && salesPersonOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {salesPersonSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">
                    {section.group}
                  </p>
                  {section.items.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href)
                          ? "bg-blue-500 text-white font-semibold"
                          : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />
                      {sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

       

       

        {/* Accounting Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setAccountingOpen(!accountingOpen)}
            title={collapsed ? "Accounting" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isAccountingActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Accounting</span>
                <IconChevron open={accountingOpen} />
              </>
            )}
          </button>
          {!collapsed && accountingOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {accountingSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">{section.group}</p>
                  {section.items.map((sub) => (
                    <Link key={sub.href} href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href) ? "bg-blue-500 text-white font-semibold" : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}>
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />{sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Banking Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setBankingOpen(!bankingOpen)}
            title={collapsed ? "Banking" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isBankingActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Banking</span>
                <IconChevron open={bankingOpen} />
              </>
            )}
          </button>
          {!collapsed && bankingOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {bankingSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">{section.group}</p>
                  {section.items.map((sub) => (
                    <Link key={sub.href} href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href) ? "bg-blue-500 text-white font-semibold" : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}>
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />{sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HRM Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setHrmOpen(!hrmOpen)}
            title={collapsed ? "HRM" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isHrmActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">HRM</span>
                <IconChevron open={hrmOpen} />
              </>
            )}
          </button>
          {!collapsed && hrmOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {hrmSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">{section.group}</p>
                  {section.items.map((sub) => (
                    <Link key={sub.href} href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href) ? "bg-blue-500 text-white font-semibold" : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}>
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />{sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Salary Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setSalaryOpen(!salaryOpen)}
            title={collapsed ? "Salary" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isSalaryActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Salary</span>
                <IconChevron open={salaryOpen} />
              </>
            )}
          </button>
          {!collapsed && salaryOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {salarySubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">{section.group}</p>
                  {section.items.map((sub) => (
                    <Link key={sub.href} href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href) ? "bg-blue-500 text-white font-semibold" : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}>
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />{sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GST Report Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setGstReportOpen(!gstReportOpen)}
            title={collapsed ? "GST Report" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isGstReportActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">GST Report</span>
                <IconChevron open={gstReportOpen} />
              </>
            )}
          </button>
          {!collapsed && gstReportOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {gstReportSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">{section.group}</p>
                  {section.items.map((sub) => (
                    <Link key={sub.href} href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href) ? "bg-blue-500 text-white font-semibold" : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}>
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />{sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loan Management Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setLoanOpen(!loanOpen)}
            title={collapsed ? "Loan Management" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isLoanActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Loan Management</span>
                <IconChevron open={loanOpen} />
              </>
            )}
          </button>
          {!collapsed && loanOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {loanSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">{section.group}</p>
                  {section.items.map((sub) => (
                    <Link key={sub.href} href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href) ? "bg-blue-500 text-white font-semibold" : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}>
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />{sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setReportOpen(!reportOpen)}
            title={collapsed ? "Report" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isReportActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Report</span>
                <IconChevron open={reportOpen} />
              </>
            )}
          </button>
          {!collapsed && reportOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {reportSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">{section.group}</p>
                  {section.items.map((sub) => (
                    <Link key={sub.href} href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href) ? "bg-blue-500 text-white font-semibold" : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}>
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />{sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SMS & Email Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setSmsEmailOpen(!smsEmailOpen)}
            title={collapsed ? "SMS & Email" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isSmsEmailActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">SMS & Email</span>
                <IconChevron open={smsEmailOpen} />
              </>
            )}
          </button>
          {!collapsed && smsEmailOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {smsEmailSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">{section.group}</p>
                  {section.items.map((sub) => (
                    <Link key={sub.href} href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href) ? "bg-blue-500 text-white font-semibold" : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}>
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />{sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Management Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setTaskOpen(!taskOpen)}
            title={collapsed ? "Task Management" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isTaskActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Task Management</span>
                <IconChevron open={taskOpen} />
              </>
            )}
          </button>
          {!collapsed && taskOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {taskSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">{section.group}</p>
                  {section.items.map((sub) => (
                    <Link key={sub.href} href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href) ? "bg-blue-500 text-white font-semibold" : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}>
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />{sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Management Accordion */}
        <div>
          <button
            onClick={() => !collapsed && setUserMgmtOpen(!userMgmtOpen)}
            title={collapsed ? "User Management" : ""}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isUserMgmtActive
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </span>
            {!collapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">User Management</span>
                <IconChevron open={userMgmtOpen} />
              </>
            )}
          </button>
          {!collapsed && userMgmtOpen && (
            <div className="mt-1 ml-3 border-l-2 border-blue-500 pl-2 space-y-0.5">
              {userManagementSubItems.map((section) => (
                <div key={section.group}>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 px-2 py-1.5 mt-1">{section.group}</p>
                  {section.items.map((sub) => (
                    <Link key={sub.href} href={sub.href}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all duration-150 ${
                        isActive(sub.href) ? "bg-blue-500 text-white font-semibold" : "text-blue-200 hover:bg-blue-700 hover:text-white"
                      }`}>
                      <span className="w-1 h-1 rounded-full bg-current shrink-0" />{sub.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reports, Settings */}
        {navItems.slice(3).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : ""}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive(item.href)
                ? "bg-white text-[#1E3A8A] font-semibold shadow-md"
                : "text-blue-100 hover:bg-blue-700 hover:text-white"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-blue-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">Admin</p>
              <p className="text-xs text-blue-300 truncate">admin@pos.com</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}