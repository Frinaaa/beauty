"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { Upload, Tag, DollarSign, Layers, Image as ImageIcon, Box, Percent, Droplets, Sparkles, Info, X, Plus, Feather, ListChecks } from "lucide-react";

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
  benefits: string;
  texture_feel: string;
};

type KeyIngredient = { name: string; description: string };

function ProductForm() {
  const router = useRouter();
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { 
      name: "", brand_name: "", category: "CLEANSING", price: "", discount: "", 
      stock: "", description: "", full_ingredients: "", key_ingredients: "", 
      skin_type: "All", skin_concern: "", benefits: "", texture_feel: ""
    }
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [keyIngredients, setKeyIngredients] = useState<KeyIngredient[]>([{ name: "", description: "" }]);
  const searchParams = useSearchParams();
  const productId = searchParams?.get("id");
  const isEditing = Boolean(productId);

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
            benefits: data.benefits || "",
            texture_feel: data.texture_feel || "",
          });
          if (data.key_ingredients_detail) {
            setKeyIngredients(data.key_ingredients_detail);
          }
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
    setPreviewUrls((prevPreview) => {
      const updatedPreview = prevPreview.filter((_, i) => i !== indexToRemove);
      const existingCount = prevPreview.length - files.length;
      if (indexToRemove >= existingCount) {
        const fileIndex = indexToRemove - existingCount;
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== fileIndex));
      }
      return updatedPreview;
    });
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
        benefits: data.benefits,
        key_ingredients_detail: keyIngredients.filter(k => k.name.trim()),
        texture_feel: data.texture_feel,
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
              <option value="CLEANSING">CLEANSING</option>
              <option value="REGENERATION">REGENERATION</option>
              <option value="HYDRATION">HYDRATION</option>
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

        {/* 5. Benefits */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#4A1523] border-b border-[#4A1523]/10 pb-2">5. Benefits</h3>
          <div>
            <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
              <ListChecks className="w-4 h-4 mr-2 text-[#E9967A]" /> Product Benefits
            </label>
            <textarea
              {...register("benefits")}
              rows={4}
              className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
              placeholder={"Deeply hydrates the dermal layers\nVisible reduction in fine lines within 14 days\nOrganic botanical extracts for sensitive skin"}
            />
            <p className="text-xs text-[#4A1523]/40 mt-1 ml-1">One benefit per line</p>
          </div>
        </div>

        {/* 6. Key Ingredients (Structured) */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#4A1523] border-b border-[#4A1523]/10 pb-2">6. Key Ingredients Detail</h3>
          {keyIngredients.map((ing, idx) => (
            <div key={idx} className="grid grid-cols-[1fr_fr_auto] gap-3 items-start">
              <input
                value={ing.name}
                onChange={(e) => {
                  const updated = [...keyIngredients];
                  updated[idx].name = e.target.value;
                  setKeyIngredients(updated);
                }}
                className="px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523] text-sm"
                placeholder="e.g. Hyaluronic Acid"
              />
              <input
                value={ing.description}
                onChange={(e) => {
                  const updated = [...keyIngredients];
                  updated[idx].description = e.target.value;
                  setKeyIngredients(updated);
                }}
                className="px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523] text-sm"
                placeholder="Short description..."
              />
              {keyIngredients.length > 1 && (
                <button type="button" onClick={() => setKeyIngredients(prev => prev.filter((_, i) => i !== idx))} className="p-3 text-red-400 hover:text-red-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => setKeyIngredients(prev => [...prev, { name: "", description: "" }])}
            className="flex items-center gap-2 text-sm text-[#E9967A] hover:text-[#4A1523] transition-colors font-medium"
          >
            <Plus className="w-4 h-4" /> Add Ingredient
          </button>
        </div>

        {/* 7. Texture & Feel */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#4A1523] border-b border-[#4A1523]/10 pb-2">7. Texture & Feel</h3>
          <div>
            <label className="flex items-center text-sm font-medium text-[#4A1523] mb-2">
              <Feather className="w-4 h-4 mr-2 text-[#E9967A]" /> Texture Description
            </label>
            <textarea
              {...register("texture_feel")}
              rows={3}
              className="w-full px-4 py-3 bg-white/80 border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523]"
              placeholder="A lightweight, silky liquid that glides onto the skin..."
            />
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-[#4A1523] border-b border-[#4A1523]/10 pb-2">8. Media</h3>
          
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
          {loading ? "Saving..." : <><Upload className="w-5 h-5 mr-2" /> {isEditing ? "Update Product" : "Publish Product"}</>}
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
                      ₹{(Number(liveData.price) * (1 - Number(liveData.discount) / 100)).toFixed(2)}
                    </span>
                    <span className="text-xs text-[#4A1523]/50 line-through">
                      ₹{Number(liveData.price).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-[#4A1523] font-medium text-lg">
                    ₹{liveData.price ? Number(liveData.price).toFixed(2) : "0.00"}
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

            {keyIngredients.some((ing) => ing.name.trim() || ing.description.trim()) && (
              <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-[2px] text-[#4A1523]/50 mb-2">Ingredient Details</div>
                <ul className="list-disc list-inside text-xs text-[#4A1523]/70 space-y-1">
                  {keyIngredients.filter((ing) => ing.name.trim() || ing.description.trim()).map((ing, idx) => (
                    <li key={idx}>
                      <span className="font-semibold text-[#4A1523]">{ing.name || "Ingredient"}</span>
                      {ing.description ? ` — ${ing.description}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {liveData.full_ingredients && (
              <div className="text-[11px] text-[#4A1523]/70 bg-[#F8F7F4] p-3 rounded-xl border border-[#4A1523]/10 mb-4">
                <div className="font-semibold text-[#4A1523] mb-1">Full Ingredients</div>
                <p className="whitespace-pre-line leading-relaxed">{liveData.full_ingredients}</p>
              </div>
            )}

            {liveData.texture_feel && (
              <div className="text-[11px] text-[#4A1523]/80 bg-[#FFF8F3] p-3 rounded-xl border border-[#E9967A]/20 mb-4">
                <div className="font-semibold text-[#4A1523] mb-1">Texture & Feel</div>
                <p className="leading-relaxed">{liveData.texture_feel}</p>
              </div>
            )}

            {liveData.benefits && (
              <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-[2px] text-[#4A1523]/50 mb-2">Benefits</div>
                <ul className="list-disc list-inside text-xs text-[#4A1523]/70 space-y-1 whitespace-pre-line">
                  {liveData.benefits.split(/\r?\n/).filter(Boolean).map((benefit: string, idx: number) => (
                    <li key={idx}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-2 pt-4 border-t border-[#4A1523]/10 flex flex-col gap-2 text-xs text-[#4A1523]/50 font-medium">
              <span>Stock: {liveData.stock || "0"} units</span>
              {liveData.discount ? (
                <span>{liveData.discount}% discount applied</span>
              ) : (
                <span>No discount applied</span>
              )}
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
