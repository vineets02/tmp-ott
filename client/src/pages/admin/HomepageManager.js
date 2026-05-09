import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axios from "axios";
import config from "../../config";
import Swal from "sweetalert2";
import { 
  BiImage, 
  BiMoviePlay, 
  BiPurchaseTag, 
  BiPlus, 
  BiTrash, 
  BiSave,
  BiLoaderAlt,
  BiLinkExternal,
  BiMoveVertical
} from "react-icons/bi";

export default function HomepageManager() {
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    heroMovies: [],
    pinnedCategories: [],
    promoBanners: [],
    isManualHero: false,
    isManualCategories: false
  });

  const auth = JSON.parse(localStorage.getItem("auth"));

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [moviesRes, catRes, settingsRes] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/api/v1/movie/get-movie`),
        axios.get(`${config.API_BASE_URL}/api/v1/category/get-category`),
        axios.get(`${config.API_BASE_URL}/api/v1/homepage/get-settings`)
      ]);

      if (moviesRes.data.success) setMovies(moviesRes.data.movies);
      if (catRes.data.success) setCategories(catRes.data.category);
      if (settingsRes.data.success) {
        // Map heroMovies to just IDs for selection, but keep full objects for display
        setSettings(settingsRes.data.settings);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateHero = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${config.API_BASE_URL}/api/v1/homepage/update-hero`, {
        movieIds: settings.heroMovies.map(m => m._id || m),
        isManualHero: settings.isManualHero
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) Swal.fire("Success", "Hero Slider updated", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to update hero", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePinned = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${config.API_BASE_URL}/api/v1/homepage/update-pinned`, {
        categories: settings.pinnedCategories.map(c => ({ 
          category: c.category._id || c.category, 
          order: c.order 
        })),
        isManualCategories: settings.isManualCategories
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) Swal.fire("Success", "Pinned categories updated", "success");
    } catch (err) {
      Swal.fire("Error", "Failed to update categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const addMovieToHero = (movieId) => {
    if (settings.heroMovies.length >= 5) {
      return Swal.fire("Limit Reached", "Max 5 movies allowed in hero slider", "warning");
    }
    const movie = movies.find(m => m._id === movieId);
    if (!settings.heroMovies.find(m => (m._id || m) === movieId)) {
      setSettings({ ...settings, heroMovies: [...settings.heroMovies, movie] });
    }
  };

  const removeMovieFromHero = (movieId) => {
    setSettings({ ...settings, heroMovies: settings.heroMovies.filter(m => (m._id || m) !== movieId) });
  };

  const addCategoryToPinned = (catId) => {
    const category = categories.find(c => c._id === catId);
    if (!settings.pinnedCategories.find(c => (c.category._id || c.category) === catId)) {
      setSettings({ 
        ...settings, 
        pinnedCategories: [...settings.pinnedCategories, { category, order: settings.pinnedCategories.length }] 
      });
    }
  };

  const removeCategoryFromPinned = (catId) => {
    setSettings({ 
      ...settings, 
      pinnedCategories: settings.pinnedCategories.filter(c => (c.category._id || c.category) !== catId) 
    });
  };

  return (
    <AdminLayout title="Homepage Manager — TMP OTT Admin">
      <div className="mb-10">
        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Editor's Choice</h1>
        <h2 className="text-4xl font-black text-white">Dynamic Homepage Control</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Hero Slider Manager */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                <BiMoviePlay size={24} />
              </div>
              <h3 className="text-xl font-black text-white">Hero Slider (Max 5)</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Manual Mode</span>
              <button 
                onClick={() => setSettings({ ...settings, isManualHero: !settings.isManualHero })}
                className={`w-10 h-5 rounded-full transition-all ${settings.isManualHero ? "bg-amber-500" : "bg-zinc-800"} p-1`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-all ${settings.isManualHero ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {settings.heroMovies.map((m, i) => (
              <div key={m._id || m} className="flex items-center gap-4 bg-zinc-800/50 p-3 rounded-2xl border border-zinc-700/50 group">
                <span className="text-zinc-600 font-black text-xs w-4">#{i+1}</span>
                <div className="h-10 w-16 bg-zinc-700 rounded-lg overflow-hidden">
                  <img src={`${config.API_BASE_URL}/api/v1/movie/movie-photo/${m._id || m}`} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{m.title || "Selected Movie"}</p>
                </div>
                <button onClick={() => removeMovieFromHero(m._id || m)} className="p-2 text-zinc-500 hover:text-red-500">
                  <BiTrash size={18} />
                </button>
              </div>
            ))}
            {settings.heroMovies.length === 0 && (
              <p className="text-center py-6 text-zinc-600 italic text-sm">No movies selected. Showing latest automatically.</p>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Add to Slider</label>
            <select 
              onChange={(e) => addMovieToHero(e.target.value)}
              className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white font-bold"
              value=""
            >
              <option value="" disabled>Select a movie...</option>
              {movies.map(m => (
                <option key={m._id} value={m._id}>{m.title}</option>
              ))}
            </select>
            <button 
              onClick={handleUpdateHero}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 text-black py-4 rounded-2xl font-black hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,165,9,0.2)] mt-4"
            >
              <BiSave size={20} /> SAVE HERO CONFIG
            </button>
          </div>
        </div>

        {/* Pinned Categories Manager */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                <BiPurchaseTag size={24} />
              </div>
              <h3 className="text-xl font-black text-white">Pinned Categories</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Manual Mode</span>
              <button 
                onClick={() => setSettings({ ...settings, isManualCategories: !settings.isManualCategories })}
                className={`w-10 h-5 rounded-full transition-all ${settings.isManualCategories ? "bg-purple-500" : "bg-zinc-800"} p-1`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-all ${settings.isManualCategories ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {settings.pinnedCategories.map((c, i) => (
              <div key={c.category?._id || c.category} className="flex items-center gap-4 bg-zinc-800/50 p-3 rounded-2xl border border-zinc-700/50">
                <span className="text-zinc-600 font-black text-xs w-4">#{i+1}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white uppercase tracking-wider">{c.category?.name || "Selected Category"}</p>
                </div>
                <button onClick={() => removeCategoryFromPinned(c.category?._id || c.category)} className="p-2 text-zinc-500 hover:text-red-500">
                  <BiTrash size={18} />
                </button>
              </div>
            ))}
            {settings.pinnedCategories.length === 0 && (
              <p className="text-center py-6 text-zinc-600 italic text-sm">No categories pinned. Showing by recency.</p>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] block">Pin Category</label>
            <select 
              onChange={(e) => addCategoryToPinned(e.target.value)}
              className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white font-bold"
              value=""
            >
              <option value="" disabled>Select a category...</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <button 
              onClick={handleUpdatePinned}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-4 rounded-2xl font-black hover:bg-purple-500 transition-all mt-4 shadow-[0_10px_30px_rgba(147,51,234,0.2)]"
            >
              <BiSave size={20} /> SAVE CATEGORY ORDER
            </button>
          </div>
        </div>

      </div>

      {/* Promo Banners Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mt-8">
         <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <BiImage size={24} />
            </div>
            <h3 className="text-xl font-black text-white">Promotional Banners</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mock Display for now - Expandable later */}
            <div className="aspect-[21/9] rounded-3xl bg-zinc-800 border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 hover:border-emerald-500/50 hover:text-emerald-500 transition-all cursor-pointer">
              <BiPlus size={40} />
              <p className="text-xs font-black uppercase mt-2">Add Banner</p>
            </div>
          </div>
      </div>

    </AdminLayout>
  );
}
