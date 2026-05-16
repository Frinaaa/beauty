"use client";

import Link from "next/link";
import { LayoutDashboard, PlusSquare, Package, Settings, LogOut, Send, ShoppingBag } from "lucide-react";
import { signOutAction } from "@/src/app/actions/auth";

export default function Sidebar() {
  const handleSignOut = async () => {
    const result = await signOutAction();
    if (result.success) {
      window.location.href = "/";
    }
  };

  return (
    <aside className="w-64 bg-[#4A1523] text-white flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.1)] relative z-10">
      <div className="p-8">
        <h2 className="text-2xl font-light tracking-[4px] text-white mb-2">BEAUTY</h2>
        <p className="text-[#E9967A] text-xs tracking-widest uppercase font-medium">Seller Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link href="/seller" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
          <LayoutDashboard className="w-5 h-5 mr-3 group-hover:text-[#E9967A] transition-colors" />
          <span className="font-medium tracking-wide">Overview</span>
        </Link>
        <Link href="/seller/add-product" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
          <PlusSquare className="w-5 h-5 mr-3 group-hover:text-[#E9967A] transition-colors" />
          <span className="font-medium tracking-wide">Add Product</span>
        </Link>
        <Link href="/seller/post" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
          <Send className="w-5 h-5 mr-3 group-hover:text-[#E9967A] transition-colors" />
          <span className="font-medium tracking-wide">Post</span>
        </Link>
        <Link href="/seller/orders" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
          <ShoppingBag className="w-5 h-5 mr-3 group-hover:text-[#E9967A] transition-colors" />
          <span className="font-medium tracking-wide">Orders</span>
        </Link>
        <Link href="/seller/collections" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
          <Package className="w-5 h-5 mr-3 group-hover:text-[#E9967A] transition-colors" />
          <span className="font-medium tracking-wide">Collections</span>
        </Link>
        <Link href="/seller/banners" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
          <Settings className="w-5 h-5 mr-3 group-hover:text-[#E9967A] transition-colors" />
          <span className="font-medium tracking-wide">Banners</span>
        </Link>
      </nav>

      <div className="p-4 mb-4 border-t border-white/10 mx-4 pt-6">
        <button 
          onClick={handleSignOut}
          className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all w-full group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:text-[#E9967A] transition-colors" />
          <span className="font-medium tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
