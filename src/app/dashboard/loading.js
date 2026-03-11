export default function DashboardLoading() {
  return (
    <div className="flex gap-4 animate-pulse">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-[#1E3A8A] h-screen shrink-0 flex flex-col p-4 gap-2">
        <div className="h-10 bg-blue-700 rounded-lg mb-4"></div>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-10 bg-blue-700 rounded-lg opacity-60"></div>
        ))}
      </div>
      {/* Content skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="h-16 bg-white border-b border-gray-200 mb-6 rounded-r-none"></div>
        <div className="p-6 space-y-4">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}
