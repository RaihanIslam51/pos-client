export default function ReportsLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
        <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64 bg-gray-200 rounded-xl"></div>
        <div className="h-64 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );
}
