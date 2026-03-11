import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-[120px] font-black text-[#1E3A8A] leading-none opacity-10 select-none">
          404
        </div>
        <div className="-mt-5">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h1>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="bg-[#1E3A8A] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/dashboard/pos"
              className="border border-[#1E3A8A] text-[#1E3A8A] px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              Open POS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
