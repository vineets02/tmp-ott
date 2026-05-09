import { useSelector, useDispatch } from "react-redux";
import { setAuth } from "../../redux/slices/authSlice";
import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import toast from "react-hot-toast";
import config from "../../config";
import { AiOutlinePlus } from "react-icons/ai";

const avatars = [
  "/netflix_icon.jpg",
  "https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png",
  "https://i.pinimg.com/originals/b6/77/cd/b677cd1cde292f261166533d6fe75872.png",
  "https://i.pinimg.com/originals/e3/94/30/e39430434f2b8207188f880ac66c6411.png",
];

export default function ProfilesPage() {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isManaging, setIsManaging] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
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
    try {
      const avatar = avatars[Math.floor(Math.random() * avatars.length)];
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
                <img src={p.avatar} alt={p.name} className="h-full w-full object-cover" />
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
            <div className="bg-zinc-900 p-8 rounded-3xl w-full max-w-md border border-zinc-800">
              <h2 className="text-3xl font-black mb-6">New Profile</h2>
              <input 
                autoFocus
                className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white mb-6"
                placeholder="Profile Name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
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
