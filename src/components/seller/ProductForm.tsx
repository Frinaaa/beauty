"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { Upload, Tag, DollarSign, Layers, Image as ImageIcon, Box, Percent, Droplets, Sparkles, Info, X } from "lucide-react";

type FormValues = {
  name: string;
  brand_name: string;
  category: string;
  price: string;
  discount: string;
  stock: string;
  description: string;
  full_ingredients: string;
  key_ingredients: string;
  skin_type: string;
  skin_concern: string;
};

function ProductForm() {
  const router = useRouter();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { 
      name: "", brand_name: "", category: "Cleanser", price: "", discount: "", 
      stock: "", description: "", full_ingredients: "", key_ingredients: "", 
      skin_type: "All", skin_concern: "" 
    }
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const searchParams = useSearchParams();
  const productId = searchParams?.get("id");

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        const { data } = await supabase.from("products").select("*").eq("id", productId).single();
        if (data) {
          reset({
            name: data.name,
            brand_name: data.brand_name || "",
            category: data.category,
            price: data.price?.toString() || "",
            discount: data.discount?.toString() || "",
            stock: data.stock?.toString() || "",
            description: data.description || "",
            full_ingredients: data.full_ingredients || "",
            key_ingredients: data.key_ingredients || "",
            skin_type: data.skin_type || "All",
            skin_concern: data.skin_concern || "",
          });
          if (data.image_url) {
            setPreviewUrls(data.image_url.split(','));
          }
        }
      };
      fetchProduct();
    }
  }, [productId, reset]);

  const liveData = watch();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      const newUrls = selectedFiles.map((f) => URL.createObjectURL(f));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== indexToRemove));
    // Approximate removal from files array if it's a new upload. 
    // We calculate the offset based on how many existing URLs there were.
    const existingCount = previewUrls.length - files.length;
    if (indexToRemove >= existingCount) {
      const fileIndex = indexToRemove - existingCount;
      setFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const newIndex = Math.round(scrollLeft / width);
    setCurrentImageIndex(newIndex);
  };

  const onSubmit = async (data: FormValues) => {
    if (files.length === 0 && previewUrls.length === 0) return alert("Please select at least one image");
    setLoading(true);

    try {
      let finalUrls: string[] = [];
      const existingUrls = previewUrls.filter(url => !url.startsWith('blob:'));
      finalUrls = [...existingUrls];

      if (files.length > 0) {
        for (const f of files) {
          const fileExt = f.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filePath, f);

          if (uploadError) throw uploadError;

          const { data: publicUrlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);
            
          finalUrls.push(publicUrlData.publicUrl);
        }
      }

      const productPayload = {
        name: data.name,
        brand_name: data.brand_name,
        category: data.category,
        price: parseFloat(data.price),
        discount: data.discount ? parseFloat(data.discount) : null,
        stock: parseInt(data.stock),
        description: data.description,
        full_ingredients: data.full_ingredients,
        key_ingredients: data.key_ingredients,
        skin_type: data.skin_type,
        skin_concern: data.skin_concern,
        image_url: finalUrls.join(','),
        is_active: true,
      };

      if (productId) {
        const { error } = await supabase.from("products").update(productPayload).eq("id", productId);
        if (error) throw error;
        alert("Product updated successfully!");
        router.push("/seller/collections");
      } else {
        const { error } = await supabase.from("products").insert([{ id: Date.now(), ...productPayload }]);
        if (error) throw error;
        alert("Product published successfully!");
        router.push("/seller/collections");
      }
    } catch (error: any) {
      alert("Error saving product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#4A1523] border-b border-[#4A1523]/10 pb-2">1. Basic Product Info</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
                <Tag className="w-4 h-4 mr-2 text-[#E9967A]" /> Product Name
              </label>
              <input
                {...register("name", { required: true })}
                className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
                placeholder="e.g. Luminous Silk Serum"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
                <Info className="w-4 h-4 mr-2 text-[#E9967A]" /> Brand Name
              </label>
              <input
                {...register("brand_name", { required: true })}
                className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
                placeholder="e.g. Glow Recipe"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
              <Layers className="w-4 h-4 mr-2 text-[#E9967A]" /> Category
            </label>
            <select
              {...register("category", { required: true })}
              className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
            >
              <option value="Cleanser">Cleanser</option>
              <option value="Toner">Toner</option>
              <option value="Serum">Serum</option>
              <option value="Moisturizer">Moisturizer</option>
              <option value="Sunscreen">Sunscreen</option>
              <option value="Mask">Mask</option>
              <option value="Makeup">Makeup</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
              <Tag className="w-4 h-4 mr-2 text-[#E9967A]" /> Short Description
            </label>
            <textarea
              {...register("description", { required: true })}
              rows={3}
              className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
              placeholder="Describe the product's benefits..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#4A1523] border-b border-[#4A1523]/10 pb-2">2. Price & Stock</h3>
          
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
                <DollarSign className="w-4 h-4 mr-2 text-[#E9967A]" /> MRP / Price
              </label>
              <input
                type="number"
                step="0.01"
                {...register("price", { required: true })}
                className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
                <Percent className="w-4 h-4 mr-2 text-[#E9967A]" /> Discount %
              </label>
              <input
                type="number"
                {...register("discount")}
                className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
                placeholder="10"
              />
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
                <Box className="w-4 h-4 mr-2 text-[#E9967A]" /> Stock Qty
              </label>
              <input
                type="number"
                {...register("stock", { required: true })}
                className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
                placeholder="100"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#4A1523] border-b border-[#4A1523]/10 pb-2">3. Ingredients</h3>
          
          <div>
            <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
              <Sparkles className="w-4 h-4 mr-2 text-[#E9967A]" /> Key Active Ingredients
            </label>
            <input
              {...register("key_ingredients")}
              className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
              placeholder="e.g. Niacinamide, Vitamin C, Hyaluronic Acid"
            />
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
              <Droplets className="w-4 h-4 mr-2 text-[#E9967A]" /> Full Ingredients List
            </label>
            <textarea
              {...register("full_ingredients")}
              rows={3}
              className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
              placeholder="Water, Glycerin, Niacinamide..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#4A1523] border-b border-[#4A1523]/10 pb-2">4. Skin Info</h3>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
                <Info className="w-4 h-4 mr-2 text-[#E9967A]" /> Skin Type
              </label>
              <select
                {...register("skin_type")}
                className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
              >
                <option value="All">All Skin Types</option>
                <option value="Oily">Oily</option>
                <option value="Dry">Dry</option>
                <option value="Combination">Combination</option>
                <option value="Sensitive">Sensitive</option>
              </select>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
                <Info className="w-4 h-4 mr-2 text-[#E9967A]" /> Skin Concern
              </label>
              <input
                {...register("skin_concern")}
                className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
                placeholder="e.g. Acne, Pigmentation, Aging"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#4A1523] border-b border-[#4A1523]/10 pb-2">5. Media</h3>
          
          <div>
            <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
              <ImageIcon className="w-4 h-4 mr-2 text-[#E9967A]" /> Product Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none text-sm text-[#4A1523] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E9967A]/10 file:text-[#4A1523] hover:file:bg-[#E9967A]/20 transition-all cursor-pointer"
            />
            
            {previewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[#4A1523]/10 group">
                    <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      title="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-8 flex items-center justify-center py-4 bg-[#4A1523] hover:bg-[#3A101C] text-white rounded-xl transition-all duration-300 shadow-lg shadow-[#4A1523]/20 font-medium tracking-wide disabled:opacity-70"
        >
          {loading ? "Saving..." : <><Upload className="w-5 h-5 mr-2" /> Publish Product</>}
        </button>
      </form>

      <div className="flex flex-col items-center pt-8">
        <h3 className="text-sm font-medium tracking-[2px] text-[#4A1523]/50 uppercase mb-6">Live Preview</h3>
        <div className="w-full max-w-xs rounded-2xl overflow-hidden bg-white border border-[#4A1523]/5 shadow-[0_20px_40px_rgb(74,21,35,0.08)]">
          <div className="aspect-[4/5] bg-[#F8F7F4] relative overflow-hidden group">
            <div 
              className="flex w-full h-full overflow-x-auto snap-x snap-mandatory hide-scrollbar [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={handleScroll}
            >
              {previewUrls.length > 0 ? (
                previewUrls.map((url, i) => (
                  <img key={i} src={url} alt={`Preview ${i}`} className="w-full h-full object-cover flex-shrink-0 snap-center" />
                ))
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#4A1523]/30 min-w-full">
                  <ImageIcon className="w-12 h-12 mb-2" />
                  <span className="text-sm">Image Preview</span>
                </div>
              )}
            </div>
            
            {previewUrls.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {previewUrls.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} 
                  />
                ))}
              </div>
            )}
            
            <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
              {liveData.category && (
                <div className="bg-white/80 backdrop-blur text-[#4A1523] text-xs font-semibold px-3 py-1 rounded-full shadow-sm w-max">
                  {liveData.category}
                </div>
              )}
              {liveData.discount && Number(liveData.discount) > 0 && (
                <div className="bg-[#E9967A]/90 backdrop-blur text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm w-max">
                  {liveData.discount}% OFF
                </div>
              )}
            </div>
          </div>
          
          <div className="p-5">
            <div className="text-xs font-semibold text-[#E9967A] mb-1 uppercase tracking-wider">
              {liveData.brand_name || "Brand Name"}
            </div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-medium text-[#4A1523] truncate pr-4">
                {liveData.name || "Product Name"}
              </h3>
              <div className="flex flex-col items-end">
                {liveData.discount && Number(liveData.discount) > 0 ? (
                  <>
                    <span className="text-[#4A1523] font-medium text-lg">
                      ${(Number(liveData.price) * (1 - Number(liveData.discount) / 100)).toFixed(2)}
                    </span>
                    <span className="text-xs text-[#4A1523]/50 line-through">
                      ${Number(liveData.price).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-[#4A1523] font-medium text-lg">
                    ${liveData.price ? Number(liveData.price).toFixed(2) : "0.00"}
                  </span>
                )}
              </div>
            </div>
            
            <p className="text-sm text-[#4A1523]/60 line-clamp-2 leading-relaxed mb-4">
              {liveData.description || "The product description will appear here..."}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {liveData.skin_type && (
                <span className="text-[10px] bg-[#4A1523]/5 text-[#4A1523]/70 px-2 py-1 rounded-md border border-[#4A1523]/10">
                  For: {liveData.skin_type}
                </span>
              )}
              {liveData.skin_concern && (
                <span className="text-[10px] bg-[#4A1523]/5 text-[#4A1523]/70 px-2 py-1 rounded-md border border-[#4A1523]/10 truncate max-w-[150px]">
                  Targets: {liveData.skin_concern}
                </span>
              )}
            </div>

            {liveData.key_ingredients && (
              <div className="text-xs text-[#4A1523]/70 bg-[#F8F7F4] p-2 rounded-lg border border-[#4A1523]/5 mb-4">
                <span className="font-semibold text-[#4A1523]">Key Actives: </span>
                {liveData.key_ingredients}
              </div>
            )}
            
            <div className="mt-2 pt-4 border-t border-[#4A1523]/10 flex justify-between text-xs text-[#4A1523]/50 font-medium">
              <span>Stock: {liveData.stock || "0"} units</span>
              <span>Ready to publish</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductFormWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductForm />
    </Suspense>
  );
}
