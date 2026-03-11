import Link from "next/link";

export default function LowStockAlert({ products = [] }) {
  if (products.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <h3 className="text-base font-semibold text-gray-800">Low Stock Alert</h3>
        </div>
        <Link href="/dashboard/inventory" className="text-sm text-[#1E3A8A] hover:underline font-medium">
          Manage
        </Link>
      </div>
      <div className="p-4 space-y-2">
        {products.slice(0, 5).map((product) => (
          <div key={product._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
            <div>
              <p className="text-sm font-medium text-gray-800">{product.name}</p>
              <p className="text-xs text-gray-500">{product.category?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-red-600">{product.stock} {product.unit}</p>
              <p className="text-xs text-gray-400">Alert: {product.alertQuantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
