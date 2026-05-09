import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import { useSelector, useDispatch } from "react-redux";
import { removeFromRent, clearRent } from "../redux/slices/rentSlice";
import { useNavigate } from "react-router-dom";
import config from "../config";
import Swal from "sweetalert2";
import { AiOutlineDelete } from "react-icons/ai";

function RentPage() {
  const auth = useSelector((state) => state.auth);
  const rent = useSelector((state) => state.rent);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const totalPrice = () => {
    return rent?.reduce((acc, item) => acc + (item.price || 199), 0) || 0;
  };

  const handleRemove = (id) => {
    dispatch(removeFromRent(id));
  };

  const handlePayment = () => {
    if (!auth?.token) {
      return Swal.fire("Login Required", "Please login to proceed with payment", "warning");
    }
    
    setLoading(true);
    dispatch({
      type: 'payment/checkout',
      payload: {
        amount: totalPrice(),
        rentList: rent,
        onSuccess: () => {
          dispatch(clearRent());
          navigate("/");
          setLoading(false);
        }
      }
    });

    // Timeout just in case user closes modal
    setTimeout(() => {
      setLoading(false);
    }, 5000);
  };

  return (
    <Layout title="Checkout - TMP OTT">
      <div className="min-h-screen bg-black px-4 py-20 text-white md:px-10">
        <div className="mx-auto max-w-6xl">
          <h1 className="mb-10 text-4xl font-black md:text-5xl">Your Selection</h1>
          
          <div className="flex flex-col gap-10 lg:flex-row">
            {/* Left: Movie List */}
            <div className="flex-1 space-y-6">
              {rent.length === 0 ? (
                <div className="flex h-60 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 text-zinc-500">
                  <p>Your selection is empty</p>
                  <button onClick={() => navigate("/")} className="mt-4 text-amber-500 font-bold hover:underline">Browse Movies</button>
                </div>
              ) : (
                rent.map((movie) => (
                  <div key={movie._id} className="group flex items-center gap-6 rounded-2xl bg-zinc-900/50 p-4 transition-all hover:bg-zinc-900">
                    <img 
                      src={`${config.API_BASE_URL}/api/v1/movie/movie-photo/${movie._id}`}
                      alt={movie.title}
                      className="h-24 w-40 rounded-lg object-cover shadow-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{movie.title}</h3>
                      <p className="text-sm text-zinc-400">{movie.duration} • {movie.language}</p>
                      <p className="mt-1 font-black text-amber-500">₹{movie.price || "199"}</p>
                    </div>
                    <button 
                      onClick={() => handleRemove(movie._id)}
                      className="rounded-full p-3 text-zinc-500 hover:bg-red-500/10 hover:text-red-500"
                    >
                      <AiOutlineDelete size={24} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Right: Summary */}
            <div className="w-full lg:w-96">
              <div className="sticky top-24 rounded-3xl bg-zinc-900 p-8 shadow-2xl">
                <h2 className="mb-6 text-2xl font-black">Order Summary</h2>
                
                <div className="space-y-4 border-b border-zinc-800 pb-6">
                  <div className="flex justify-between text-zinc-400">
                    <span>Subtotal</span>
                    <span>₹{totalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Tax (GST)</span>
                    <span>₹0.00</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-between text-2xl font-black">
                  <span>Total</span>
                  <span className="text-amber-500">₹{totalPrice()}</span>
                </div>

                <button 
                  disabled={loading || rent.length === 0}
                  onClick={handlePayment}
                  className="mt-8 w-full rounded-2xl bg-amber-500 py-4 text-lg font-black text-black transition-all hover:scale-105 hover:bg-amber-400 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {loading ? "Processing..." : "Complete Purchase"}
                </button>

                <p className="mt-4 text-center text-xs text-zinc-500">
                  By completing your purchase, you agree to our Terms of Service.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default RentPage;
