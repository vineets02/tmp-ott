import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AdminLayout from "../../components/layout/AdminLayout";
import axios from "axios";
import config from "../../config";
import moment from "moment";
import { 
  BiReceipt, 
  BiUser, 
  BiTime, 
  BiCheckCircle, 
  BiXCircle,
  BiLoaderAlt,
  BiTrendingUp,
  BiChevronLeft,
  BiChevronRight
} from "react-icons/bi";

export default function AllOrders() {
  const auth = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const getOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/auth/all-orders`);
      setOrders(data || []);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) getOrders();
  }, [auth?.token]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "completed":
        return "bg-emerald-500/10 text-emerald-500 ring-emerald-500/30";
      case "failed":
      case "cancelled":
        return "bg-red-500/10 text-red-500 ring-red-500/30";
      default:
        return "bg-amber-500/10 text-amber-500 ring-amber-500/30";
    }
  };

  return (
    <AdminLayout title="Subscription Management - TMP Admin">
      <div className="mb-10">
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Revenue Tracking</h1>
            <h2 className="text-4xl font-black text-white">Subscription Orders</h2>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-800/50 border-b border-zinc-800">
                    <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest">Order Details</th>
                    <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest">Plan / Title</th>
                    <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-center">Payment Status</th>
                    <th className="px-6 py-5 text-xs font-black text-zinc-500 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center">
                        <div className="flex justify-center">
                          <BiLoaderAlt className="animate-spin text-amber-500" size={32} />
                        </div>
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center text-zinc-500 font-bold italic">
                        No subscription orders found...
                      </td>
                    </tr>
                  ) : orders.map((order, index) => (
                    <tr key={order._id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-white font-black text-sm uppercase tracking-tighter">#{order._id.slice(-8)}</span>
                          <span className="text-zinc-500 text-[10px] flex items-center gap-1">
                            <BiTime /> {moment(order.createAt).format("MMM DD, YYYY • HH:mm")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-amber-500 border border-zinc-700">
                            {order.buyer?.name?.[0].toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white font-bold text-sm">{order.buyer?.name}</span>
                            <span className="text-zinc-500 text-[10px]">{order.buyer?.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-8 rounded bg-zinc-800 overflow-hidden">
                            {order.movies?.[0] && (
                              <img 
                                src={`${config.API_BASE_URL}/api/v1/movie/movie-photo/${order.movies[0]._id}`} 
                                className="h-full w-full object-cover"
                                alt=""
                              />
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-zinc-300 font-bold text-xs truncate max-w-[150px]">
                              {order.movies?.[0]?.title || "Premium Subscription"}
                            </span>
                            <span className="text-zinc-600 text-[10px] uppercase font-black tracking-widest">
                              One-Time Access
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ring-1 ${getStatusStyle(order.status)}`}>
                          {order.payment?.success ? <BiCheckCircle /> : <BiXCircle />}
                          {order.payment?.success ? "Authorized" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-white font-black text-lg tracking-tighter italic">₹{order.movies?.[0]?.price || 0}</span>
                          <span className="text-emerald-500 text-[8px] font-black uppercase flex items-center gap-1">
                            <BiTrendingUp /> NET REVENUE
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-zinc-800/20 px-6 py-6 flex items-center justify-between border-t border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 text-[10px] font-bold uppercase mr-2">Total Sales:</span>
                  <span className="text-white font-black text-sm">₹{orders.reduce((acc, curr) => acc + (curr.movies?.[0]?.price || 0), 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="h-10 px-6 rounded-xl bg-zinc-900 text-zinc-600 text-[10px] font-black uppercase tracking-widest border border-zinc-800">Export CSV</button>
                <div className="flex gap-1">
                  <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-600 border border-zinc-800"><BiChevronLeft size={20}/></button>
                  <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-600 border border-zinc-800"><BiChevronRight size={20}/></button>
                </div>
              </div>
            </div>
          </div>
    </AdminLayout>
  );
}
