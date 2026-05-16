"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { Plus, Edit2, Trash2, Search, Images } from "lucide-react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  brand_name: string;
  category: string;
  price: number;
  stock: number;
  image_url: string;
  image: string;
  status: string;
};

export default function CollectionsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    console.log("Attempting to delete product with ID:", id);
    
    // Try deleting as the raw ID first
    const { error, status } = await supabase.from("products").delete().eq("id", id);
    
    console.log("Delete response status:", status);

    if (error) {
      console.error("Supabase Delete Error:", error);
      alert("Error deleting product: " + error.message);
    } else {
      console.log("Delete successful (or at least no error)");
      // Optimistically update UI or re-fetch
      setProducts(prev => prev.filter(p => p.id !== id.toString() && p.id !== id));
      fetchProducts();
    }
  };

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];
  const filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="p-8 md:p-12">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-[#4A1523] mb-2">Collections</h1>
          <p className="text-[#4A1523]/60">Manage your skincare and beauty catalog</p>
        </div>
        <Link 
          href="/seller/add-product"
          className="flex items-center gap-2 bg-[#4A1523] hover:bg-[#3A101C] text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#4A1523]/20 font-medium"
        >
          <Plus className="w-5 h-5" /> ADD NEW
        </Link>
      </header>

      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#4A1523]/40 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search collections..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523] shadow-sm"
          />
        </div>
        
        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                selectedCategory === cat 
                ? 'bg-[#E9967A] text-white shadow-md' 
                : 'bg-white text-[#4A1523]/70 hover:bg-[#E9967A]/10 border border-[#4A1523]/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#4A1523]/50">Loading products...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const urls = product.image ? [product.image] : (product.image_url ? product.image_url.split(',') : []);
            const displayUrl = urls.length > 0 ? urls[0] : null;
            const hasMultipleImages = urls.length > 1;

            return (
              <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#4A1523]/5 flex flex-col group relative">
                {hasMultipleImages && (
                  <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur text-[#4A1523] text-xs font-semibold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                    <Images className="w-3 h-3" /> {urls.length}
                  </div>
                )}
                <div className="aspect-[4/5] relative overflow-hidden bg-[#F8F7F4]">
                  <img 
                    src={displayUrl || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop"} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                </div>
                <div className="p-5 flex flex-col flex-1 items-center">
                  {product.brand_name && (
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#E9967A] mb-1">{product.brand_name}</span>
                  )}
                  <h3 className="text-base font-medium text-[#4A1523] mb-1 text-center line-clamp-1 w-full">{product.name}</h3>
                  <p className="text-sm text-[#4A1523]/60 mb-4">{product.category} • ${product.price}</p>
                  
                  <div className="flex gap-3 mt-auto w-full justify-center">
                    <Link 
                      href={`/seller/add-product?id=${product.id}`} 
                      className="w-10 h-10 flex items-center justify-center bg-[#4A1523]/5 text-[#4A1523] hover:bg-[#E9967A] hover:text-white rounded-full transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDelete(product.id)} 
                      className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#4A1523]/50">
              No products found in this category.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
