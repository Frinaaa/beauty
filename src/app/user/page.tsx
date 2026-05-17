import { supabase } from "@/src/lib/supabase";
import { Eye, ShoppingBag } from "lucide-react";

export const revalidate = 0; // Disable cache to always fetch the latest active products

export default async function UserStorefront() {
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-[#FDFBFB] p-8 md:p-12 font-sans">
      <header className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-light tracking-[8px] text-[#4A1523] mb-4">BEAUTY</h1>
        <div className="h-px w-24 bg-[#E9967A] mx-auto mb-6"></div>
        <p className="text-[#4A1523]/70 font-light tracking-wide">
          Curated elegance for your daily ritual. Discover our latest collection.
        </p>
      </header>

      {error ? (
        <div className="text-center text-red-500">Failed to load products. Please try again later.</div>
      ) : products && products.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8 max-w-[1600px] mx-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-white/40 backdrop-blur-sm border border-[#4A1523]/5 shadow-[0_4px_20px_rgb(74,21,35,0.03)] hover:shadow-[0_8px_30px_rgb(74,21,35,0.08)] transition-all duration-500"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden bg-[#F8F7F4]">
                <img
                  src={product.image_url ? product.image_url.split(',')[0] : "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay actions (Glassmorphism) */}
                <div className="absolute inset-0 bg-[#4A1523]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <button className="flex items-center gap-2 bg-white/80 backdrop-blur-md text-[#4A1523] px-6 py-3 rounded-full text-sm font-medium hover:bg-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300">
                    <Eye className="w-4 h-4" /> Quick View
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-[#4A1523] truncate pr-4">{product.name}</h3>
                  <span className="text-[#E9967A] font-medium">₹{Number(product.price).toFixed(2)}</span>
                </div>
                <p className="text-sm text-[#4A1523]/60 line-clamp-2 mb-4 font-light leading-relaxed">
                  {product.description}
                </p>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#4A1523]/20 text-[#4A1523] rounded-lg hover:bg-[#4A1523] hover:text-white transition-colors duration-300 text-sm font-medium tracking-wide">
                  <ShoppingBag className="w-4 h-4" /> Add to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-[#4A1523]/60 mt-20 py-20 bg-white/30 backdrop-blur-sm rounded-2xl border border-white">
          <p className="text-xl font-light mb-2">No products available</p>
          <p className="text-sm">Check back soon for our new collection.</p>
        </div>
      )}
    </div>
  );
}
