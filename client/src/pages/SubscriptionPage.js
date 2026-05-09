import React, { useState, useEffect, useCallback } from "react";
import Layout from "../components/layout/Layout";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import config from "../config";
import Swal from "sweetalert2";
import axios from "axios";
import { AiFillCheckCircle, AiFillStar, AiOutlineTag } from "react-icons/ai";
import { updateUser } from "../redux/slices/authSlice";

function SubscriptionPage() {
  const auth = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ subscriptionPrice: 499, currency: "INR" });
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchSettings = useCallback(async () => {
    try {
      const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/settings/get-settings`);
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
      
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      setLoading(true);
      const { data } = await axios.post(`${config.API_BASE_URL}/api/v1/coupons/validate`, {
        code: couponCode,
        amount: settings.subscriptionPrice
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      if (data.success) {
        setDiscount(data.discount);
        setAppliedCoupon(data);
        Swal.fire({
          icon: "success",
          title: "Coupon Applied!",
          text: `You saved ₹${data.discount}`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Invalid coupon", "error");
      setDiscount(0);
      setAppliedCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!auth?.token) {
      return Swal.fire("Login Required", "Please login to subscribe", "warning");
    }

    setLoading(true);
    try {
      const finalAmount = settings.subscriptionPrice - discount;
      
      // 1. Create Order for Subscription
      const { data: orderRes } = await axios.post(`${config.API_BASE_URL}/api/v1/payment/orders`, {
        amount: finalAmount,
      });

      if (orderRes.code !== 200) throw new Error("Failed to create order");

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_DiJk5T6Kc6ampr",
        amount: orderRes.data.amount,
        currency: settings.currency,
        name: "TMP OTT Premium",
        description: "Monthly Unlimited Subscription",
        order_id: orderRes.data.id,
        handler: async function (response) {
          try {
            const { data: verifyRes } = await axios.post(`${config.API_BASE_URL}/api/v1/payment/verify-subscription`, {
              response,
              userId: auth.user._id,
              couponId: appliedCoupon?.couponId
            });

            if (verifyRes.code === 200) {
              dispatch(updateUser({ 
                subscription: true,
                subscriptionEndDate: verifyRes.subscriptionEndDate
              }));

              Swal.fire({
                icon: "success",
                title: "Welcome to Premium!",
                text: "Your monthly subscription is now active.",
                background: "#18181b",
                color: "#fff",
                confirmButtonColor: "#f59e0b",
              });
              
              navigate("/dashboard/user");
            } else {
              Swal.fire("Error", "Payment verification failed", "error");
            }
          } catch (err) {
            Swal.fire("Error", "Something went wrong during verification", "error");
          }
        },
        prefill: {
          name: auth.user.name,
          email: auth.user.email,
        },
        theme: {
          color: "#f59e0b",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      
      Swal.fire("Error", "Could not initiate payment", "error");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    "Unlimited access to 4K Cinematic content",
    "Watch on any device (Mobile, TV, Web)",
    "Ad-free viewing experience",
    "Offline downloads available",
    "Exclusive behind-the-scenes access"
  ];

  const finalPrice = settings.subscriptionPrice - discount;

  return (
    <Layout title="Premium Subscription - TMP OTT">
      <div className="min-h-screen bg-black px-4 py-32 text-white flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
              UNLIMITED <span className="text-amber-500">EXPERIENCE</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto">
              Join thousands of cinephiles and unlock the full potential of TMP OTT. 
              The best stories, delivered in stunning quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Benefits List */}
            <div className="space-y-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="bg-amber-500/10 p-2 rounded-full text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
                    <AiFillCheckCircle size={24} />
                  </div>
                  <span className="text-lg font-medium text-zinc-300">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Pricing Card */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl p-10 shadow-2xl">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-white">Monthly Plan</h2>
                    <p className="text-zinc-500 text-sm">Cancel anytime</p>
                  </div>
                  <AiFillStar className="text-amber-500" size={32} />
                </div>

                <div className="mb-6">
                  {discount > 0 && (
                    <p className="text-zinc-500 text-sm line-through mb-1">₹{settings.subscriptionPrice}</p>
                  )}
                  <span className="text-6xl font-black text-white">₹{finalPrice}</span>
                  <span className="text-zinc-500 text-xl font-bold ml-2">/ month</span>
                </div>

                {/* Promo Code Input */}
                <div className="mb-8">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <AiOutlineTag className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="text" 
                        placeholder="Promo Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="w-full bg-zinc-800 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-white placeholder-zinc-600 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <button 
                      onClick={handleApplyCoupon}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl text-xs font-black transition-all"
                    >
                      APPLY
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-[10px] text-emerald-500 font-bold mt-2 uppercase tracking-widest flex items-center gap-1">
                      <AiFillCheckCircle /> {appliedCoupon.message}
                    </p>
                  )}
                </div>

                <button
                  disabled={loading}
                  onClick={handleSubscribe}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black py-5 rounded-2xl text-xl font-black transition-all hover:scale-[1.02] active:scale-95 shadow-[0_20px_50px_rgba(245,158,11,0.2)]"
                >
                  {loading ? "PROCESSING..." : "GET PREMIUM NOW"}
                </button>

                <p className="mt-6 text-center text-xs text-zinc-600">
                  Recurring billing. Secure 256-bit SSL encrypted payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SubscriptionPage;
