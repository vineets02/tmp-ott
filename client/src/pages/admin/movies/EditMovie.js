import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import Sidebar from "../../../components/layout/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import config from "../../../config";
import Swal from "sweetalert2";
import {
  BiArrowBack,
  BiCloudUpload,
  BiMovie,
  BiInfoCircle,
  BiFile,
  BiLoaderAlt
} from "react-icons/bi";

export default function EditMovie() {
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState("");
  const [uploadSpeed, setUploadSpeed] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);

  const [formData, setFormData] = useState({
    _id: "",
    title: "",
    description: "",
    director: "",
    duration: "",
    language: "",
    trailer: "",
    category: "",
    contenttype: "",
    rating: "",
    cast: "",
    releaseDate: "",
    isPremium: false,
    isKids: false,
    price: "",
    rentalPrice: "0"
  });

  const [files, setFiles] = useState({
    poster: null,
    video: null
  });

  const fetchData = async () => {
    try {
      const [catRes, typeRes, movieRes] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/api/v1/category/get-category`),
        axios.get(`${config.API_BASE_URL}/api/v1/content-type/get-contenttype`),
        axios.get(`${config.API_BASE_URL}/api/v1/movie/get-movie/${params.slug}`)
      ]);

      if (catRes.data.success) setCategories(catRes.data.category);
      if (typeRes.data.success) setContentTypes(typeRes.data.contenttype);

      if (movieRes.data.success) {
        const movie = movieRes.data.movie;
        setFormData({
          _id: movie._id,
          title: movie.title,
          description: movie.description,
          director: movie.director,
          duration: movie.duration,
          language: movie.language,
          trailer: movie.trailer,
          category: movie.category?._id || "",
          contenttype: movie.contenttype?._id || "",
          rating: movie.rating || "",
          cast: movie.cast?.join(", ") || "",
          releaseDate: movie.releaseDate ? movie.releaseDate.split("T")[0] : "",
          isPremium: movie.isPremium || false,
          isKids: movie.isKids || false,
          rentalPrice: movie.rentalPrice ?? 0,
        });
      }
    } catch (error) {
      
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.slug]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles(prev => ({
      ...prev,
      [name]: selectedFiles[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setUploadProgress(0);
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== '_id') data.append(key, value);
      });

      if (files.poster) data.append("poster", files.poster);
      if (files.video) data.append("video", files.video);

      const startTime = Date.now();

      const res = await axios.put(`${config.API_BASE_URL}/api/v1/movie/update-movie/${formData._id}`, data, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);

          // Calculate time remaining
          const elapsedTime = (Date.now() - startTime) / 1000; // seconds
          if (elapsedTime > 0 && progressEvent.loaded > 0) {
            const speed = progressEvent.loaded / elapsedTime; // bytes per second
            const remainingBytes = progressEvent.total - progressEvent.loaded;
            const remainingSeconds = remainingBytes / speed;

            setUploadSpeed((speed / (1024 * 1024)).toFixed(2) + " MB/s");

            if (remainingSeconds > 0) {
              const hours = Math.floor(remainingSeconds / 3600);
              const minutes = Math.floor((remainingSeconds % 3600) / 60);
              const seconds = Math.floor(remainingSeconds % 60);

              let timeStr = "";
              if (hours > 0) timeStr += `${hours}h `;
              if (minutes > 0 || hours > 0) timeStr += `${minutes}m `;
              timeStr += `${seconds}s remaining`;

              setRemainingTime(timeStr);
            } else {
              setRemainingTime("Finishing upload...");
            }
          }
        }
      });

      if (res.data.success) {
        Swal.fire({
          title: "Content Updated",
          icon: "success",
          background: "#18181b",
          color: "#fff"
        }).then(() => navigate("/dashboard/admin/movies"));
      }
    } catch (error) {
      
      Swal.fire("Error", "Failed to update content", "error");
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setRemainingTime("");
    }
  };

  if (initialLoading) return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950">
      <BiLoaderAlt className="animate-spin text-amber-500" size={40} />
    </div>
  );

  return (
    <Layout title={`Edit ${formData.title} - Admin`}>
      <div className="flex min-h-screen bg-zinc-950">
        <Sidebar />

        <main className="flex-1 p-6 md:p-10 md:ml-64 pt-24">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"
          >
            <BiArrowBack /> Back
          </button>

          <div className="mb-10">
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Editor</h1>
            <h2 className="text-4xl font-black text-white truncate max-w-2xl">{formData.title}</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800">
                  <BiInfoCircle className="text-amber-500" size={20} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Essential Information</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Movie Title</label>
                    <input type="text" name="title" required className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-amber-500 transition-all" value={formData.title} onChange={handleInputChange} />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Synopsis</label>
                    <textarea name="description" required rows={6} className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-amber-500 transition-all resize-none" value={formData.description} onChange={handleInputChange} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Director</label>
                      <input type="text" name="director" required className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-amber-500 transition-all" value={formData.director} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Cast</label>
                      <input type="text" name="cast" className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-amber-500 transition-all" value={formData.cast} onChange={handleInputChange} />
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Subscription Price (₹)</label>
                        <input
                          type="number"
                          name="price"
                          placeholder="199"
                          className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-amber-500 transition-all"
                          value={formData.price}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Rental Price (₹) <span className="text-amber-500">(0 = not rentable)</span></label>
                        <input
                          type="number"
                          name="rentalPrice"
                          placeholder="49"
                          className="w-full bg-zinc-950 border-amber-500/30 border rounded-xl py-3 px-4 text-white focus:ring-amber-500 transition-all"
                          value={formData.rentalPrice}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800">
                  <BiFile className="text-amber-500" size={20} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Media Update</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">Update Video</label>
                    <div className="relative group">
                      <input type="file" name="video" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center transition-all group-hover:border-amber-500/50">
                        <BiCloudUpload className="mx-auto text-zinc-600 mb-2" size={40} />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{files.video ? files.video.name : "Replace Main File"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">Update Poster</label>
                    <div className="relative group">
                      <input type="file" name="poster" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center transition-all group-hover:border-amber-500/50">
                        {files.poster ? (
                          <BiCloudUpload className="mx-auto text-amber-500 mb-2" size={40} />
                        ) : (
                          <div className="h-10 w-8 mx-auto bg-zinc-800 rounded overflow-hidden mb-2">
                            <img src={`${config.API_BASE_URL}/api/v1/movie/movie-photo/${formData._id}`} className="h-full w-full object-cover opacity-50" alt="" />
                          </div>
                        )}
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{files.poster ? files.poster.name : "Replace Poster"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-8">
              <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Categorization</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Genre</label>
                    <select name="category" required className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white text-sm" value={formData.category} onChange={handleInputChange}>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Content Type</label>
                    <select name="contenttype" required className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white text-sm" value={formData.contenttype} onChange={handleInputChange}>
                      {contentTypes.map(t => <option key={t._id} value={t._id}>{t.contenttype}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" name="isPremium" className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-amber-500" checked={formData.isPremium} onChange={handleInputChange} />
                    <span className="text-xs font-black text-zinc-400 uppercase group-hover:text-amber-500 transition-colors">Premium</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" name="isKids" className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-blue-500" checked={formData.isKids} onChange={handleInputChange} />
                    <span className="text-xs font-black text-zinc-400 uppercase group-hover:text-blue-500 transition-colors">Kids Friendly</span>
                  </label>
                </div>
              </section>

              {loading && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Upload Progress</span>
                    <span className="text-amber-500 font-black">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    <span>{uploadSpeed}</span>
                    <span>{remainingTime}</span>
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-5 rounded-3xl transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] disabled:opacity-50 uppercase tracking-widest">
                {loading ? "Updating Content..." : "Save Changes"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </Layout>
  );
}
