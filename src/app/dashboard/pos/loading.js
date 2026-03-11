import PageSkeleton from "@/components/ui/PageSkeleton";
export default function POSLoading() {
  return (
    <div className="flex gap-4 h-[calc(100vh-9rem)] animate-pulse">
      <div className="flex-1 flex flex-col gap-4">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 w-20 bg-gray-200 rounded-full"></div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 flex-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
      <div className="w-80 bg-gray-200 rounded-xl"></div>
    </div>
  );
}
