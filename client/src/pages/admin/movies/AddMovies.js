import React, { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import Sidebar from "../../../components/layout/Sidebar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import config from "../../../config";
import Swal from "sweetalert2";
import { 
  BiArrowBack, 
  BiCloudUpload, 
  BiMovie, 
  BiInfoCircle, 
  BiFile 
} from "react-icons/bi";

export default function AddMovies() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState("");
  const [uploadSpeed, setUploadSpeed] = useState("");
  const [categories, setCategories] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  
  const [formData, setFormData] = useState({
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
    price: "199"
  });

  const [files, setFiles] = useState({
    poster: null,
    trailer: null,
    video: null,
    subtitles: null
  });

  const fetchData = async () => {
    try {
      const [catRes, typeRes] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/api/v1/category/get-category`),
        axios.get(`${config.API_BASE_URL}/api/v1/content-type/get-contenttype`)
      ]);
      if (catRes.data.success) setCategories(catRes.data.category);
      if (typeRes.data.success) setContentTypes(typeRes.data.contenttype);
    } catch (error) {
      
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const uploadToR2 = async (file, onProgress) => {
    try {
      const titleSlug = formData.title ? formData.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'uncategorized';

      // 1. Get Presigned URL
      const { data } = await axios.post(`${config.API_BASE_URL}/api/v1/movie/get-upload-url`, {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        movieName: titleSlug
      });

      if (!data.success) throw new Error("Could not get upload URL");

      const { uploadUrl, fileKey } = data;

      // 2. Upload directly to R2 using XMLHttpRequest to avoid Axios global headers
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            onProgress(event);
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(fileKey);
          } else {
            
            reject(new Error(`Upload failed with status ${xhr.status}. Cloudflare says: ${xhr.responseText}`));
          }
        };
        
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });
    } catch (error) {
      
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setUploadProgress(0);
      setRemainingTime("Starting direct Cloudflare R2 upload...");

      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));

      // Use R2 Upload for files
      const startTime = Date.now();
      
      if (files.video) {
        setRemainingTime("Uploading Video to R2...");
        const videoKey = await uploadToR2(files.video, (progressEvent) => {
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
              setRemainingTime("Finishing video upload...");
            }
          }
        });
        data.append("videoKey", videoKey);
      }

      if (files.poster) {
        setRemainingTime("Uploading Poster to R2...");
        const posterKey = await uploadToR2(files.poster);
        data.append("posterKey", posterKey);
      }

      if (files.trailer || files.trailerFile) {
        setRemainingTime("Uploading Trailer to R2...");
        const trailerKey = await uploadToR2(files.trailer || files.trailerFile);
        data.append("trailerKey", trailerKey);
      }

      setRemainingTime("Finalizing movie creation...");
      
      const res = await axios.post(`${config.API_BASE_URL}/api/v1/movie/create-movie`, data);

      if (res.data.success) {
        Swal.fire({
          title: "Content Published",
          text: "Movie has been added successfully.",
          icon: "success",
          background: "#18181b",
          color: "#fff"
        }).then(() => navigate("/dashboard/admin/movies"));
      }
    } catch (error) {
      
      Swal.fire("Error", "Failed to publish content. Check your network or R2 credentials.", "error");
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setRemainingTime("");
      setUploadSpeed("");
    }
  };

  return (
    <Layout title="Publish New Content - TMP Admin">
      <div className="flex min-h-screen bg-zinc-950">
        <Sidebar />
        
        <main className="flex-1 p-6 md:p-10 md:ml-64 pt-24">
          <button 
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest"
          >
            <BiArrowBack /> Back to Library
          </button>

          <div className="mb-10">
            <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Content Creator</h1>
            <h2 className="text-4xl font-black text-white">Add New Movie</h2>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Main Form */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800">
                  <BiInfoCircle className="text-amber-500" size={20} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Essential Information</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Movie Title</label>
                    <input 
                      type="text" 
                      name="title"
                      required
                      className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-amber-500 focus:border-amber-500 transition-all"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Synopsis / Description</label>
                    <textarea 
                      name="description"
                      required
                      rows={6}
                      className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-amber-500 focus:border-amber-500 transition-all resize-none"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Director</label>
                      <input 
                        type="text" 
                        name="director"
                        required
                        className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-amber-500 focus:border-amber-500 transition-all"
                        value={formData.director}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Cast (Comma separated)</label>
                      <input 
                        type="text" 
                        name="cast"
                        placeholder="John Doe, Jane Smith..."
                        className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white focus:ring-amber-500 focus:border-amber-500 transition-all"
                        value={formData.cast}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-zinc-800">
                  <BiFile className="text-amber-500" size={20} />
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Media Assets</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">Main Video File</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        name="video"
                        required
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center group-hover:border-amber-500/50 transition-all">
                        <BiCloudUpload className="mx-auto text-zinc-600 group-hover:text-amber-500 mb-2" size={40} />
                        <p className="text-xs font-bold text-zinc-400">{files.video ? files.video.name : "Select or Drop Video"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">Trailer Video</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        name="trailerFile"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl p-8 text-center group-hover:border-amber-500/50 transition-all">
                        <BiCloudUpload className="mx-auto text-zinc-600 group-hover:text-amber-500 mb-2" size={40} />
                        <p className="text-xs font-bold text-zinc-400">{files.trailerFile ? files.trailerFile.name : "Select Trailer"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <label className="block text-xs font-black text-zinc-500 uppercase tracking-widest">Poster / Thumbnail</label>
                    <div className="relative group h-40">
                      <input 
                        type="file" 
                        name="poster"
                        required
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="h-full bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center group-hover:border-amber-500/50 transition-all">
                        {files.poster ? (
                          <div className="flex items-center gap-4 px-6">
                            <div className="h-20 w-14 rounded bg-zinc-800 overflow-hidden">
                              <img src={URL.createObjectURL(files.poster)} className="h-full w-full object-cover" alt="" />
                            </div>
                            <span className="text-xs font-bold text-white">{files.poster.name}</span>
                          </div>
                        ) : (
                          <div className="text-center">
                            <BiMovie className="mx-auto text-zinc-600 group-hover:text-amber-500 mb-1" size={32} />
                            <p className="text-xs font-bold text-zinc-400">Upload Poster Image (High Res)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-zinc-800">
                    <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Subtitles (.vtt)</label>
                    <div className="relative group">
                      <input type="file" name="subtitles" accept=".vtt,.srt" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      <div className="bg-zinc-950 border-2 border-dashed border-zinc-800 rounded-2xl p-6 text-center transition-all group-hover:border-amber-500/50">
                        <BiCloudUpload className="mx-auto text-zinc-500 mb-2" size={32} />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{files.subtitles ? files.subtitles.name : "Optional: Upload Subtitle File"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right: Sidebar Options */}
            <div className="space-y-8">
              <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Categorization</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Genre</label>
                    <select 
                      name="category"
                      required
                      className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white text-sm focus:ring-amber-500 transition-all"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Genre</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Content Type</label>
                    <select 
                      name="contenttype"
                      required
                      className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white text-sm focus:ring-amber-500 transition-all"
                      value={formData.contenttype}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Type</option>
                      {contentTypes.map(t => <option key={t._id} value={t._id}>{t.contenttype}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Metadata & Settings</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Duration</label>
                      <input type="text" name="duration" placeholder="2h 15m" className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white text-sm" value={formData.duration} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Language</label>
                      <input type="text" name="language" placeholder="English" className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white text-sm" value={formData.language} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Rating</label>
                      <input type="text" name="rating" placeholder="8.5" className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white text-sm" value={formData.rating} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Release Date</label>
                      <input type="date" name="releaseDate" className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white text-sm" value={formData.releaseDate} onChange={handleInputChange} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Price (₹)</label>
                    <input 
                      type="number" 
                      name="price" 
                      placeholder="199" 
                      className="w-full bg-zinc-950 border-zinc-800 rounded-xl py-3 px-4 text-white text-sm focus:ring-amber-500" 
                      value={formData.price} 
                      onChange={handleInputChange} 
                    />
                  </div>

                  <div className="pt-4 space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        name="isPremium"
                        className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-amber-500 focus:ring-amber-500/20 transition-all"
                        checked={formData.isPremium}
                        onChange={handleInputChange}
                      />
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest group-hover:text-amber-500 transition-colors">Premium Content</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        name="isKids"
                        className="w-5 h-5 rounded border-zinc-800 bg-zinc-950 text-blue-500 focus:ring-blue-500/20 transition-all"
                        checked={formData.isKids}
                        onChange={handleInputChange}
                      />
                      <span className="text-xs font-black text-zinc-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">Kids Friendly</span>
                    </label>
                  </div>
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

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black py-5 rounded-3xl transition-all shadow-[0_10px_30px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:hover:scale-100 uppercase tracking-widest"
              >
                {loading ? "Publishing Content..." : "Publish Content"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </Layout>
  );
}
