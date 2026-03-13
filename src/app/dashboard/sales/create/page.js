"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// ─── Item row ──────────────────────────────────────────────────────────────────
function ItemRow({ item, products, onSelectProduct, onUpdate, onRemove }) {
  const [open, setOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const [ddPos, setDdPos] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setLocalSearch("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Close dropdown on scroll so fixed-position list doesn't drift
  useEffect(() => {
    if (!open) return;
    const close = () => { setOpen(false); setLocalSearch(""); };
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [open]);

  const openDropdown = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setDdPos({ top: r.bottom, left: r.left, width: r.width });
    }
    setLocalSearch("");
    setOpen(true);
  };

  const sugg = localSearch.trim()
    ? products
        .filter((p) => p.name.toLowerCase().includes(localSearch.toLowerCase()))
        .sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(localSearch.toLowerCase());
          const bStarts = b.name.toLowerCase().startsWith(localSearch.toLowerCase());
          if (aStarts !== bStarts) return bStarts - aStarts;
          return a.name.localeCompare(b.name);
        })
    : products;

  const unitP     = parseFloat(item.unitPrice) || 0;
  const discItem  = parseFloat(item.discItem)  || 0;
  const qty       = parseFloat(item.qty)       || 0;
  const afterDisc = Math.max(0, unitP - discItem);
  const total     = qty * afterDisc;

  const hasDiscount = parseFloat(item.discItem) > 0;

  return (
    <tr className={`border-b border-gray-200 ${hasDiscount ? 'bg-green-50' : ''}`}>
      <td className="px-2 sm:px-3 py-2">
        <div className="relative" ref={ref}>
          <div className={`flex items-center border rounded-lg bg-white hover:border-blue-400 transition-colors ${hasDiscount ? 'border-green-400 ring-1 ring-green-200' : 'border-gray-300'}`}>
            <input type="text"
              value={open ? localSearch : item.productSearch}
              autoComplete="off"
              onChange={(e) => { setLocalSearch(e.target.value); if (!open) openDropdown(); }}
              onFocus={openDropdown}
              placeholder="Item..."
              className="flex-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm outline-none bg-transparent min-w-0 font-medium text-gray-900" />
            <button type="button" onClick={() => open ? (setOpen(false), setLocalSearch("")) : openDropdown()}
              className="px-2 sm:px-3 text-gray-400 hover:text-gray-600 border-l transition-colors" style={{borderLeftColor: hasDiscount ? '#86efac' : '#d1d5db'}}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {open && sugg.length > 0 && ddPos && (
            <ul style={{ position: "fixed", top: ddPos.top, left: ddPos.left, width: ddPos.width, zIndex: 9999 }}
              className="bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {sugg.map((p, i) => (
                <li key={i} onMouseDown={() => { onSelectProduct(p); setOpen(false); setLocalSearch(""); }}
                  className="px-3 py-2.5 cursor-pointer hover:bg-blue-50 flex items-center gap-3 text-xs sm:text-sm border-b border-gray-100 last:border-b-0 transition-colors">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="w-7 h-7 sm:w-8 sm:h-8 rounded object-cover border border-gray-100 shrink-0" />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-gray-100 flex items-center justify-center shrink-0 text-sm">
                      <span>📦</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 truncate">{p.name}</p>
                    {p.category?.name && <p className="text-xs text-gray-500">{p.category.name}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold" style={{color:"#1E3A8A"}}>৳{p.sellingPrice || 0}</p>
                    <p className="text-xs text-gray-500">{p.stock ?? "—"} qty</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </td>
      <td className="px-1 sm:px-2 py-2 w-16 sm:w-24">
        <input type="text" value={item.wty} onChange={(e) => onUpdate("wty", e.target.value)}
          placeholder="wty" className="w-full border border-gray-300 rounded px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm bg-gray-50 text-center outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
      </td>
      <td className="px-1 sm:px-2 py-2 w-14 sm:w-20">
        <input type="number" min="1" value={item.qty} onChange={(e) => onUpdate("qty", e.target.value)}
          className="w-full border border-gray-300 rounded px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm text-center outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
      </td>
      <td className="px-1 sm:px-2 py-2 w-20 sm:w-28">
        <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => onUpdate("unitPrice", e.target.value)}
          placeholder="0" className="w-full border border-gray-300 rounded px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm text-center outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
      </td>
      <td className="px-1 sm:px-2 py-2 w-20 sm:w-28">
        <input type="number" min="0" step="0.01" value={item.discItem} onChange={(e) => onUpdate("discItem", e.target.value)}
          placeholder="0" className={`w-full border rounded px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm text-center outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${hasDiscount ? 'border-green-400 bg-green-50 font-semibold text-green-700' : 'border-gray-300'}`} />
      </td>
      <td className="px-1 sm:px-2 py-2 w-20 sm:w-28">
        <div className="w-full border border-gray-200 rounded px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm text-center bg-gray-50 font-medium outline-none cursor-default" style={{color:"#1E3A8A"}}>
          {afterDisc.toFixed(2)}
        </div>
      </td>
      <td className="px-1 sm:px-2 py-2 w-20 sm:w-28">
        <div className="w-full border border-gray-200 rounded px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm text-center bg-gray-50 font-bold outline-none cursor-default">
          {total.toFixed(2)}
        </div>
      </td>
      <td className="px-1 py-2 w-12 text-center">
        <div className="flex flex-col items-center gap-1">
          {hasDiscount && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-500 text-white rounded-full whitespace-nowrap">Paid</span>
          )}
          <button type="button" onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg transition-colors mx-auto text-sm font-bold leading-none active:scale-95">
            −
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CreateSalesPage() {
  const router = useRouter();
  const rowCounter = useRef(0);
  const newRow = () => ({
    id: ++rowCounter.current,
    productSearch: "", product: null, wty: "", qty: "1", unitPrice: "0", discItem: "0",
  });

  const [customers,    setCustomers]    = useState([]);
  const [products,     setProducts]     = useState([]);
  const [saving,       setSaving]       = useState(false);
  const [holding,      setHolding]      = useState(false);
  const [error,        setError]        = useState("");

  const [custOpen,     setCustOpen]     = useState(false);
  const [custSearch,   setCustSearch]   = useState("");
  const [selectedCust, setSelectedCust] = useState(null);
  const custRef = useRef(null);

  const [status,   setStatus]   = useState("completed");
  const [custInfo, setCustInfo] = useState({ name: "", mobile: "", salesPer: "", comm: "0" });
  const [scanVal,  setScanVal]  = useState("");
  const [items,    setItems]    = useState(() => [newRow()]);
  const [pay,      setPay]      = useState({ overallDiscount: "0", deliveryCost: "0", payVia: "cash", paid: "0.00", notes: "" });

  useEffect(() => {
    api.getCustomers().then((r) => setCustomers(r.data)).catch(() => {});
    api.getProducts().then((r) => setProducts((r.data || []).filter((p) => p.stock > 0))).catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => { if (custRef.current && !custRef.current.contains(e.target)) setCustOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filteredCusts = custSearch.trim()
    ? customers.filter((c) =>
        c.name.toLowerCase().includes(custSearch.toLowerCase()) ||
        (c.phone || "").includes(custSearch)
      )
    : customers;

  const selectCustomer = (c) => {
    setSelectedCust(c);
    setCustSearch(c.name);
    setCustInfo({ name: c.name, mobile: c.phone || c.mobile || "", salesPer: "", comm: "0" });
    setCustOpen(false);
  };

  const pushProduct = (prod) => {
    setItems((prev) => {
      const emptyIdx = prev.findIndex((it) => !it.product);
      if (emptyIdx !== -1) {
        const updated = [...prev];
        updated[emptyIdx] = { ...updated[emptyIdx], productSearch: prod.name, product: prod, unitPrice: String(prod.sellingPrice || "0"), wty: String(prod.warranty || "") };
        return updated;
      }
      return [...prev, { id: ++rowCounter.current, productSearch: prod.name, product: prod, wty: String(prod.warranty || ""), qty: "1", unitPrice: String(prod.sellingPrice || "0"), discItem: "0" }];
    });
  };

  const handleScan = (e) => {
    if (e.key !== "Enter" || !scanVal.trim()) return;
    setError("");
    const found = products.find((p) =>
      (p.barcode || "").toLowerCase() === scanVal.trim().toLowerCase() ||
      p.name.toLowerCase() === scanVal.trim().toLowerCase()
    );
    if (found) { pushProduct(found); setScanVal(""); }
    else setError(`Product "${scanVal}" not found`);
  };

  const selectProduct = (idx, prod) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], productSearch: prod.name, product: prod, unitPrice: String(prod.sellingPrice || "0"), wty: String(prod.warranty || "") };
      return updated;
    });
  };

  const updateItem = (idx, field, val) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[idx] = field === "productSearch"
        ? { ...updated[idx], productSearch: val, product: null }
        : { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const addRow    = () => setItems((prev) => [...prev, newRow()]);
  const removeRow = (idx) => setItems((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);

  const rowTotal    = (it) => (parseFloat(it.qty) || 0) * Math.max(0, (parseFloat(it.unitPrice) || 0) - (parseFloat(it.discItem) || 0));
  const itemTotal   = items.reduce((s, it) => s + rowTotal(it), 0);
  const overallDisc = Math.max(0, itemTotal * (parseFloat(pay.overallDiscount) || 0) / 100);
  const delivery    = parseFloat(pay.deliveryCost)    || 0;
  const grandTotal  = Math.max(0, itemTotal - overallDisc + delivery);
  const handleAutoFillPaid = () => setPay({ ...pay, paid: grandTotal.toFixed(2) });
  const paidAmt     = parseFloat(pay.paid) || 0;
  const due         = Math.max(0, grandTotal - paidAmt);
  const change_     = Math.max(0, paidAmt - grandTotal);
  const totalQty    = items.reduce((s, it) => s + (parseFloat(it.qty) || 0), 0);

  // Auto-fill paid amount with grand total
  useEffect(() => {
    setPay((prevPay) => ({ ...prevPay, paid: grandTotal.toFixed(2) }));
  }, [grandTotal]);

  const handleSave = async (status) => {
    const valid = items.filter((it) => it.product);
    if (!valid.length) { setError("Add at least one product."); return; }
    const set = status === "hold" ? setHolding : setSaving;
    set(true); setError("");
    try {
      await api.createSale({
        customer: selectedCust?._id || undefined,
        customerName: custInfo.name || "Walk-in Customer",
        items: valid.map((it) => ({
          product: it.product._id,
          quantity: parseFloat(it.qty) || 1,
          unitPrice: parseFloat(it.unitPrice) || 0,
          discount: parseFloat(it.discItem) || 0,
        })),
        paidAmount: paidAmt,
        discountAmount: overallDisc,
        taxAmount: delivery,
        paymentMethod: pay.payVia,
        status,
        notes: pay.notes,
      });
      
      // Redirect based on status and due amount
      if (status === "hold") {
        router.push("/dashboard/sales/list-hold");
      } else if (due > 0) {
        router.push("/dashboard/sales/list-due");
      } else {
        router.push("/dashboard/sales/list");
      }
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      set(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-32 sm:pb-20">

      {/* ── Top Header ── */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-3">
        <h1 className="text-base sm:text-lg font-bold mb-3" style={{color:"#1E3A8A"}}>Sell Invoice</h1>

        <div className="space-y-3 sm:space-y-0">

          {/* Row 1: Customer Name | Scan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Customer Name</label>
            <div className="relative" ref={custRef}>
              <div className="flex items-center border border-gray-300 rounded bg-white">
                <input type="text" value={custSearch} autoComplete="off"
                  onChange={(e) => { setCustSearch(e.target.value); setCustOpen(true); setSelectedCust(null); }}
                  onFocus={() => setCustOpen(true)}
                  placeholder="default_customer"
                  className="flex-1 px-2 py-1.5 text-sm outline-none bg-transparent" />
                <button type="button" onClick={() => setCustOpen((v) => !v)} className="px-3 border-l border-gray-300 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
              {custOpen && (
                <ul className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-white border border-gray-300 shadow-xl max-h-52 overflow-y-auto">
                  {filteredCusts.length === 0
                    ? <li className="px-3 py-2 text-sm text-gray-400">No customers found</li>
                    : filteredCusts.map((c, i) => (
                      <li key={i} onMouseDown={() => selectCustomer(c)}
                        className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm">
                        <span className="font-medium text-gray-800">{c.name}</span>
                        {c.phone && <span className="text-gray-400 ml-2 text-xs">{c.phone}</span>}
                      </li>
                    ))
                  }
                </ul>
              )}
            </div>
          </div>

          {/* Scan */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Scan Product</label>
            <input type="text" value={scanVal} autoComplete="off"
              onChange={(e) => { setScanVal(e.target.value); setError(""); }}
              onKeyDown={handleScan}
              placeholder="Scan barcode..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all" />
          </div>
          </div>
          
          {/* Row 2: Customer Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" value={custInfo.name}
              onChange={(e) => setCustInfo({ ...custInfo, name: e.target.value })}
              placeholder="Enter name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all" />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
            <input type="text" value={custInfo.mobile}
              onChange={(e) => setCustInfo({ ...custInfo, mobile: e.target.value })}
              placeholder="Mobile"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all" />
          </div>

          {/* Sales Person */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Salesperson</label>
            <input type="text" value={custInfo.salesPer}
              onChange={(e) => setCustInfo({ ...custInfo, salesPer: e.target.value })}
              placeholder="Name/ID"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all" />
          </div>

          {/* Comm */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Comm</label>
            <input type="number" value={custInfo.comm}
              onChange={(e) => setCustInfo({ ...custInfo, comm: e.target.value })}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all" />
          </div>
        </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mx-3 sm:mx-4 mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
          <span className="flex-1 leading-relaxed">{error}</span>
          <button onClick={() => setError("")} className="font-bold text-red-500 hover:text-red-700 transition-colors shrink-0">✕</button>
        </div>
      )}

      {/* ── Items Table ── */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto flex-1">
        <div className="min-w-max sm:min-w-0">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-300 bg-gray-50 sticky top-0">
              <th className="text-left text-xs font-bold text-gray-700 px-2 sm:px-3 py-2.5">Item</th>
              <th className="text-center text-xs font-bold text-gray-700 px-1 sm:px-2 py-2.5 w-16 sm:w-24">Wty</th>
              <th className="text-center text-xs font-bold text-gray-700 px-1 sm:px-2 py-2.5 w-14 sm:w-20">Qty</th>
              <th className="text-center text-xs font-bold text-gray-700 px-1 sm:px-2 py-2.5 w-20 sm:w-28">Price</th>
              <th className="text-center text-xs font-bold text-gray-700 px-1 sm:px-2 py-2.5 w-20 sm:w-28">Disc</th>
              <th className="text-center text-xs font-bold text-gray-700 px-1 sm:px-2 py-2.5 w-20 sm:w-28">After</th>
              <th className="text-center text-xs font-bold text-gray-700 px-1 sm:px-2 py-2.5 w-20 sm:w-28">Total</th>
              <th className="text-center text-xs font-bold text-gray-700 px-1 py-2.5 w-12">Act</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <ItemRow
                key={item.id}
                item={item}
                products={products}
                onSelectProduct={(prod) => selectProduct(idx, prod)}
                onUpdate={(field, val) => updateItem(idx, field, val)}
                onRemove={() => removeRow(idx)}
              />
            ))}
            {/* Add Row Button */}
            <tr className="border-t border-gray-300 bg-gray-50 h-12">
              <td colSpan="8" className="px-2 sm:px-3 py-2">
                <button type="button" onClick={addRow}
                  className="w-8 h-8 flex items-center justify-center bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-lg text-lg font-bold leading-none transition-colors duration-200 active:scale-95">
                  +
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        </div>

        {/* Qty count */}
        <div className="flex items-center px-3 sm:px-4 py-2.5 bg-gray-50 border-t border-gray-200">
          <span className="text-xs sm:text-sm font-bold text-gray-800">
            Total: {totalQty.toFixed(2)} qty <span className="text-gray-500 font-normal">/ {items.length} rows</span>
          </span>
        </div>
      </div>

      {/* ── Payment Section ── */}
      <div className="bg-white border-t border-gray-200">

        {/* Row 1: Item Total | Overall Discount (%) | Delivery Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-gray-200 p-3 sm:p-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Item Total</label>
            <div className="text-2xl sm:text-3xl font-bold" style={{color:"#1E3A8A"}}>
              ৳{itemTotal.toFixed(2)}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Discount (%)</label>
            <div className="flex items-center gap-2">
              <input type="number" min="0" max="100" step="0.01" value={pay.overallDiscount}
                onChange={(e) => setPay({ ...pay, overallDiscount: e.target.value })}
                placeholder="0"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              <div className="text-right">
                <div className="text-xs text-gray-600">= ৳</div>
                <div className="font-bold" style={{color:"#1E3A8A"}}>{overallDisc.toFixed(2)}</div>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Delivery</label>
            <input type="number" min="0" step="0.01" value={pay.deliveryCost}
              onChange={(e) => setPay({ ...pay, deliveryCost: e.target.value })}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          </div>
        </div>

        {/* Row 2: Pay via | Status | Paid | Due */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-b border-gray-200 p-3 sm:p-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pay via</label>
            <select value={pay.payVia} onChange={(e) => setPay({ ...pay, payVia: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile Banking</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          {/* <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5\">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white transition-all\">
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="hold">Hold</option>
              <option value="instalment">Instalment</option>
            </select>
          </div> */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Paid Amount</label>
            <div className="flex gap-2">
              <input type="number" min="0" step="0.01" value={pay.paid}
                onChange={(e) => setPay({ ...pay, paid: e.target.value })}
                placeholder="0.00"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
              <button type="button" onClick={handleAutoFillPaid}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors duration-200 active:scale-95 whitespace-nowrap">
                Auto
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Due Amount</label>
            <div className="w-full bg-yellow-400 hover:bg-yellow-500 rounded-lg px-3 py-2 text-sm font-bold text-white text-center transition-colors">
              ৳{due.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Row 3: Notes | Change */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 p-3 sm:p-4">
          <div className="lg:col-span-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes (Optional)</label>
            <textarea value={pay.notes} onChange={(e) => setPay({ ...pay, notes: e.target.value })}
              rows={2} placeholder="Add any notes here..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Change</label>
            <div className="w-full bg-[#1E3A8A] hover:bg-blue-900 rounded-lg px-3 py-2 text-sm font-bold text-white text-center transition-colors">
              ৳{change_.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 flex flex-col sm:flex-row h-auto sm:h-16 z-50 border-t border-gray-200 bg-white shadow-lg">
        <div className="w-full sm:flex-1 flex items-center justify-center px-4 py-4 sm:py-0 text-white text-2xl sm:text-3xl font-bold rounded-t-lg sm:rounded-none transition-all" style={{background:"#1E3A8A"}}>
          ৳{grandTotal.toFixed(2)}
        </div>
        <div className="flex gap-2 sm:gap-0 px-4 sm:px-0 pb-3 sm:pb-0">
        <button type="button" onClick={() => handleSave("completed")} disabled={saving || holding}
          className="flex-1 sm:flex-none sm:w-40 lg:w-48 flex items-center justify-center bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded sm:rounded-none h-11 sm:h-16 active:scale-95">
          {saving ? "SAVING..." : "CREATE"}
        </button>
        <button type="button" onClick={() => handleSave("hold")} disabled={holding || saving}
          className="flex-1 sm:flex-none sm:w-32 lg:w-36 flex items-center justify-center bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white text-xs sm:text-sm font-bold uppercase tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded sm:rounded-none h-11 sm:h-16 active:scale-95">
          {holding ? "..." : "HOLD"}
        </button>
        </div>
      </div>

    </div>
  );
}
