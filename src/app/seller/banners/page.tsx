"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, X, Upload as UploadIcon, ExternalLink } from "lucide-react";
import { supabase } from "@/src/lib/supabase";

type Banner = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  priority: number;
  link_url: string;
  is_live: boolean;
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(1);
  const [linkUrl, setLinkUrl] = useState("");
  const [isLive, setIsLive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("priority", { ascending: false });
    
    if (error) {
      console.error("Error fetching banners:", error);
    } else if (data) {
      setBanners(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) {
      alert("Error deleting banner: " + error.message);
    } else {
      fetchBanners();
    }
  };

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setTitle(banner.title || "");
      setDescription(banner.description || "");
      setPriority(banner.priority || 0);
      setLinkUrl(banner.link_url || "");
      setIsLive(banner.is_live !== false);
      setPreviewUrl(banner.image_url || "");
    } else {
      setEditingBanner(null);
      setTitle("");
      setDescription("");
      setPriority(1);
      setLinkUrl("");
      setIsLive(true);
      setPreviewUrl("");
    }
    setFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const saveBanner = async () => {
    if (!title || (!file && !previewUrl)) return alert("Please provide a title and an image.");
    setSaving(true);
    
    try {
      let finalImageUrl = previewUrl;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `banners/${fileName}`;
        
        const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file);
        if (uploadError) throw uploadError;
        
        const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
        finalImageUrl = data.publicUrl;
      }

      const payload = {
        title,
        description,
        priority,
        link_url: linkUrl,
        is_live: isLive,
        image_url: finalImageUrl
      };

      if (editingBanner) {
        const { error } = await supabase.from("banners").update(payload).eq("id", editingBanner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert([{ id: Date.now(), ...payload }]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (e: any) {
      alert("Error saving banner: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 md:p-12 relative min-h-screen bg-[#FDFBFB]">
      <header className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-[#4A1523] mb-2">Banners & Promotions</h1>
          <p className="text-[#4A1523]/60 font-light">Manage your store's homepage hero section and seasonal offers.</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="flex items-center gap-2 bg-[#4A1523] hover:bg-[#3A101C] text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#4A1523]/20 font-medium"
        >
          <Plus className="w-5 h-5" /> ADD NEW
        </button>
      </header>

      {loading ? (
        <div className="py-20 text-center text-[#4A1523]/50 animate-pulse">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="py-20 text-center bg-white/40 backdrop-blur-md rounded-3xl border border-[#4A1523]/5 text-[#4A1523]/50">
          <UploadIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="font-light">No banners found. Start by adding your first promotion!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#4A1523]/5 flex flex-col group transition-all hover:shadow-[0_12px_40px_rgb(74,21,35,0.08)]">
              <div className="aspect-[21/9] relative overflow-hidden bg-[#F8F7F4]">
                <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {!banner.is_live && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-[#4A1523]/10 text-[#4A1523] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-[#4A1523]/20">Draft</span>
                  </div>
                )}
                {banner.is_live && (
                  <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm">
                    Live
                  </div>
                )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-[#4A1523] line-clamp-1">{banner.title}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#E9967A] bg-[#E9967A]/5 px-2 py-1 rounded-md border border-[#E9967A]/10">
                    P{banner.priority}
                  </div>
                </div>
                <p className="text-sm text-[#4A1523]/60 mb-6 line-clamp-2 font-light leading-relaxed">{banner.description}</p>
                
                {banner.link_url && (
                  <div className="flex items-center gap-2 text-xs text-[#E9967A] font-medium mb-6 bg-[#E9967A]/5 p-2 rounded-lg border border-[#E9967A]/10 truncate">
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    {banner.link_url}
                  </div>
                )}

                <div className="flex gap-3 mt-auto">
                  <button 
                    onClick={() => openModal(banner)} 
                    className="flex-1 flex items-center justify-center gap-2 bg-[#F8F7F4] text-[#4A1523] hover:bg-[#E9967A] hover:text-white py-3 rounded-xl font-medium transition-all"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(banner.id)} 
                    className="w-12 flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#4A1523]/40 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl p-8 my-auto relative border border-white/50">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-[#4A1523]">{editingBanner ? "Edit Banner" : "Create Promotion"}</h2>
                <p className="text-sm text-[#4A1523]/50">Enter the details for your billboard campaign.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#F8F7F4] rounded-full transition-colors text-[#4A1523]/30 hover:text-[#4A1523]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#4A1523]/50 mb-2 ml-1">Banner Title</label>
                <input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  type="text" 
                  placeholder="e.g. Summer Skincare Glow Up"
                  className="w-full px-5 py-3.5 bg-[#F8F7F4] border border-[#4A1523]/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/30 text-[#4A1523]" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#4A1523]/50 mb-2 ml-1">Short Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={2} 
                  placeholder="A catchphrase to attract customers..."
                  className="w-full px-5 py-3.5 bg-[#F8F7F4] border border-[#4A1523]/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/30 text-[#4A1523] resize-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#4A1523]/50 mb-2 ml-1">Priority (1-10)</label>
                  <input 
                    value={priority} 
                    onChange={e => setPriority(parseInt(e.target.value) || 0)} 
                    type="number" 
                    className="w-full px-5 py-3.5 bg-[#F8F7F4] border border-[#4A1523]/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/30 text-[#4A1523]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#4A1523]/50 mb-2 ml-1">Link URL</label>
                  <input 
                    value={linkUrl} 
                    onChange={e => setLinkUrl(e.target.value)} 
                    type="text" 
                    placeholder="/collections/skincare" 
                    className="w-full px-5 py-3.5 bg-[#F8F7F4] border border-[#4A1523]/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/30 text-[#4A1523]" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#4A1523]/50 mb-2 ml-1">Banner Image (Wide aspect ratio recommended)</label>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="w-full px-5 py-3.5 bg-[#F8F7F4] border border-[#4A1523]/5 rounded-2xl focus:outline-none text-sm text-[#4A1523] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#E9967A]/10 file:text-[#E9967A] hover:file:bg-[#E9967A]/20 cursor-pointer" 
                  />
                </div>
                {previewUrl && (
                  <div className="mt-4 aspect-[21/9] bg-[#F8F7F4] rounded-2xl overflow-hidden relative border border-[#4A1523]/5">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mt-4 bg-[#F8F7F4] p-4 rounded-2xl border border-[#4A1523]/5">
                <input 
                  type="checkbox" 
                  id="isLive" 
                  checked={isLive} 
                  onChange={e => setIsLive(e.target.checked)} 
                  className="w-5 h-5 rounded-md border-[#4A1523]/20 text-[#4A1523] focus:ring-[#E9967A]" 
                />
                <label htmlFor="isLive" className="text-sm font-medium text-[#4A1523]">Publish immediately (Make visible to customers)</label>
              </div>

              <button 
                disabled={saving} 
                onClick={saveBanner} 
                className="w-full mt-4 flex items-center justify-center py-4 bg-[#4A1523] hover:bg-[#3A101C] text-white rounded-2xl transition-all font-medium shadow-lg shadow-[#4A1523]/20 disabled:opacity-70"
              >
                {saving ? "Saving campaign..." : <><UploadIcon className="w-5 h-5 mr-2" /> {editingBanner ? "Update Banner" : "Publish Banner"}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
