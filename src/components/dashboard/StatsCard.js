export default function StatsCard({ title, value, subtitle, icon, color = "blue" }) {
  const colorMap = {
    blue: "bg-blue-50 text-[#1E3A8A]",
    green: "bg-green-50 text-green-700",
    yellow: "bg-yellow-50 text-yellow-700",
    red: "bg-red-50 text-red-700",
    purple: "bg-purple-50 text-purple-700",
  };

  const iconBg = {
    blue: "bg-[#1E3A8A] text-white",
    green: "bg-green-600 text-white",
    yellow: "bg-yellow-500 text-white",
    red: "bg-red-500 text-white",
    purple: "bg-purple-600 text-white",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${colorMap[color].split(" ")[1]}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
