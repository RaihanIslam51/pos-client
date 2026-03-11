"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function BarcodeGeneratePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [qty, setQty] = useState({});
  const [search, setSearch] = useState("");
  const [printed, setPrinted] = useState(false);

  useEffect(() => {
    api.getProducts().then((r) => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setQty((prev) => ({ ...prev, [id]: prev[id] || 1 }));
  };

  const selectedProducts = products.filter((p) => selected.includes(p._id));

  const handlePrint = () => {
    setPrinted(true);
    setTimeout(() => {
      window.print();
      setPrinted(false);
    }, 300);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Barcode Generator</h2>
          <p className="text-sm text-gray-400">Select products to generate barcodes for printing</p>
        </div>
        {selected.length > 0 && (
          <button
            onClick={handlePrint}
            className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print ({selected.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Product picker */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />
              <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="overflow-y-auto max-h-96">
            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#1E3A8A]" />
              </div>
            ) : (
              filtered.map((p) => (
                <label key={p._id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50">
                  <input
                    type="checkbox"
                    checked={selected.includes(p._id)}
                    onChange={() => toggleSelect(p._id)}
                    className="w-4 h-4 rounded text-[#1E3A8A]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.barcode || p.productCode || "No code"}</p>
                  </div>
                  {selected.includes(p._id) && (
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={qty[p._id] || 1}
                      onChange={(e) => setQty({ ...qty, [p._id]: Number(e.target.value) })}
                      onClick={(e) => e.preventDefault()}
                      className="w-14 border border-gray-200 rounded px-2 py-1 text-xs text-center"
                    />
                  )}
                </label>
              ))
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-700">Label Preview</h3>
          </div>
          <div className="p-4">
            {selectedProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                <p>Select products to preview labels</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 print:flex print:flex-wrap">
                {selectedProducts.flatMap((p) =>
                  Array.from({ length: qty[p._id] || 1 }).map((_, i) => (
                    <div key={`${p._id}-${i}`} className="border-2 border-gray-300 rounded-lg p-3 text-center w-36 shrink-0">
                      <p className="text-xs font-bold text-gray-800 truncate mb-1">{p.name}</p>
                      <div className="w-full h-10 bg-gray-100 rounded flex items-center justify-center mb-1">
                        <span className="text-xs font-mono text-gray-600">{p.barcode || p.productCode || "—"}</span>
                      </div>
                      <p className="text-sm font-bold text-[#1E3A8A]">৳{p.sellingPrice}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
