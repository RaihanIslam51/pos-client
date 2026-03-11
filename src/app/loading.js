export default function RootLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#1E3A8A] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm text-gray-500 font-medium animate-pulse">Loading POS Pro...</p>
      </div>
    </div>
  );
}
