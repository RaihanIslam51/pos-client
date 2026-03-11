"use client";
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
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [lastInvoice, setLastInvoice] = useState(null);
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
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory) params.append("category", selectedCategory);
      const res = await api.getProducts(params.toString() ? `?${params}` : "");
      setProducts(res.data);
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

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
    setDiscount(0);
    setPaidAmount("");
    setLastInvoice(null);
  };

  const subtotal = cart.reduce((sum, i) => sum + i.sellingPrice * i.quantity - i.itemDiscount, 0);
  const discountAmount = parseFloat(discount) || 0;
  const totalAmount = Math.max(0, subtotal - discountAmount);
  const change = parseFloat(paidAmount) - totalAmount;

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    const paid = parseFloat(paidAmount);
    if (!paid || paid < 0) return alert("Enter paid amount!");

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
      setLastInvoice(res.data);
      clearCart();
      fetchProducts();
    } catch (err) {
      alert(err.message || "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  return (
    <div className="flex gap-4 h-[calc(100vh-9rem)]">
      {/* Left - Products */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search & Filter */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <input
              ref={searchRef}
              type="text"
              placeholder="Search product or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] text-sm"
            />
            <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] bg-white"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory("")}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === "" ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === c._id ? "bg-[#1E3A8A] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E3A8A]"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-2">📦</p>
              <p className="font-medium">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map((product) => (
                <button
                  key={product._id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className={`bg-white rounded-xl border p-3 text-left hover:shadow-md hover:border-[#1E3A8A] transition-all text-sm ${
                    product.stock === 0 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <div className="w-full h-16 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                  <p className="font-semibold text-gray-800 truncate text-xs">{product.name}</p>
                  <p className="text-[#1E3A8A] font-bold mt-1">৳{product.sellingPrice}</p>
                  <p className={`text-xs mt-0.5 ${product.stock <= product.alertQuantity ? "text-red-500" : "text-gray-400"}`}>
                    Stock: {product.stock} {product.unit}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right - Cart & Checkout */}
      <div className="w-80 flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Cart Header */}
        <div className="bg-[#1E3A8A] text-white px-4 py-3 flex items-center justify-between">
          <h2 className="font-semibold">🛒 Cart ({cart.length})</h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="text-blue-200 hover:text-white text-xs">
              Clear All
            </button>
          )}
        </div>

        {/* Customer Select */}
        <div className="p-3 border-b border-gray-100">
          <input
            type="text"
            placeholder="Search customer..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
          />
          {customerSearch && (
            <div className="mt-1 border border-gray-200 rounded-lg max-h-24 overflow-y-auto">
              {filteredCustomers.map((c) => (
                <button
                  key={c._id}
                  onClick={() => { setCustomer(c); setCustomerSearch(""); }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 border-b border-gray-50 last:border-0"
                >
                  <span className="font-medium">{c.name}</span> — {c.phone}
                </button>
              ))}
            </div>
          )}
          {customer && (
            <div className="mt-1 flex items-center justify-between bg-blue-50 rounded-lg px-3 py-1.5">
              <span className="text-xs text-[#1E3A8A] font-medium">{customer.name}</span>
              <button onClick={() => setCustomer(null)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
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
                    className="w-6 h-6 bg-gray-200 rounded text-sm font-bold hover:bg-red-100 hover:text-red-600 transition-colors flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item._id, item.quantity + 1)}
                    className="w-6 h-6 bg-gray-200 rounded text-sm font-bold hover:bg-green-100 hover:text-green-600 transition-colors flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeFromCart(item._id)} className="text-gray-300 hover:text-red-500 text-xs">✕</button>
                  <p className="text-xs font-bold text-gray-800">৳{(item.sellingPrice * item.quantity).toFixed(0)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="border-t border-gray-200 p-3 space-y-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>৳{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Discount (৳)</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-20 text-right border border-gray-200 rounded px-2 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#1E3A8A]"
                min="0"
              />
            </div>
            <div className="flex justify-between font-bold text-lg text-[#1E3A8A] pt-1 border-t border-gray-100">
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
                className={`py-1.5 text-xs rounded-lg font-medium capitalize transition-colors ${
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
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              min="0"
            />
            {paidAmount && change >= 0 && (
              <p className="text-xs text-green-600 font-medium mt-1">Change: ৳{change.toFixed(2)}</p>
            )}
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || checkoutLoading}
            className="w-full bg-[#1E3A8A] text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  );
}
