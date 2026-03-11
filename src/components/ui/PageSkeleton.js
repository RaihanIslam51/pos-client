export default function PageSkeleton({ rows = 5, hasToolbar = true }) {
  return (
    <div className="space-y-4 animate-pulse">
      {hasToolbar && (
        <div className="flex gap-3 justify-between">
          <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 h-12 border-b border-gray-200"></div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
            <div className="h-4 bg-gray-200 rounded w-6"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
