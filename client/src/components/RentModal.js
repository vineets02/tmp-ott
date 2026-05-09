import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { BiX, BiCreditCard, BiTimeFive, BiFilm, BiLockOpen } from "react-icons/bi";
import config from "../config";

export default function RentModal({ movie, auth, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);

  const handleRent = async () => {
    if (!auth?.token) {
      Swal.fire({ icon: "warning", title: "Login Required", text: "Please login to rent this movie.", background: "#18181b", color: "#fff" });
      return;
    }
    try {
      setLoading(true);

      // Step 1: Create Razorpay order
      const { data } = await axios.post(
        `${config.API_BASE_URL}/api/v1/rent/create-order`,
        { movieId: movie._id },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      if (!data.success) {
        Swal.fire({ icon: "error", title: "Error", text: data.message, background: "#18181b", color: "#fff" });
        setLoading(false);
        return;
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_DiJk5T6Kc6ampr",
        amount: data.order.amount,
        currency: "INR",
        name: "Tortoise Motion Pictures",
        description: `Rent: ${movie.title} (48hr Access)`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            // Step 3: Verify payment and activate rental
            const verifyRes = await axios.post(
              `${config.API_BASE_URL}/api/v1/rent/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                movieId: movie._id,
                amount: data.order.amount,
              },
              { headers: { Authorization: `Bearer ${auth.token}` } }
            );

            if (verifyRes.data.success) {
              Swal.fire({
                icon: "success",
                title: "🎬 Rental Activated!",
                text: "You have 48 hours to watch this movie. Enjoy!",
                background: "#18181b",
                color: "#fff",
                confirmButtonColor: "#f59e0b",
              });
              onSuccess(); // trigger parent to refresh access
            }
          } catch (err) {
            Swal.fire({ icon: "error", title: "Verification Failed", text: "Payment done but activation failed. Contact support.", background: "#18181b", color: "#fff" });
          }
        },
        prefill: { name: auth?.user?.name, email: auth?.user?.email },
        theme: { color: "#f59e0b" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      
      Swal.fire({ icon: "error", title: "Error", text: "Could not start rental. Please try again.", background: "#18181b", color: "#fff" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative max-w-md w-full bg-zinc-900 border border-zinc-700 rounded-[2rem] p-8 shadow-2xl">
        {/* Close */}
        <button onClick={onClose} className="absolute top-5 right-5 text-zinc-500 hover:text-white transition-colors">
          <BiX size={28} />
        </button>

        {/* Glow */}
        <div className="absolute -top-20 -right-20 h-40 w-40 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />

        {/* Poster */}
        <div className="flex gap-5 items-center mb-8">
          <img
            src={`${config.API_BASE_URL}/api/v1/movie/movie-photo/${movie._id}`}
            alt={movie.title}
            className="h-24 w-16 object-cover rounded-xl border border-zinc-700 shadow-lg flex-shrink-0"
          />
          <div>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Rent This Movie</p>
            <h2 className="text-xl font-black text-white leading-tight">{movie.title}</h2>
            <p className="text-zinc-400 text-sm mt-1">{movie.language} • {movie.duration}</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-center">
            <BiTimeFive className="text-amber-500 mx-auto mb-2" size={22} />
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Access Window</p>
            <p className="text-white font-black text-lg">48 Hours</p>
          </div>
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-center">
            <BiCreditCard className="text-amber-500 mx-auto mb-2" size={22} />
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Rental Price</p>
            <p className="text-white font-black text-lg">₹{movie.rentalPrice}</p>
          </div>
        </div>

        {/* What you get */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mb-8">
          <p className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-3">What You Get</p>
          {[
            "Full HD movie playback",
            "Watch anytime within 48 hours",
            "No subscription needed",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-zinc-300 text-sm mb-2">
              <BiLockOpen className="text-amber-500 flex-shrink-0" size={14} />
              {item}
            </div>
          ))}
        </div>

        <button
          onClick={handleRent}
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black py-4 rounded-2xl transition-all hover:scale-[1.02] shadow-xl shadow-amber-500/20 text-sm uppercase tracking-widest"
        >
          {loading ? "PROCESSING..." : `RENT NOW — ₹${movie.rentalPrice}`}
        </button>
        <p className="text-center text-zinc-600 text-[10px] mt-4 font-bold uppercase tracking-widest">Powered by Razorpay • Secure Payment</p>
      </div>
    </div>
  );
}
