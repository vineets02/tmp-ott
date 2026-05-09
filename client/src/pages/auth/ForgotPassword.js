import config from "../../config";
import Layout from "../../components/layout/Layout";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { BiMailSend, BiLockAlt, BiHelpCircle, BiChevronLeft } from "react-icons/bi";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(`${config.API_BASE_URL}/api/v1/auth/forgot-password`, {
        email,
        newPassword,
        question,
      });

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Password Reset",
          text: "Your password has been updated successfully!",
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#f59e0b",
        });
        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Reset Failed",
          text: data.message,
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (err) {
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please check your credentials.",
        background: "#18181b",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Reset Password - TMP OTT">
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 pt-20">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          
          {/* Decorative Background Glows */}
          <div className="absolute -top-24 -right-24 h-48 w-48 bg-amber-500/10 blur-[80px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-amber-500/5 blur-[80px] rounded-full" />

          <div className="relative">
            <button 
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest mb-8"
            >
              <BiChevronLeft size={20} /> Back to Login
            </button>

            <div className="mb-10">
              <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Reset Password</h1>
              <p className="text-zinc-500 text-sm font-medium">Verify your identity to choose a new password.</p>
            </div>

            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Account Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    <BiMailSend size={20} />
                  </span>
                  <input
                    type="email"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500 transition-all font-medium placeholder:text-zinc-700"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Security Question</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    <BiHelpCircle size={20} />
                  </span>
                  <input
                    type="text"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500 transition-all font-medium placeholder:text-zinc-700"
                    placeholder="Favourite movie name?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">New Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    <BiLockAlt size={20} />
                  </span>
                  <input
                    type="password"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500 transition-all font-medium placeholder:text-zinc-700"
                    placeholder="Choose a new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black py-4 rounded-2xl font-black transition-all shadow-xl shadow-amber-500/10 hover:scale-[1.02] active:scale-95"
              >
                {loading ? "RESETTING..." : "RESET PASSWORD"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ForgotPassword;
