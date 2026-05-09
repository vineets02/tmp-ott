import config from "../../config";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import Layout from "../../components/layout/Layout";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { BiLockOpen, BiLockAlt, BiShieldQuarter } from "react-icons/bi";

function ChangePassword() {
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(
        `${config.API_BASE_URL}/api/v1/auth/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Password Updated",
          text: "For security, please login again with your new password.",
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#f59e0b",
        });
        dispatch(logout());
        navigate("/login");
      } else {
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: data.message,
          background: "#18181b",
          color: "#fff",
          confirmButtonColor: "#f59e0b",
        });
      }
    } catch (err) {
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong. Please try again.",
        background: "#18181b",
        color: "#fff",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Change Password - TMP OTT">
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 pt-20">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          
          {/* Decorative Background */}
          <div className="absolute -top-24 -right-24 h-48 w-48 bg-amber-500/10 blur-[80px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-amber-500/5 blur-[80px] rounded-full" />

          <div className="relative">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-amber-500 rounded-2xl text-black shadow-lg shadow-amber-500/20">
                <BiShieldQuarter size={32} />
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Change Password</h2>
              <p className="text-zinc-500 text-sm font-medium">Keep your account secure with a strong password.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                    <BiLockOpen size={20} />
                  </span>
                  <input
                    type="password"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500 transition-all font-medium"
                    placeholder="Enter new password"
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
                {loading ? "UPDATING..." : "UPDATE PASSWORD"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button 
                onClick={() => navigate(-1)}
                className="text-zinc-500 text-xs font-bold hover:text-white transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ChangePassword;
