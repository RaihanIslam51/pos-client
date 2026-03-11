import PageSkeleton from "@/components/ui/PageSkeleton";
export default function InventoryLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 rounded-lg w-32"></div>
        ))}
      </div>
      <PageSkeleton rows={8} hasToolbar={false} />
    </div>
  );
}
