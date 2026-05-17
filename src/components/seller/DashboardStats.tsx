import { Package, Layers, Tag, IndianRupee } from "lucide-react";

export default function DashboardStats({
  inventoryCount,
  activeCount,
  categoryCount,
}: {
  inventoryCount: number;
  activeCount: number;
  categoryCount: number;
}) {
  const stats = [
    {
      title: "Total Inventory",
      value: inventoryCount.toString(),
      icon: <Package className="w-6 h-6 text-[#4A1523]" />,
      bg: "bg-[#E9967A]/10",
    },
    {
      title: "Active Products",
      value: activeCount.toString(),
      icon: <Tag className="w-6 h-6 text-[#4A1523]" />,
      bg: "bg-[#4A1523]/10",
    },
    {
      title: "Categories",
      value: categoryCount.toString(),
      icon: <Layers className="w-6 h-6 text-[#4A1523]" />,
      bg: "bg-[#E9967A]/10",
    },
    {
      title: "Revenue",
      value: "₹0.00", // Placeholder for future feature
      icon: <IndianRupee className="w-6 h-6 text-[#4A1523]" />,
      bg: "bg-[#4A1523]/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium tracking-wide text-[#4A1523]/70">{stat.title}</h3>
            <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
          </div>
          <p className="text-3xl font-light text-[#4A1523]">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
