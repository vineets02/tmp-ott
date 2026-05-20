import { useSelector, useDispatch } from "react-redux";
import { setAuth } from "../../redux/slices/authSlice";
import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import toast from "react-hot-toast";
import config from "../../config";
import { AiOutlinePlus } from "react-icons/ai";

const PRESET_COLORS = [
  "#E50914", // Netflix Red
  "#E87511", // Orange
  "#F5A623", // Yellow
  "#46D369", // Green
  "#2B90EF", // Blue
  "#7B1FA2", // Purple
  "#E91E63", // Pink
  "#00BCD4", // Cyan
  "#1F2937", // Charcoal
];

const generateAvatarSvg = (bgColor) => {
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="16" fill="${bgColor}"/><circle cx="33" cy="40" r="7" fill="white"/><circle cx="67" cy="40" r="7" fill="white"/><path d="M30 62 Q50 78 70 62" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
};

const getAvatarUrl = (avatar, name = "") => {
  if (!avatar || avatar === "/netflix_icon.jpg" || avatar.includes("netflix_icon.jpg") || avatar.includes("wiki") || avatar.includes("pinimg")) {
    const colors = PRESET_COLORS;
    let hash = 0;
    const cleanName = name || "User";
    for (let i = 0; i < cleanName.length; i++) {
      hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    return generateAvatarSvg(color);
  }
  return avatar;
};

export default function ProfilesPage() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManaging, setIsManaging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isChild, setIsChild] = useState(false);
  const navigate = useNavigate();

  const fetchProfiles = async () => {
    try {
      const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/auth/profiles`);
      if (data.success) {
        setProfiles(data.profiles);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) fetchProfiles();
  }, [auth?.token]);

  const selectProfile = (profile) => {
    if (isManaging) return;
    dispatch(setAuth({ ...auth, activeProfile: profile }));
    toast.success(`Switched to ${profile.name}`);
    navigate("/");
  };

  const addProfile = async () => {
    if (!newProfileName.trim()) {
      return toast.error("Profile name is required");
    }
    try {
      const avatar = generateAvatarSvg(selectedColor);
      const { data } = await axios.post(`${config.API_BASE_URL}/api/v1/auth/profiles`, {
        name: newProfileName,
        avatar,
        isChild,
      });
      if (data.success) {
        setProfiles(data.profiles);
        setShowAddModal(false);
        setNewProfileName("");
        setIsChild(false);
        setSelectedColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
        toast.success("Profile created!");
      }
    } catch (error) {
      toast.error("Could not add profile");
    }
  };

  const deleteProfile = async (id) => {
    try {
      const { data } = await axios.delete(`${config.API_BASE_URL}/api/v1/auth/profiles/${id}`);
      if (data.success) {
        setProfiles(profiles.filter(p => p._id !== id));
        toast.success("Profile removed");
      }
    } catch (error) {
      toast.error("Error deleting profile");
    }
  };

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading...</div>;

  return (
    <Layout title="Who's Watching? - TMP">
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl md:text-6xl font-black mb-12 tracking-tight">Who's watching?</h1>
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {profiles.map((p) => (
            <div key={p._id} className="group relative flex flex-col items-center gap-4">
              <div 
                onClick={() => selectProfile(p)}
                className={`relative h-24 w-24 md:h-40 md:w-40 overflow-hidden rounded-xl border-4 transition-all cursor-pointer 
                  ${isManaging ? "border-zinc-500 opacity-60" : "border-transparent hover:border-white group-hover:scale-105"}`}
              >
                <img src={getAvatarUrl(p.avatar, p.name)} alt={p.name} className="h-full w-full object-cover" />
                {isManaging && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); deleteProfile(p._id); }}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center"
                  >
                    <span className="text-white font-black text-3xl">×</span>
                  </div>
                )}
              </div>
              <span className="text-zinc-500 text-lg group-hover:text-white transition-colors">{p.name}</span>
            </div>
          ))}

          {profiles.length < 5 && (
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={() => setShowAddModal(true)}
                className="h-24 w-24 md:h-40 md:w-40 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-zinc-700 hover:text-white transition-all"
              >
                <AiOutlinePlus size={64} />
              </button>
              <span className="text-zinc-500 text-lg">Add Profile</span>
            </div>
          )}
        </div>

        <button 
          onClick={() => setIsManaging(!isManaging)}
          className="mt-16 border border-zinc-500 px-8 py-2 text-zinc-500 uppercase tracking-widest font-bold hover:border-white hover:text-white transition-all"
        >
          {isManaging ? "Done" : "Manage Profiles"}
        </button>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-md border border-zinc-800 shadow-2xl">
              <h2 className="text-3xl font-black mb-6">New Profile</h2>
              
              <input 
                autoFocus
                className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white mb-6 focus:ring-2 focus:ring-amber-500"
                placeholder="Profile Name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />

              {/* Dynamic Avatar Preview & Color Picker */}
              <div className="flex flex-col items-center mb-6 bg-zinc-950 p-6 rounded-2xl border border-zinc-850">
                <div 
                  className="h-28 w-28 rounded-2xl overflow-hidden shadow-2xl mb-4 border-2 border-zinc-800 transition-all duration-300"
                >
                  <img 
                    src={generateAvatarSvg(selectedColor)} 
                    alt="Avatar Preview" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3">Choose Background Color</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-[280px]">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`h-7 w-7 rounded-full transition-all hover:scale-110 active:scale-95 ${
                        selectedColor === color ? "ring-2 ring-white scale-110 border-2 border-zinc-900" : "border border-zinc-800"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={addProfile}
                  className="flex-1 bg-white text-black font-black py-3 rounded-xl hover:bg-amber-500 transition-all"
                >
                  SAVE
                </button>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-zinc-800 text-white font-black py-3 rounded-xl"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
