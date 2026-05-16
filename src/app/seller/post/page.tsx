"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { Send, Image as ImageIcon, X, Loader2, Trash2 } from "lucide-react";

export default function PostPage() {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  const fetchPosts = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching posts:", error);
    } else {
      setPosts(data || []);
    }
    setFetching(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const removeImage = () => {
    setFile(null);
    setPreviewUrl("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);
    
    if (error) {
      alert("Error deleting post: " + error.message);
    } else {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handlePost = async () => {
    if (!caption && !file) return alert("Please add a caption or image.");
    setLoading(true);

    try {
      let imageUrl = "";

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `posts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      const payload = {
        id: Date.now(),
        caption,
        image_url: imageUrl || null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("posts").insert([payload]);
      if (error) throw error;

      alert("Post published successfully!");
      setCaption("");
      setFile(null);
      setPreviewUrl("");
      fetchPosts(); // Refresh list
    } catch (error: any) {
      alert("Error publishing post: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Left Column: Create Form */}
      <div>
        <header className="mb-10">
          <h1 className="text-4xl font-semibold tracking-tight text-[#4A1523] mb-2">Create Post</h1>
          <p className="text-[#4A1523]/60 font-light">Share updates, announcements, or behind-the-scenes content.</p>
        </header>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          {/* Caption */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A1523]/50 mb-2 ml-1">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              placeholder="What's happening at your store today?"
              className="w-full px-5 py-4 bg-white/80 border border-[#4A1523]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-[#4A1523] resize-none placeholder:text-[#4A1523]/30"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#4A1523]/50 mb-2 ml-1">Image (Optional)</label>
            {previewUrl ? (
              <div className="relative aspect-video bg-[#F8F7F4] rounded-2xl overflow-hidden border border-[#4A1523]/10">
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={removeImage}
                  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 shadow-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video bg-[#F8F7F4] border-2 border-dashed border-[#4A1523]/10 rounded-2xl cursor-pointer hover:border-[#E9967A]/40 transition-colors group">
                <ImageIcon className="w-10 h-10 text-[#4A1523]/20 mb-3 group-hover:text-[#E9967A]/50 transition-colors" />
                <span className="text-sm text-[#4A1523]/40 group-hover:text-[#4A1523]/60 transition-colors">Click to add an image</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handlePost}
            disabled={loading || (!caption && !file)}
            className="w-full flex items-center justify-center py-4 bg-[#4A1523] hover:bg-[#3A101C] text-white rounded-xl transition-all duration-300 shadow-lg shadow-[#4A1523]/20 font-medium tracking-wide disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" /> Publish Post
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Column: Existing Posts */}
      <div className="flex flex-col">
        <header className="mb-10">
          <h2 className="text-4xl font-semibold tracking-tight text-[#4A1523] mb-2">Live Posts</h2>
          <p className="text-[#4A1523]/60 font-light">Recent updates shared with your customers.</p>
        </header>

        <div className="space-y-6 overflow-y-auto max-h-[70vh] pr-4 no-scrollbar">
          {fetching ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#4A1523]/20" />
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="bg-white/40 border border-white/50 rounded-2xl overflow-hidden group">
                <div className="flex gap-4 p-4">
                  {post.image_url && (
                    <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-[#F8F7F4]">
                      <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-[#4A1523]/40 mb-2">
                      {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-sm text-[#4A1523] line-clamp-3 leading-relaxed mb-4">{post.caption}</p>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="text-[10px] uppercase tracking-widest font-bold text-red-400 hover:text-red-600 transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Post
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/40 border border-white/50 border-dashed rounded-2xl">
              <ImageIcon className="w-12 h-12 text-[#4A1523]/10 mb-4" />
              <p className="text-[#4A1523]/40 italic font-light text-sm">No posts published yet.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
