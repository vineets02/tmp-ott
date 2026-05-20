import { useSelector, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useNavigate, Link } from "react-router-dom";
import { logout as logoutAction } from "../../redux/slices/authSlice";
import axios from "axios";
import config from "../../config";
import { 
  BiUser, 
  BiCrown, 
  BiCheckShield, 
  BiTimeFive, 
  BiLogOut, 
  BiChevronRight,
  BiCreditCard
} from "react-icons/bi";

const getAvatarUrl = (avatar, name = "") => {
  if (!avatar || avatar === "/netflix_icon.jpg" || avatar.includes("netflix_icon.jpg") || avatar.includes("wiki") || avatar.includes("pinimg")) {
    const colors = ["#E50914", "#E87511", "#F5A623", "#46D369", "#2B90EF", "#7B1FA2", "#E91E63", "#00BCD4"];
    let hash = 0;
    const cleanName = name || "User";
    for (let i = 0; i < cleanName.length; i++) {
      hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="16" fill="${color}"/><circle cx="33" cy="40" r="7" fill="white"/><circle cx="67" cy="40" r="7" fill="white"/><path d="M30 62 Q50 78 70 62" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  }
  return avatar;
};

function Dashboard() {
  const auth = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({ paywallEnabled: true });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/settings/get-settings`);
        if (data?.settings) setSettings(data.settings);
      } catch (err) {
        
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  const isSubscribed = auth.user?.subscription;
  const isExpired = auth.user?.subscriptionEndDate && new Date(auth.user.subscriptionEndDate) < new Date();
  const expiryDate = auth.user?.subscriptionEndDate ? new Date(auth.user.subscriptionEndDate).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : null;

  return (
    <Layout title="Account Settings - TMP OTT">
      <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-12 text-center md:text-left">
            <h1 className="text-sm font-black uppercase tracking-[0.4em] text-amber-500 mb-2">Member Center</h1>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Account Settings</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Col: Profile Card */}
            <div className="space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center group">
                <div className="relative inline-block mb-6">
                  <img 
                    src={getAvatarUrl(auth.activeProfile?.avatar, auth.activeProfile?.name || auth.user?.name)} 
                    className="h-32 w-32 rounded-3xl object-cover border-4 border-zinc-800 group-hover:border-amber-500 transition-all duration-500 shadow-2xl"
                    alt="Avatar" 
                  />
                  {isSubscribed && (
                    <div className="absolute -top-3 -right-3 bg-amber-500 p-2 rounded-xl shadow-lg ring-4 ring-zinc-900">
                      <BiCrown className="text-black" size={20} />
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-black text-white truncate px-2">
                  {auth.activeProfile?.name || auth.user?.name}
                </h3>
                <p className="text-zinc-500 text-sm font-bold truncate mt-1">{auth.user?.email}</p>
                
                <div className="mt-8 pt-8 border-t border-zinc-800 space-y-3">
                  <Link to="/profiles" className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800 transition-all text-sm font-bold text-zinc-400 hover:text-white">
                    <span className="flex items-center gap-3"><BiUser /> Switch Profile</span>
                    <BiChevronRight />
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-red-500/10 transition-all text-sm font-bold text-red-500"
                  >
                    <span className="flex items-center gap-3"><BiLogOut /> Sign Out</span>
                    <BiChevronRight />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Col: Details & Subscription */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Subscription Status Card */}
              <div className={`relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-3xl p-8 ${
                isSubscribed && !isExpired ? "ring-2 ring-amber-500/50" : ""
              }`}>
                {isSubscribed && !isExpired && (
                  <div className="absolute top-0 right-0 p-4">
                    <span className="bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20">
                      Premium
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-6 mb-8">
                  <div className={`p-4 rounded-2xl ${isSubscribed && !isExpired ? "bg-amber-500 text-black" : "bg-zinc-800 text-zinc-500"}`}>
                    <BiCheckShield size={32} />
                  </div>
                  <div>
                    <h4 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Subscription Status</h4>
                    <p className={`text-2xl font-black tracking-tight ${isSubscribed && !isExpired ? "text-white" : "text-zinc-400"}`}>
                      {(!settings.paywallEnabled) 
                        ? "PLATFORM LAUNCH ACCESS (FREE)" 
                        : (isSubscribed && !isExpired) ? "TMP PREMIUM ACTIVE" : "INACTIVE / BASIC"}
                    </p>
                  </div>
                </div>

                {!settings.paywallEnabled ? (
                  <div className="bg-amber-500/10 border border-amber-500/50 rounded-2xl p-6 text-center">
                    <p className="text-amber-500 font-black uppercase tracking-widest text-xs mb-2 italic">Special Launch Offer</p>
                    <p className="text-white font-bold leading-relaxed">
                      You have full access to all cinematic content. <br/> 
                      Enjoy the TMP experience for free during our initial launch phase!
                    </p>
                  </div>
                ) : isSubscribed && !isExpired ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-zinc-950 p-6 rounded-2xl border border-zinc-800">
                    <div className="flex items-center gap-4">
                      <BiTimeFive className="text-amber-500" size={24} />
                      <div>
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Renews On</p>
                        <p className="text-white font-black">{expiryDate}</p>
                      </div>
                    </div>
                    <button className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-xl text-xs font-black transition-all">
                      MANAGE BILLING
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-zinc-500 text-sm leading-relaxed mb-6">
                      Unlock the full potential of Tortoise Motion Pictures. Watch exclusive originals and blockbuster hits in stunning 4K quality.
                    </p>
                    <button 
                      onClick={() => navigate("/subscribe")}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-2xl font-black transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:scale-[1.02]"
                    >
                      CHOOSE A PLAN
                    </button>
                  </div>
                )}
              </div>

              {/* Account Security Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6">Security & Privacy</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800 group hover:border-zinc-700 transition-all cursor-pointer" onClick={() => navigate("/dashboard/user/change-password")}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-zinc-900 rounded-xl text-zinc-500 group-hover:text-amber-500 transition-colors">
                        <BiCheckShield size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none mb-1">Change Password</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Update your security</p>
                      </div>
                    </div>
                    <BiChevronRight className="text-zinc-800 group-hover:text-amber-500 transition-all" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-2xl border border-zinc-800 group hover:border-zinc-700 transition-all cursor-pointer" onClick={() => navigate("/dashboard/user/orders")}>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-zinc-900 rounded-xl text-zinc-500 group-hover:text-amber-500 transition-colors">
                        <BiCreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none mb-1">Billing History</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Invoices and payments</p>
                      </div>
                    </div>
                    <BiChevronRight className="text-zinc-800 group-hover:text-amber-500 transition-all" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
