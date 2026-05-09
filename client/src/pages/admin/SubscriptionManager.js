import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axios from "axios";
import config from "../../config";
import Swal from "sweetalert2";
import moment from "moment";
import { 
  BiCreditCard, 
  BiPurchaseTag, 
  BiPlus, 
  BiTrash, 
  BiRefresh, 
  BiCheckCircle, 
  BiXCircle,
  BiTrendingUp,
  BiLoaderAlt
} from "react-icons/bi";

export default function SubscriptionManager() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ subscriptionPrice: 499, currency: "INR" });
  const [coupons, setCoupons] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: 0,
    minPurchase: 0,
    expiryDate: "",
    usageLimit: 100
  });

  const auth = JSON.parse(localStorage.getItem("auth"));

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [settingsRes, couponsRes] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/api/v1/settings/get-settings`),
        axios.get(`${config.API_BASE_URL}/api/v1/coupons/all`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
      ]);

      if (settingsRes.data.success) {
        setSettings(settingsRes.data.settings);
      }
      if (couponsRes.data.success) {
        setCoupons(couponsRes.data.coupons);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdatePrice = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${config.API_BASE_URL}/api/v1/settings/update-settings`, {
        subscriptionPrice: settings.subscriptionPrice,
        currency: settings.currency
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      if (data.success) {
        Swal.fire("Success", "Pricing updated successfully", "success");
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update pricing", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(`${config.API_BASE_URL}/api/v1/coupons/create`, newCoupon, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      if (data.success) {
        Swal.fire("Success", "Coupon created successfully", "success");
        setShowCouponModal(false);
        fetchData();
      }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to create coupon", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await axios.put(`${config.API_BASE_URL}/api/v1/coupons/toggle/${id}`, {}, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  const handleDeleteCoupon = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const { data } = await axios.delete(`${config.API_BASE_URL}/api/v1/coupons/delete/${id}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (data.success) {
          Swal.fire("Deleted!", "Coupon has been deleted.", "success");
          fetchData();
        }
      } catch (error) {
        Swal.fire("Error", "Failed to delete coupon", "error");
      }
    }
  };

  return (
    <AdminLayout title="Subscription & Promotions - Admin">
          <div className="mb-10 flex justify-between items-center">
            <div>
              <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Revenue Management</h1>
              <h2 className="text-4xl font-black text-white">Subscription & Promotions</h2>
            </div>
            <button onClick={fetchData} className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all">
              <BiRefresh size={24} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Dynamic Pricing Manager */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                  <BiCreditCard size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Pricing Manager</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Monthly Tier Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
                    <input 
                      type="number" 
                      value={settings.subscriptionPrice} 
                      onChange={(e) => setSettings({ ...settings, subscriptionPrice: e.target.value })}
                      className="w-full bg-zinc-800 border-none rounded-2xl pl-8 pr-4 py-4 text-white font-black text-2xl focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Currency</label>
                  <select 
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    className="w-full bg-zinc-800 border-none rounded-2xl px-4 py-4 text-white font-bold"
                  >
                    <option value="INR">Indian Rupee (INR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </div>
                <button 
                  onClick={handleUpdatePrice}
                  className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,165,9,0.2)]"
                >
                  UPDATE PRICING
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Active Coupons</p>
                  <h4 className="text-5xl font-black text-white">{coupons.filter(c => c.isActive).length}</h4>
                </div>
                <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                  <BiTrendingUp /> Live on platform
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Total Savings Given</p>
                  <h4 className="text-5xl font-black text-white">₹14.2k</h4>
                  <p className="text-zinc-500 text-xs mt-2 italic font-medium">Mock cumulative data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Coupon Management */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                  <BiPurchaseTag size={24} />
                </div>
                <h3 className="text-xl font-black text-white">Coupon Codes</h3>
              </div>
              <button 
                onClick={() => setShowCouponModal(true)}
                className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-2xl text-sm font-black transition-all"
              >
                <BiPlus size={20} /> CREATE COUPON
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="pb-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Code</th>
                    <th className="pb-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Discount</th>
                    <th className="pb-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Usage</th>
                    <th className="pb-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Expiry</th>
                    <th className="pb-4 text-xs font-black text-zinc-500 uppercase tracking-widest">Status</th>
                    <th className="pb-4 text-right text-xs font-black text-zinc-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {coupons.map((coupon) => (
                    <tr key={coupon._id} className="group hover:bg-zinc-800/30 transition-all">
                      <td className="py-6">
                        <span className="bg-zinc-800 text-amber-500 px-3 py-1 rounded-lg font-black text-sm border border-zinc-700">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="py-6">
                        <span className="text-white font-bold">
                          {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                        </span>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">Min: ₹{coupon.minPurchase}</p>
                      </td>
                      <td className="py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-amber-500 rounded-full" 
                              style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-zinc-400">{coupon.usedCount}/{coupon.usageLimit}</span>
                        </div>
                      </td>
                      <td className="py-6 text-sm text-zinc-400 font-medium">
                        {moment(coupon.expiryDate).format("DD MMM YYYY")}
                      </td>
                      <td className="py-6">
                        <button 
                          onClick={() => handleToggleStatus(coupon._id)}
                          className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                            coupon.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {coupon.isActive ? <BiCheckCircle /> : <BiXCircle />}
                          {coupon.isActive ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="py-6 text-right">
                        <button 
                          onClick={() => handleDeleteCoupon(coupon._id)}
                          className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                        >
                          <BiTrash size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-20 text-center text-zinc-500 font-bold italic">
                        No coupons found. Create your first campaign!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

      {/* Create Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowCouponModal(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black text-white mb-8">New Promo Code</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Coupon Code</label>
                  <input 
                    type="text" required placeholder="SUMMER50"
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                    className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white font-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Type</label>
                  <select 
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white font-bold"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Value</label>
                  <input 
                    type="number" required
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                    className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white font-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Min Purchase</label>
                  <input 
                    type="number"
                    onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: e.target.value })}
                    className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white font-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Usage Limit</label>
                  <input 
                    type="number"
                    onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: e.target.value })}
                    className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white font-black"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-2">Expiry Date</label>
                  <input 
                    type="date" required
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                    className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white font-black"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 bg-zinc-800 text-white py-4 rounded-2xl font-black hover:bg-zinc-700"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-amber-500 text-black py-4 rounded-2xl font-black hover:bg-amber-400"
                >
                  {loading ? <BiLoaderAlt className="animate-spin mx-auto" /> : "CREATE CAMPAIGN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
