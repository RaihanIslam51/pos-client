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
    ? products.filter((p) => p.name.toLowerCase().includes(localSearch.toLowerCase()))
    : products;

  const unitP     = parseFloat(item.unitPrice) || 0;
  const discItem  = parseFloat(item.discItem)  || 0;
  const qty       = parseFloat(item.qty)       || 0;
  const afterDisc = Math.max(0, unitP - discItem);
  const total     = qty * afterDisc;

  return (
    <tr className="border-b border-gray-200">
      <td className="px-2 py-1.5">
        <div className="relative" ref={ref}>
          <div className="flex items-center border border-gray-300 rounded bg-white">
            <input type="text"
              value={open ? localSearch : item.productSearch}
              autoComplete="off"
              onChange={(e) => { setLocalSearch(e.target.value); if (!open) openDropdown(); }}
              onFocus={openDropdown}
              placeholder="Search for an item..."
              className="flex-1 px-2 py-1.5 text-sm outline-none bg-transparent min-w-0" />
            <button type="button" onClick={() => open ? (setOpen(false), setLocalSearch("")) : openDropdown()}
              className="px-2 text-gray-400 border-l border-gray-300">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          {open && sugg.length > 0 && ddPos && (
            <ul style={{ position: "fixed", top: ddPos.top, left: ddPos.left, width: ddPos.width, zIndex: 9999 }}
              className="bg-white border border-gray-300 shadow-xl max-h-52 overflow-y-auto">
              {sugg.map((p, i) => (
                <li key={i} onMouseDown={() => { onSelectProduct(p); setOpen(false); setLocalSearch(""); }}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-50 flex items-center gap-3 text-sm">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded object-cover border border-gray-100 shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                      <span className="text-sm">📦</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 truncate">{p.name}</p>
                    {p.category?.name && <p className="text-xs text-gray-400">{p.category.name}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#1E3A8A]">৳{p.sellingPrice || 0}</p>
                    <p className="text-xs text-gray-400">{p.stock ?? "—"} in stock</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </td>
      <td className="px-2 py-1.5 w-24">
        <input type="text" value={item.wty} onChange={(e) => onUpdate("wty", e.target.value)}
          placeholder="wty" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm bg-gray-50 text-center outline-none focus:border-blue-400" />
      </td>
      <td className="px-2 py-1.5 w-20">
        <input type="number" min="1" value={item.qty} onChange={(e) => onUpdate("qty", e.target.value)}
          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-center outline-none focus:border-blue-400" />
      </td>
      <td className="px-2 py-1.5 w-28">
        <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => onUpdate("unitPrice", e.target.value)}
          placeholder="0" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-center outline-none focus:border-blue-400" />
      </td>
      <td className="px-2 py-1.5 w-28">
        <input type="number" min="0" step="0.01" value={item.discItem} onChange={(e) => onUpdate("discItem", e.target.value)}
          placeholder="0" className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-center outline-none focus:border-blue-400" />
      </td>
      <td className="px-2 py-1.5 w-28">
        <input type="text" readOnly value={afterDisc.toFixed(2)}
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-center bg-gray-100 text-[#1E3A8A] font-medium outline-none cursor-default" />
      </td>
      <td className="px-2 py-1.5 w-28">
        <input type="text" readOnly value={total.toFixed(2)}
          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm text-center bg-gray-100 font-medium outline-none cursor-default" />
      </td>
      <td className="px-2 py-1.5 w-16 text-center">
        <button type="button" onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded transition-colors mx-auto text-lg font-bold leading-none">
          −
        </button>
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
  const overallDisc = parseFloat(pay.overallDiscount) || 0;
  const delivery    = parseFloat(pay.deliveryCost)    || 0;
  const grandTotal  = Math.max(0, itemTotal - overallDisc + delivery);
  const paidAmt     = parseFloat(pay.paid) || 0;
  const due         = Math.max(0, grandTotal - paidAmt);
  const change_     = Math.max(0, paidAmt - grandTotal);
  const totalQty    = items.reduce((s, it) => s + (parseFloat(it.qty) || 0), 0);

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
      router.push("/dashboard/sales/list");
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      set(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-white pb-14">

      {/* ── Top Header ── */}
      <div className="bg-white border-b border-gray-200 px-4 pt-3 pb-3">
        <h1 className="text-sm font-bold mb-2" style={{color:"#1E3A8A"}}>Sell Invoice</h1>

        <div className="flex flex-wrap items-end gap-x-4 gap-y-2">

          {/* Customer Name */}
          <div>
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs font-semibold text-gray-700">Customer Name</span>
             
            </div>
            <div className="relative w-56" ref={custRef}>
              <div className="flex items-center border border-gray-300 rounded bg-white">
                <input type="text" value={custSearch} autoComplete="off"
                  onChange={(e) => { setCustSearch(e.target.value); setCustOpen(true); setSelectedCust(null); }}
                  onFocus={() => setCustOpen(true)}
                  placeholder="default_customer"
                  className="flex-1 px-2 py-1.5 text-sm outline-none bg-transparent" />
                <button type="button" onClick={() => setCustOpen((v) => !v)} className="px-2 border-l border-gray-300 text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
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
            <div className="h-6 mb-1" />
            <input type="text" value={scanVal} autoComplete="off"
              onChange={(e) => { setScanVal(e.target.value); setError(""); }}
              onKeyDown={handleScan}
              placeholder="scan product..."
              className="border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 bg-white w-40" />
          </div>

          <div className="flex-1" />

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Name<span className="text-red-500">*</span> :
            </label>
            <input type="text" value={custInfo.name}
              onChange={(e) => setCustInfo({ ...custInfo, name: e.target.value })}
              placeholder="Name"
              className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500 bg-white w-40" />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mobile<span className="text-red-500">*</span> :
            </label>
            <input type="text" value={custInfo.mobile}
              onChange={(e) => setCustInfo({ ...custInfo, mobile: e.target.value })}
              placeholder="Mobile"
              className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500 bg-white w-36" />
          </div>

          {/* Sales Per */}
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-gray-700 mb-1">
              Sales Per
              <button type="button" className="w-4 h-4 flex items-center justify-center bg-[#1E3A8A] text-white rounded text-xs font-bold leading-none">+</button>
              <span className="text-red-500">*</span> :
            </label>
            <div className="flex items-center border border-gray-300 rounded bg-white w-40">
              <input type="text" value={custInfo.salesPer}
                onChange={(e) => setCustInfo({ ...custInfo, salesPer: e.target.value })}
                placeholder="Salesperson 5"
                className="flex-1 px-2 py-1.5 text-sm outline-none bg-transparent" />
              <button type="button" className="px-2 border-l border-gray-300 text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>

          {/* Comm */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Comm<span className="text-red-500">*</span> :
            </label>
            <input type="number" value={custInfo.comm}
              onChange={(e) => setCustInfo({ ...custInfo, comm: e.target.value })}
              placeholder="0"
              className="border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500 bg-white w-20" />
          </div>

        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mx-4 mt-2 flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="font-bold text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* ── Items Table ── */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-white">
              <th className="text-left text-xs font-semibold text-gray-700 px-2 py-2">Item Name</th>
              <th className="text-center text-xs font-semibold text-gray-700 px-2 py-2 w-24">Wty</th>
              <th className="text-center text-xs font-semibold text-gray-700 px-2 py-2 w-20">Qty</th>
              <th className="text-center text-xs font-semibold text-gray-700 px-2 py-2 w-28">Unit Price</th>
              <th className="text-center text-xs font-semibold text-gray-700 px-2 py-2 w-28">Disc./Item</th>
              <th className="text-center text-xs font-semibold text-gray-700 px-2 py-2 w-28">After disc</th>
              <th className="text-center text-xs font-semibold text-gray-700 px-2 py-2 w-28">Total</th>
              <th className="text-center text-xs font-semibold text-gray-700 px-2 py-2 w-16">Action</th>
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
          </tbody>
        </table>

        {/* Qty count + add row */}
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="text-sm font-bold text-gray-800">
            {totalQty.toFixed(2)}
            <span className="text-gray-400 font-normal"> / {items.length}</span>
          </span>
          <button type="button" onClick={addRow}
            className="w-7 h-7 flex items-center justify-center bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-full text-xl font-bold leading-none transition-colors">
            +
          </button>
        </div>
      </div>

      {/* ── Payment Section ── */}
      <div className="bg-white mt-2">

        {/* Row 1: Item Total | Overall Discount | Delivery Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-200">
          <div className="px-4 py-3 sm:border-r border-gray-200 border-b sm:border-b-0">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Item Total</label>
            <input type="text" readOnly value={itemTotal.toFixed(2)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-100 text-center font-semibold outline-none cursor-default" />
          </div>
          <div className="px-4 py-3 sm:border-r border-gray-200 border-b sm:border-b-0">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Overall Discount</label>
            <input type="number" min="0" step="0.01" value={pay.overallDiscount}
              onChange={(e) => setPay({ ...pay, overallDiscount: e.target.value })}
              placeholder="0"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="px-4 py-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Delivery Cost</label>
            <input type="number" min="0" step="0.01" value={pay.deliveryCost}
              onChange={(e) => setPay({ ...pay, deliveryCost: e.target.value })}
              placeholder="0"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
        </div>

        {/* Row 2: Pay via | Paid | Due */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-200">
          <div className="px-4 py-3 sm:border-r border-gray-200 border-b sm:border-b-0">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Pay via</label>
            <select value={pay.payVia} onChange={(e) => setPay({ ...pay, payVia: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 bg-white">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile Banking</option>
              <option value="credit">Credit</option>
            </select>
          </div>
          <div className="px-4 py-3 sm:border-r border-gray-200 border-b sm:border-b-0">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Paid</label>
            <input type="number" min="0" step="0.01" value={pay.paid}
              onChange={(e) => setPay({ ...pay, paid: e.target.value })}
              placeholder="0.00"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="px-4 py-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Due</label>
            <div className="w-full bg-yellow-400 rounded px-3 py-2 text-sm font-bold text-white text-center">
              {due.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Row 3: Notes (span 2) | Change */}
        <div className="grid grid-cols-1 sm:grid-cols-3">
          <div className="px-4 py-3 sm:col-span-2 sm:border-r border-gray-200 border-b sm:border-b-0">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
            <textarea value={pay.notes} onChange={(e) => setPay({ ...pay, notes: e.target.value })}
              rows={2} placeholder="Notes"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 resize-none" />
          </div>
          <div className="px-4 py-3">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Change</label>
            <div className="w-full bg-[#1E3A8A] rounded px-3 py-2 text-sm font-bold text-white text-center">
              {change_.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 flex h-14 z-50">
        <div className="flex-1 flex items-center justify-center text-white text-2xl font-bold" style={{background:"#1E3A8A"}}>
          {grandTotal.toFixed(2)}
        </div>
        <button type="button" onClick={() => handleSave("completed")} disabled={saving || holding}
          className="w-48 flex items-center justify-center bg-[#2563EB] hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-60">
          {saving ? "SAVING..." : "CREATE SALE"}
        </button>
        <button type="button" onClick={() => handleSave("hold")} disabled={holding || saving}
          className="w-32 flex items-center justify-center bg-slate-600 hover:bg-slate-700 text-white text-sm font-bold uppercase tracking-wider transition-colors disabled:opacity-60">
          {holding ? "..." : "HOLD"}
        </button>
      </div>

    </div>
  );
}
