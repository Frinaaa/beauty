export const revalidate = 0;

import { supabase } from "@/src/lib/supabase";
import DashboardStats from "@/src/components/seller/DashboardStats";

export default async function SellerDashboard() {
  let inventoryCount = 0;
  let activeCount = 0;
  let categoryCount = 0;
  let recentProducts: any[] = [];

  try {
    // Fetch real data from Supabase
    const { count: invCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true });
    inventoryCount = invCount || 0;

    const { count: actCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);
    activeCount = actCount || 0;

    // Get unique category count
    const { data: catData } = await supabase.from("products").select("category");
    categoryCount = new Set(catData?.map(p => p.category)).size;

    // Fetch recent products
    const { data: recent } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(3);
    recentProducts = recent || [];
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }

  return (
    <div className="p-8 md:p-12">
      <header className="mb-10">
        <h1 className="text-4xl font-light tracking-[2px] text-[#4A1523] mb-2">Store Overview</h1>
        <p className="text-[#4A1523]/70 font-light tracking-wide">
          Welcome back. Here is what is happening with your store today.
        </p>
      </header>

      <DashboardStats 
        inventoryCount={inventoryCount} 
        activeCount={activeCount} 
        categoryCount={categoryCount}
      />

      <div className="mt-12 bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h2 className="text-xl font-medium tracking-wide text-[#4A1523] mb-6">Recent Activity</h2>
        {recentProducts.length > 0 ? (
          <div className="space-y-4">
            {recentProducts.map((product) => {
              const imgSrc = product.image || product.image_url?.split(',')[0] || '';
              return (
                <div key={product.id} className="flex items-center justify-between p-4 bg-white/40 rounded-xl border border-white/40">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#F8F7F4] overflow-hidden">
                      {imgSrc && <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="text-[#4A1523] font-medium">{product.name}</p>
                      <p className="text-xs text-[#4A1523]/50">Added on {new Date(product.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 bg-[#E9967A]/10 text-[#E9967A] rounded-full font-medium">New Product</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-[#4A1523]/50">
            <p className="font-light">No recent activity to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}
