"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { 
  ArrowLeft, 
  Package, 
  User, 
  MapPin, 
  CreditCard, 
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Truck
} from "lucide-react";
import Link from "next/link";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
};

type Order = {
  id: string;
  created_at: string;
  user_id: string;
  total_amount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  customer_email?: string;
  shipping_address?: any;
  items?: OrderItem[];
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrderDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching order details:", error);
    } else {
      setOrder(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchOrderDetails();
  }, [id]);

  const updateOrderStatus = async (newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      alert("Failed to update status: " + error.message);
    } else {
      setOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#4A1523]/40 italic">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-semibold text-[#4A1523] mb-4">Order Not Found</h2>
        <button onClick={() => router.back()} className="text-[#E9967A] hover:underline">
          Go back to orders list
        </button>
      </div>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Pending': return { color: 'text-yellow-600 bg-yellow-50', icon: <Clock className="w-5 h-5" />, next: 'Processing' };
      case 'Processing': return { color: 'text-blue-600 bg-blue-50', icon: <AlertCircle className="w-5 h-5" />, next: 'Shipped' };
      case 'Shipped': return { color: 'text-purple-600 bg-purple-50', icon: <Truck className="w-5 h-5" />, next: 'Delivered' };
      case 'Delivered': return { color: 'text-green-600 bg-green-50', icon: <CheckCircle2 className="w-5 h-5" />, next: null };
      default: return { color: 'text-gray-600 bg-gray-50', icon: null, next: null };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-[#4A1523]/60 hover:text-[#4A1523] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Orders
        </button>
        
        <div className="flex items-center gap-3">
          {statusInfo.next && (
            <button
              onClick={() => updateOrderStatus(statusInfo.next!)}
              disabled={updating}
              className="bg-[#4A1523] text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-[#3A101C] transition-all shadow-lg shadow-[#4A1523]/20 flex items-center"
            >
              {updating ? "Updating..." : `Mark as ${statusInfo.next}`}
              {!updating && <ChevronRight className="w-4 h-4 ml-1" />}
            </button>
          )}
          {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
            <button
              onClick={() => updateOrderStatus('Cancelled')}
              disabled={updating}
              className="border border-red-200 text-red-500 px-6 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition-all"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Order Summary */}
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-[#4A1523]">Order #{order.id.slice(0, 8)}</h2>
                <p className="text-sm text-[#4A1523]/60">Placed on {new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div className={`px-4 py-2 rounded-full border flex items-center ${statusInfo.color}`}>
                {statusInfo.icon}
                <span className="ml-2 font-bold text-xs uppercase tracking-widest">{order.status}</span>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#4A1523]/40 border-b border-[#4A1523]/10 pb-2">Order Items</h3>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-[#F8F7F4] rounded-xl overflow-hidden border border-[#4A1523]/5">
                        {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-medium text-[#4A1523]">{item.name}</p>
                        <p className="text-xs text-[#4A1523]/40">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-[#4A1523]">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t border-[#4A1523]/10 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A1523]/60">Subtotal</span>
                  <span className="text-[#4A1523]">₹{order.total_amount?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#4A1523]/60">Shipping</span>
                  <span className="text-[#4A1523] font-medium text-green-600">Calculated</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-4 border-t border-[#4A1523]/10 text-[#4A1523]">
                  <span>Total Amount</span>
                  <span>₹{order.total_amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Customer Info */}
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#4A1523]/40 mb-6 flex items-center">
              <User className="w-4 h-4 mr-2" /> Customer Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[#4A1523]">{order.customer_email || "N/A"}</p>
                <p className="text-xs text-[#4A1523]/40">Email Address</p>
              </div>
              <div className="pt-4 border-t border-[#4A1523]/10">
                <p className="text-sm font-medium text-[#4A1523]">User ID</p>
                <p className="text-xs text-[#4A1523]/40 truncate">{order.user_id}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#4A1523]/40 mb-6 flex items-center">
              <MapPin className="w-4 h-4 mr-2" /> Shipping Address
            </h3>
            {order.shipping_address ? (
              <div className="text-sm text-[#4A1523] leading-relaxed">
                <p className="font-medium">{order.shipping_address.fullName}</p>
                <p>{order.shipping_address.street}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.zipCode}</p>
                <p>{order.shipping_address.country}</p>
                <p className="mt-2 text-xs text-[#4A1523]/60 font-medium">{order.shipping_address.phone}</p>
              </div>
            ) : (
              <p className="text-sm text-[#4A1523]/40 italic">No shipping info provided</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#4A1523]/40 mb-6 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" /> Payment Info
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4A1523]/5 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-[#4A1523]/60" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#4A1523]">Prepaid / Cards</p>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Confirmed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
