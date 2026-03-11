"use client";
import Link from "next/link";

export default function DashboardError({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-800 mb-1">Failed to load</h3>
        <p className="text-sm text-gray-500 mb-4">{error?.message || "Something went wrong loading this page."}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="bg-[#1E3A8A] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
          >
            Retry
          </button>
          <Link href="/dashboard" className="border border-gray-200 text-gray-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
