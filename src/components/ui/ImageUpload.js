"use client";
import { useState, useRef } from "react";
import { uploadToImgBB } from "@/lib/imgbb";

/**
 * Reusable image upload component backed by ImgBB.
 * Uploads the file on selection, calls onChange(url) with the hosted URL.
 *
 * Props:
 *   value    {string}   - Current image URL (from DB / state)
 *   onChange {function} - Called with the new ImgBB URL after upload
 *   label    {string}   - Optional field label
 */
export default function ImageUpload({ value = "", onChange, label = "Image" }) {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // The URL to show: local blob preview while uploading, then the ImgBB URL
  const displaySrc = localPreview || value;

  const processFile = async (file) => {
    if (!file) return;
    setError("");

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (e) => setLocalPreview(e.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const result = await uploadToImgBB(file);
      setLocalPreview(""); // clear local preview — use the real URL
      onChange(result.url);
    } catch (err) {
      setLocalPreview("");
      setError(err.message || "Upload failed. Please try again.");
      onChange(value); // revert to previous value
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setLocalPreview("");
    setError("");
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
      </label>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer select-none
          ${uploading
            ? "border-blue-300 bg-blue-50 cursor-wait"
            : error
            ? "border-red-300 bg-red-50 hover:border-red-400"
            : displaySrc
            ? "border-green-300 bg-white hover:border-[#1E3A8A]"
            : "border-gray-200 bg-white hover:border-[#1E3A8A] hover:bg-blue-50"
          }`}
      >
        {displaySrc ? (
          /* ── Preview state ── */
          <div className="p-3">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displaySrc}
                alt="Preview"
                className={`h-40 w-full object-contain rounded-lg transition-opacity ${uploading ? "opacity-50" : "opacity-100"}`}
              />

              {/* Uploading overlay */}
              {uploading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/60 rounded-lg">
                  <div className="w-8 h-8 border-2 border-[#1E3A8A]/20 border-t-[#1E3A8A] rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-[#1E3A8A]">Uploading…</span>
                </div>
              )}
            </div>

            {/* Action row */}
            {!uploading && (
              <div
                className="mt-2 flex items-center justify-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-1 text-xs font-medium text-[#1E3A8A] hover:underline"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Change
                </button>
                <span className="text-gray-300 text-xs">|</span>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-1 text-xs font-medium text-red-500 hover:underline"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── Empty / Upload state ── */
          <div className="py-8 px-4 text-center">
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-[#1E3A8A]/20 border-t-[#1E3A8A] rounded-full animate-spin" />
                <p className="text-sm font-semibold text-[#1E3A8A]">Uploading to ImgBB…</p>
                <p className="text-xs text-gray-400">Please wait</p>
              </div>
            ) : (
              <>
                <svg
                  className="w-12 h-12 text-gray-300 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-semibold text-gray-500">
                  Click or drag &amp; drop
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP up to 32 MB</p>
                <p className="text-xs text-gray-300 mt-0.5">Hosted on ImgBB</p>
              </>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {/* Status messages */}
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {value && !uploading && !error && (
        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Image uploaded successfully
        </p>
      )}
    </div>
  );
}
