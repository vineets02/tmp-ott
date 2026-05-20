import { useSelector, useDispatch } from "react-redux";
import { setWatchlist as setWatchlistAction } from "../redux/slices/watchSlice";
import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";

import NewCard from "../components/NewCard";
import axios from "axios";
import config from "../config";
import { AiOutlineHeart } from "react-icons/ai";

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

export default function WatchlistPage() {
  const auth = useSelector((state) => state.auth);

  const watchlist = useSelector((state) => state.watchlist);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const fetchWatchlist = async () => {
    if (auth?.token) {
      try {
        setLoading(true);
        const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/auth/watchlist?profileId=${auth?.activeProfile?._id || ""}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (data.success) {
          dispatch(setWatchlistAction(data.watchlist));
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, [auth?.token, auth?.activeProfile?._id]);

  return (
    <Layout title="My List - TMP OTT">
      <div className="min-h-screen bg-black pt-32 px-4 pb-20 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12">
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Personal Collection</h1>
            <h2 className="text-4xl md:text-6xl font-black text-white">My List</h2>
            {auth?.activeProfile && (
              <p className="mt-4 text-zinc-500 flex items-center gap-2">
                <img src={getAvatarUrl(auth.activeProfile.avatar, auth.activeProfile.name)} className="h-6 w-6 rounded-full" alt="profile" />
                Curated for <span className="text-white font-bold">{auth.activeProfile.name}</span>
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex h-[40vh] items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent" />
            </div>
          ) : watchlist?.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {watchlist.map((movie) => (
                <NewCard key={movie._id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 rounded-full bg-zinc-900/50 p-10 text-zinc-800 border border-zinc-800">
                <AiOutlineHeart size={80} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Your list is empty</h3>
              <p className="text-zinc-500 max-w-md mb-8">
                Save movies and shows you want to watch later by clicking the + icon on any title.
              </p>
              <button 
                onClick={() => window.location.href = "/"}
                className="rounded-full bg-white px-10 py-3 font-black text-black transition-all hover:bg-amber-500 hover:scale-105"
              >
                BROWSE CONTENT
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
