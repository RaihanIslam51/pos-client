export default function SettingsLoading() {
  return (
    <div className="space-y-4 animate-pulse max-w-2xl">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
