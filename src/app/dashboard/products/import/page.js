"use client";
import { useRef, useState } from "react";
import Link from "next/link";

export default function ImportProductPage() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (f && (f.name.endsWith(".csv") || f.name.endsWith(".xlsx"))) {
      setFile(f);
    } else {
      alert("Please upload a .csv or .xlsx file");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Import Products</h2>
        <p className="text-sm text-gray-400 mt-0.5">Bulk import products from a CSV or Excel file</p>
      </div>

      {/* Download Template */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#1E3A8A]">Download Import Template</p>
          <p className="text-xs text-blue-600 mt-0.5">Use our template to ensure your data is formatted correctly</p>
          <button className="mt-2 text-xs font-semibold text-[#1E3A8A] underline hover:text-blue-800">
            Download CSV Template
          </button>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
            dragging ? "border-[#1E3A8A] bg-blue-50" : "border-gray-200 hover:border-[#1E3A8A] hover:bg-blue-50"
          }`}
        >
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {file ? (
            <div>
              <p className="text-sm font-semibold text-[#1E3A8A]">{file.name}</p>
              <p className="text-xs text-gray-400 mt-1">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-600">Drop your file here or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">Supported formats: .csv, .xlsx</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        </div>

        {file && (
          <div className="mt-4 flex gap-3 justify-end">
            <button onClick={() => setFile(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              Clear
            </button>
            <button className="px-6 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
              Import Now
            </button>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Import Instructions</h3>
        <ol className="space-y-2 text-sm text-gray-600">
          {[
            "Download the template file above",
            "Fill in product data following the column headers",
            "Required columns: Name, Category, Purchase Price, Sell Price",
            "Optional: Brand, Unit, Barcode, Stock, Description",
            "Upload the completed file and click Import",
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-[#1E3A8A] text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
