import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch({
      type: 'auth/loginRequest',
      payload: {
        payload: { email, password },
        navigate,
      }
    });
    // Give UI a moment to update; saga handles real loading state/toast
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Layout title="Login - TMP OTT">
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/background.png"
            className="h-full w-full object-cover opacity-40 scale-110 blur-[2px]"
            alt="background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        </div>

        {/* Login Card */}
        <div className="relative z-10 w-full max-w-md p-8 sm:p-12">
          <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 shadow-2xl">
            <div className="mb-10 text-center">
              <img src="/Logo.png" alt="Logo" className="mx-auto h-16 w-16 mb-4 object-contain" />
              <h1 className="text-3xl font-black text-white tracking-tighter">Welcome Back</h1>
              <p className="text-zinc-500 text-sm mt-2">Sign in to your account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  placeholder="Email Address"
                  required
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  placeholder="Password"
                  required
                />
              </div>

              <div className="flex justify-end px-2">
                <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-amber-500 hover:text-amber-400">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 text-black font-black py-4 rounded-2xl hover:bg-amber-400 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {loading ? "AUTHENTICATING..." : "SIGN IN"}
              </button>
            </form>

            <div className="mt-8 text-center border-t border-white/5 pt-8">
              <p className="text-zinc-500 text-sm">
                New to Tortoise Motion Pictures?{" "}
                <Link to="/signup" className="text-white font-bold hover:text-amber-500 ml-1">
                  Create Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
