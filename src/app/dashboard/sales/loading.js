import PageSkeleton from "@/components/ui/PageSkeleton";
export default function SalesLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
        <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
        <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
      </div>
      <PageSkeleton rows={8} hasToolbar={false} />
    </div>
  );
}
