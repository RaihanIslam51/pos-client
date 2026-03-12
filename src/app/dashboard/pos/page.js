"use client";
import { showError, showSuccess, showWarning } from "@/lib/swal";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";

export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customer, setCustomer] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("flat"); // "flat" | "percent"
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);
  const [salesHistory, setSalesHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("products"); // mobile: products | cart | history
  const [selected, setSelected] = useState({}); // { productId: { product, qty } }
  const searchRef = useRef(null);

  useEffect(() => {
    fetchInitial();
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  const fetchInitial = async () => {
    try {
      const [catRes, custRes] = await Promise.all([api.getCategories(), api.getCustomers()]);
      setCategories(catRes.data);
      setCustomers(custRes.data);
    } catch (err) {}
    fetchTodaySales();
  };

  const fetchTodaySales = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await api.getSales(`?startDate=${today}&endDate=${today}&limit=50`);
      const mapped = (res.data || []).map((sale) => ({
        ...sale,
        _soldItems: sale.items.map((i) => ({ name: i.productName, qty: i.quantity, price: i.unitPrice })),
        _customerName: sale.customerName,
        _time: sale.createdAt,
      }));
      setSalesHistory(mapped);
    } catch (err) {}
  };


  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory) params.append("category", selectedCategory);
      const res = await api.getProducts(params.toString() ? `?${params}` : "");
      setProducts((res.data || []).filter((p) => p.stock > 0));
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      if (product.stock === 0) return prev;
      return [...prev, { ...product, quantity: 1, itemDiscount: 0 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) return removeFromCart(id);
    setCart((prev) =>
      prev.map((i) => {
        if (i._id === id) {
          const newQty = Math.min(qty, i.stock);
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i._id !== id));

  // ── Multi-select helpers ──
  const toggleSelect = (product) => {
    setSelected((prev) => {
      if (prev[product._id]) {
        const next = { ...prev };
        delete next[product._id];
        return next;
      }
      return { ...prev, [product._id]: { product, qty: 1 } };
    });
  };

  const updateSelectedQty = (id, qty) => {
    if (qty <= 0) {
      setSelected((prev) => { const next = { ...prev }; delete next[id]; return next; });
      return;
    }
    setSelected((prev) =>
      prev[id] ? { ...prev, [id]: { ...prev[id], qty: Math.min(qty, prev[id].product.stock) } } : prev
    );
  };

  const addSelectedToCart = () => {
    Object.values(selected).forEach(({ product, qty }) => {
      setCart((prev) => {
        const existing = prev.find((i) => i._id === product._id);
        if (existing) {
          const newQty = Math.min(existing.quantity + qty, product.stock);
          return prev.map((i) => i._id === product._id ? { ...i, quantity: newQty } : i);
        }
        return [...prev, { ...product, quantity: qty, itemDiscount: 0 }];
      });
    });
    setSelected({});
    setActiveTab("cart");
  };

  const selectedCount = Object.keys(selected).length;
  const selectedTotal = Object.values(selected).reduce((s, { product, qty }) => s + product.sellingPrice * qty, 0);

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
    setDiscount(0);
    setDiscountType("flat");
    setPaidAmount("");
    setLastInvoice(null);
  };

  const subtotal = cart.reduce((sum, i) => sum + i.sellingPrice * i.quantity - i.itemDiscount, 0);
  const discountAmount = discountType === "percent"
    ? (subtotal * (parseFloat(discount) || 0)) / 100
    : parseFloat(discount) || 0;
  const totalAmount = Math.max(0, subtotal - discountAmount);
  const change = parseFloat(paidAmount) - totalAmount;

  // Auto-fill paid amount whenever total changes
  useEffect(() => {
    setPaidAmount(totalAmount > 0 ? totalAmount.toFixed(2) : "");
  }, [totalAmount]);

  const handleCheckout = async () => {
    if (cart.length === 0) return showWarning("Cart is empty!");
    const paid = parseFloat(paidAmount);
    if (!paid || paid < 0) return showWarning("Enter paid amount!");

    setCheckoutLoading(true);
    try {
      const saleData = {
        items: cart.map((i) => ({
          product: i._id,
          quantity: i.quantity,
          discount: i.itemDiscount || 0,
        })),
        customer: customer?._id || null,
        customerName: customer?.name || "Walk-in Customer",
        paymentMethod,
        paidAmount: paid,
        discountAmount,
        totalAmount,
        subtotal,
      };
      const res = await api.createSale(saleData);
      const invoice = res.data;
      setLastInvoice(invoice);
      clearCart();
      setActiveTab("products");
      fetchProducts();
      fetchTodaySales();
    } catch (err) {
      showError(err.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-BD", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] lg:h-[calc(100vh-9rem)]">

      {/* ── Mobile Tab Bar ── */}
      <div className="flex lg:hidden border-b border-gray-200 bg-white shrink-0 mb-2">
        <button
          onClick={() => setActiveTab("products")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "products" ? "border-b-2 border-[#1E3A8A] text-[#1E3A8A]" : "text-gray-500"
          }`}
        >
          📦 Products
        </button>
        <button
          onClick={() => setActiveTab("cart")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "cart" ? "border-b-2 border-[#1E3A8A] text-[#1E3A8A]" : "text-gray-500"
          }`}
        >
          🛒 Cart
          {cart.length > 0 && (
            <span className="ml-1 bg-[#1E3A8A] text-white text-[10px] rounded-full px-1.5 py-0.5 align-middle">
              {cart.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "history" ? "border-b-2 border-[#1E3A8A] text-[#1E3A8A]" : "text-gray-500"
          }`}
        >
          🧾 History
          {salesHistory.length > 0 && (
            <span className="ml-1 bg-green-500 text-white text-[10px] rounded-full px-1.5 py-0.5 align-middle">
              {salesHistory.length}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-4 flex-1 overflow-hidden">
      {/* ── Left: Products + Desktop History ── */}
      <div className={`flex-1 flex flex-col overflow-hidden ${ activeTab !== "products" ? "hidden lg:flex" : "flex" }`}>
        {/* Search & Filter */}
        <div className="flex gap-2 mb-3 shrink-0">
          <div className="relative flex-1">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search product or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm touch-manipulation"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white touch-manipulation"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 shrink-0">
          <button
            onClick={() => setSelectedCategory("")}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors touch-manipulation ${
              selectedCategory === "" ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors touch-manipulation ${
                selectedCategory === c._id ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Products List */}
        <div className="flex-1 overflow-y-auto relative">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-2">📦</p>
              <p className="font-medium">No products found</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5" style={{ paddingBottom: selectedCount > 0 ? "5rem" : "0" }}>
              {products.map((product) => {
                const sel = selected[product._id];
                const isSelected = !!sel;
                return (
                  <div
                    key={product._id}
                    className={`bg-white rounded-lg border flex items-center gap-2 w-full transition-all ${
                      product.stock === 0
                        ? "opacity-50"
                        : isSelected
                        ? "border-[#1E3A8A] ring-1 ring-[#1E3A8A]/30 shadow-sm"
                        : "border-gray-200 hover:border-[#1E3A8A]/50"
                    }`}
                  >
                    {/* Clickable product info area */}
                    <button
                      type="button"
                      disabled={product.stock === 0}
                      onClick={() => toggleSelect(product)}
                      className="flex items-center gap-3 flex-1 min-w-0 px-3 py-2 text-left touch-manipulation"
                    >
                      {/* Checkbox indicator */}
                      <div className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? "bg-[#1E3A8A] border-[#1E3A8A]" : "border-gray-300"
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="w-8 h-8 shrink-0 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-base">📦</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate text-sm">{product.name}</p>
                        <p className={`text-xs ${product.stock <= product.alertQuantity ? "text-red-500" : "text-gray-400"}`}>
                          Stock: {product.stock} {product.unit}
                        </p>
                      </div>
                      <p className="text-[#1E3A8A] font-bold text-sm shrink-0">৳{product.sellingPrice}</p>
                    </button>

                    {/* Qty controls — visible only when selected */}
                    {isSelected && (
                      <div className="flex items-center gap-1 pr-3 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateSelectedQty(product._id, sel.qty - 1)}
                          className="w-7 h-7 bg-gray-200 rounded-full text-sm font-bold hover:bg-red-100 hover:text-red-600 flex items-center justify-center touch-manipulation"
                        >−</button>
                        <span className="w-6 text-center text-sm font-bold">{sel.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateSelectedQty(product._id, sel.qty + 1)}
                          className="w-7 h-7 bg-gray-200 rounded-full text-sm font-bold hover:bg-green-100 hover:text-green-600 flex items-center justify-center touch-manipulation"
                        >+</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Continue to Cart sticky bar ── */}
          {selectedCount > 0 && (
            <div className="sticky bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{selectedCount} product{selectedCount > 1 ? "s" : ""} selected</span>
                <button
                  type="button"
                  onClick={() => setSelected({})}
                  className="text-xs text-red-400 hover:text-red-600 touch-manipulation"
                >Clear</button>
              </div>
              <button
                type="button"
                onClick={addSelectedToCart}
                className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 active:scale-95 transition-all touch-manipulation flex items-center justify-center gap-2"
              >
                <span>Continue to Cart</span>
                <span className="bg-white/20 rounded-lg px-2 py-0.5 text-xs">৳{selectedTotal.toFixed(0)}</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Desktop Sales History panel ── */}
        <div className="hidden lg:flex flex-col shrink-0 mt-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" style={{ maxHeight: "220px" }}>
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 shrink-0">
            <h3 className="text-sm font-semibold text-gray-700">🧾 Today's Sales History</h3>
            <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {salesHistory.length} sale{salesHistory.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1.5">
            {salesHistory.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <p className="text-2xl mb-1">🧾</p>
                <p className="text-xs">No sales yet today</p>
              </div>
            ) : (
              salesHistory.map((sale, idx) => (
                <SaleHistoryRow key={sale._id || idx} sale={sale} formatTime={formatTime} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Cart & Checkout ── */}
      <div className={`w-full lg:w-80 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${ activeTab !== "cart" ? "hidden lg:flex" : "flex" }`}>
        {/* Cart Header */}
        <div className="bg-[#1E3A8A] text-white px-4 py-3 flex items-center justify-between shrink-0">
          <h2 className="font-semibold">🛒 Cart ({cart.length})</h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-blue-200 hover:text-white text-xs touch-manipulation">
              Clear All
            </button>
          )}
        </div>

        {/* Customer Select */}
        <div className="p-3 border-b border-gray-100 shrink-0">
          <input
            type="text"
            placeholder="Search customer..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A] touch-manipulation"
          />
          {customerSearch && (
            <div className="mt-1 border border-gray-200 rounded-lg max-h-24 overflow-y-auto">
              {filteredCustomers.map((c) => (
                <button
                  key={c._id}
                  onClick={() => { setCustomer(c); setCustomerSearch(""); }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 border-b border-gray-50 last:border-0 touch-manipulation"
                >
                  <span className="font-medium">{c.name}</span> — {c.phone}
                </button>
              ))}
            </div>
          )}
          {customer && (
            <div className="mt-1 flex items-center justify-between bg-blue-50 rounded-lg px-3 py-1.5">
              <span className="text-xs text-[#1E3A8A] font-medium">{customer.name}</span>
              <button onClick={() => setCustomer(null)} className="text-gray-400 hover:text-red-500 text-xs touch-manipulation">✕</button>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">🛒</p>
              <p className="text-xs">Add products to cart</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="flex gap-2 bg-gray-50 rounded-lg p-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-[#1E3A8A] font-medium">৳{item.sellingPrice}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item._id, item.quantity - 1)}
                    className="w-7 h-7 bg-gray-200 rounded text-sm font-bold hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center touch-manipulation"
                  >
                    −
                  </button>
                  <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item._id, item.quantity + 1)}
                    className="w-7 h-7 bg-gray-200 rounded text-sm font-bold hover:bg-green-100 hover:text-green-600 transition-colors flex items-center justify-center touch-manipulation"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeFromCart(item._id)} className="text-gray-300 hover:text-red-500 text-xs touch-manipulation">✕</button>
                  <p className="text-xs font-bold text-gray-800">৳{(item.sellingPrice * item.quantity).toFixed(0)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="border-t border-gray-200 p-3 space-y-2.5 shrink-0">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Discount</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setDiscountType("flat"); setDiscount(0); }}
                  className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-colors touch-manipulation ${
                    discountType === "flat" ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >৳</button>
                <button
                  onClick={() => { setDiscountType("percent"); setDiscount(0); }}
                  className={`px-2 py-0.5 text-[10px] rounded font-semibold transition-colors touch-manipulation ${
                    discountType === "percent" ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >%</button>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-16 text-right border border-gray-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                  min="0"
                  max={discountType === "percent" ? 100 : undefined}
                />
              </div>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-red-500">
                <span>Discount Amount</span>
                <span>- ৳{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base sm:text-lg text-[#1E3A8A] pt-1 border-t border-gray-100">
              <span>Total</span>
              <span>৳{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-4 gap-1">
            {["cash", "card", "mobile", "credit"].map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`py-1.5 text-xs rounded-lg font-medium capitalize transition-colors touch-manipulation ${
                  paymentMethod === method
                    ? "bg-[#1E3A8A] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {/* Paid Amount */}
          <div>
            <label className="text-xs text-gray-500 font-medium">Paid Amount (৳)</label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder={`${totalAmount.toFixed(2)}`}
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] touch-manipulation"
              min="0"
            />
            {paidAmount && change >= 0 && (
              <p className="text-xs text-green-600 font-medium mt-1">Change: ৳{change.toFixed(2)}</p>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || checkoutLoading}
            className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95 touch-manipulation"
          >
            {checkoutLoading ? "Processing..." : `Checkout — ৳${totalAmount.toFixed(2)}`}
          </button>

          {lastInvoice && (
            <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
              <p className="text-green-700 font-bold text-sm">✅ Sale Complete!</p>
              <p className="text-green-600 text-xs mt-1">Invoice: {lastInvoice.invoiceNumber}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile History Tab Panel ── */}
      <div className={`flex-1 overflow-y-auto ${ activeTab !== "history" ? "hidden" : "block lg:hidden" }`}>
        {salesHistory.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-2">🧾</p>
            <p className="font-medium">No sales yet today</p>
          </div>
        ) : (
          <div className="space-y-2 pb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Today's Sales</h3>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                {salesHistory.length} sales
              </span>
            </div>
            {salesHistory.map((sale, idx) => (
              <SaleHistoryRow key={sale._id || idx} sale={sale} formatTime={formatTime} />
            ))}
          </div>
        )}
      </div>

    </div>
    </div>
  );
}

// ── Sale History Row Card ──────────────────────────────────────────────────────
function SaleHistoryRow({ sale, formatTime }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors touch-manipulation"
      >
        <div className="flex items-center gap-3 text-left min-w-0">
          <span className="text-green-500 text-lg shrink-0">✅</span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">{sale.invoiceNumber}</p>
            <p className="text-xs text-gray-400">{sale._customerName} · {formatTime(sale._time)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <div className="text-right">
            <p className="text-sm font-bold text-[#1E3A8A]">৳{sale.totalAmount?.toFixed(2)}</p>
            <p className="text-[10px] text-gray-400">{sale._soldItems?.length} item{sale._soldItems?.length !== 1 ? "s" : ""}</p>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-2 bg-gray-50 space-y-1">
          {sale._soldItems?.map((item, i) => (
            <div key={i} className="flex justify-between text-xs text-gray-600">
              <span className="truncate">{item.name} <span className="text-gray-400">×{item.qty}</span></span>
              <span className="font-medium ml-2 shrink-0">৳{(item.price * item.qty).toFixed(0)}</span>
            </div>
          ))}
          <div className="flex justify-between text-xs font-bold text-[#1E3A8A] pt-1 border-t border-gray-200">
            <span>Total Paid</span>
            <span>৳{sale.paidAmount?.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
