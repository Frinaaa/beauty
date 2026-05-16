"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  MoreVertical, 
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Truck
} from "lucide-react";
import Link from "next/link";

type Order = {
  id: string;
  created_at: string;
  user_id: string;
  total_amount: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  customer_email?: string;
  items?: any[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Shipped': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="w-3 h-3 mr-1" />;
      case 'Delivered': return <CheckCircle2 className="w-3 h-3 mr-1" />;
      case 'Cancelled': return <XCircle className="w-3 h-3 mr-1" />;
      case 'Shipped': return <Truck className="w-3 h-3 mr-1" />;
      default: return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (order.customer_email && order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 md:p-12">
      <header className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-[#4A1523] mb-2">Orders</h1>
        <p className="text-[#4A1523]/60 font-light">Manage and track customer purchases</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
        <div className="relative w-full md:max-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#4A1523]/40 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#4A1523]/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E9967A]/50 text-sm text-[#4A1523] shadow-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#4A1523]/5 p-1 rounded-2xl border border-[#4A1523]/10 shadow-inner overflow-x-auto no-scrollbar max-w-full">
          {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(status => {
            const count = status === "All" 
              ? orders.length 
              : orders.filter(o => o.status === status).length;
            
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`relative px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === status 
                  ? 'bg-white text-[#4A1523] shadow-sm' 
                  : 'text-[#4A1523]/40 hover:text-[#4A1523]/70'
                }`}
              >
                {status.toUpperCase()}
                <span className={`inline-flex items-center justify-center min-w-[1.25rem] h-4 px-1 rounded-full text-[9px] ${
                  statusFilter === status 
                  ? 'bg-[#4A1523] text-white' 
                  : 'bg-[#4A1523]/10 text-[#4A1523]/60'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
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

      <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#4A1523]/5 border-b border-[#4A1523]/10">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#4A1523]/70">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#4A1523]/70">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#4A1523]/70">Customer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#4A1523]/70">Total</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#4A1523]/70">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-[#4A1523]/70 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4A1523]/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#4A1523]/40 italic">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/40 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#4A1523] block">#{order.id.slice(0, 8)}...</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#4A1523]/60">
                      {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#4A1523] font-medium">{order.customer_email || "N/A"}</div>
                      <div className="text-[10px] text-[#4A1523]/40 truncate max-w-[150px]">ID: {order.user_id}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-[#4A1523]">
                      ${order.total_amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/seller/orders/${order.id}`}
                        className="inline-flex items-center justify-center p-2 text-[#4A1523]/40 hover:text-[#E9967A] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <ShoppingBag className="w-12 h-12 text-[#4A1523]/10 mx-auto mb-4" />
                    <p className="text-[#4A1523]/40 font-light">No orders found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
