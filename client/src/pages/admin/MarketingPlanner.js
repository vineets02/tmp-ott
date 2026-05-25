import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import config from "../../config";
import AdminLayout from "../../components/layout/AdminLayout";
import Swal from "sweetalert2";
import moment from "moment";
import { 
  BiMoviePlay, 
  BiCalendarCheck, 
  BiCompass, 
  BiCopy, 
  BiDownload, 
  BiRefresh, 
  BiLoaderAlt, 
  BiSparkles, 
  BiSelectMultiple, 
  BiUpload,
  BiCheckCircle,
  BiPlus
} from "react-icons/bi";

export default function MarketingPlanner() {
  const auth = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  
  // Planner Plan & Milestones
  const [plan, setPlan] = useState(null);
  const [milestones, setMilestones] = useState([]);
  
  // Dialog generator states
  const [dialogues, setDialogues] = useState([]);
  const [customText, setCustomText] = useState("Witness the year's ultimate action saga. Streaming now!");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [canvasFormat, setCanvasFormat] = useState("post_1_1"); // "post_1_1" | "story_9_16"
  const [fontSize, setFontSize] = useState(28);
  const [textAlignment, setTextAlignment] = useState("center");
  const [overlayOpacity, setOverlayOpacity] = useState(0.4);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch all movies
  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/movie/get-movie`);
      if (data.success) {
        setMovies(data.movies);
        if (data.movies.length > 0) {
          setSelectedMovieId(data.movies[0]._id);
        }
      }
    } catch (error) {
      Swal.fire("Error", "Could not load movies library", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Load selected movie details & marketing planner details
  const loadMoviePlan = useCallback(async () => {
    if (!selectedMovieId) return;
    try {
      setLoading(true);
      const match = movies.find(m => m._id === selectedMovieId);
      setSelectedMovie(match);
      setBackgroundImage(`${config.API_BASE_URL}/api/v1/movie/movie-photo/${selectedMovieId}`);

      const [planRes, quotesRes] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/api/v1/admin/marketing/plan/${selectedMovieId}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        }),
        axios.get(`${config.API_BASE_URL}/api/v1/admin/marketing/suggest-dialogue/${selectedMovieId}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
      ]);

      if (planRes.data.success) {
        setPlan(planRes.data.plan);
        setMilestones(planRes.data.plan.milestones);
      }
      if (quotesRes.data.success) {
        setDialogues(quotesRes.data.suggestions);
        if (quotesRes.data.suggestions.length > 0) {
          setCustomText(quotesRes.data.suggestions[0]);
        }
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  }, [selectedMovieId, movies, auth.token]);

  useEffect(() => {
    loadMoviePlan();
  }, [loadMoviePlan]);

  // Toggle checklist milestone status
  const handleToggleMilestone = async (milestoneId) => {
    if (!plan) return;
    try {
      const { data } = await axios.put(`${config.API_BASE_URL}/api/v1/admin/marketing/milestone`, {
        planId: plan._id,
        milestoneId
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        setPlan(data.plan);
        setMilestones(data.plan.milestones);
      }
    } catch (error) {
      Swal.fire("Error", "Failed to update milestone task status", "error");
    }
  };

  // Image Upload handler for Canvas background still
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Render poster on HTML5 Canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const width = canvasFormat === "post_1_1" ? 1080 : 1080;
    const height = canvasFormat === "post_1_1" ? 1080 : 1920;

    canvas.width = width;
    canvas.height = height;

    // Background still image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      // Draw background fitting cover ratio
      const imgRatio = img.width / img.height;
      const canvasRatio = width / height;
      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2;
      } else {
        drawHeight = width / imgRatio;
        offsetY = (height - drawHeight) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // Apply Darkreadable Gradient Overlay Vignette
      ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
      ctx.fillRect(0, 0, width, height);

      // Vignette effect (cinematic edges)
      const gradient = ctx.createRadialGradient(width/2, height/2, width/4, width/2, height/2, width*0.7);
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.85)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Logo Watermark Brand Header
      ctx.fillStyle = "#F5A509";
      ctx.font = "black 28px Inter, system-ui";
      ctx.textAlign = "center";
      ctx.fillText("TMP OTT ORIGINAL", width / 2, 70);

      // Dialogue text rendering with text wrapping
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `bold ${fontSize}px Inter, Outfit, sans-serif`;
      ctx.textAlign = textAlignment;

      const words = customText.split(" ");
      let line = "";
      const lines = [];
      const maxWidth = width - 160;
      const lineHeight = fontSize * 1.35;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      // Centered position calculations
      const totalTextHeight = lines.length * lineHeight;
      let y = (height - totalTextHeight) / 2 + fontSize / 2;
      
      const x = textAlignment === "center" 
        ? width / 2 
        : textAlignment === "left" 
        ? 80 
        : width - 80;

      lines.forEach((l) => {
        ctx.fillText(l.trim(), x, y);
        y += lineHeight;
      });

      // Bottom Call-To-Action badge
      ctx.fillStyle = "#F5A509";
      ctx.font = "900 32px Inter, system-ui";
      ctx.textAlign = "center";
      ctx.fillText(`STREAM NOW — WATCH "${selectedMovie?.title?.toUpperCase() || 'MOVIE'}"`, width / 2, height - 100);
    };

    if (backgroundImage) {
      img.src = backgroundImage;
    }
  }, [backgroundImage, customText, canvasFormat, fontSize, textAlignment, overlayOpacity, selectedMovie]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Download creative canvas as PNG file
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    
    // Save to campaign planner database
    axios.post(`${config.API_BASE_URL}/api/v1/admin/marketing/save-creative`, {
      movieId: selectedMovieId,
      imageUrl: url,
      type: canvasFormat
    }, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });

    const link = document.createElement("a");
    link.download = `${selectedMovie?.slug || "movie"}-promo-${canvasFormat}.png`;
    link.href = url;
    link.click();
  };

  // Caption copying widget
  const handleCopyCaption = () => {
    const caption = `🔥 Now Streaming on TMP OTT! 🎥\n\n"${customText}"\n\nDon't miss "${selectedMovie?.title}" directed by ${selectedMovie?.director}. Start watching now via the link in bio! 🎬🍿\n\n#TMPOTT #${selectedMovie?.title?.replace(/\s+/g, '')} #${selectedMovie?.category?.name || 'Cinema'} #IndieFilm #StreamingNow #InstagramMovie`;
    navigator.clipboard.writeText(caption);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Caption copied to clipboard!',
      showConfirmButton: false,
      timer: 1500
    });
  };

  return (
    <AdminLayout title="Campaign Marketing Planner - Admin">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-2">Campaign Hub</h1>
          <h2 className="text-4xl font-black text-white">Marketing Planner</h2>
        </div>

        {/* Movie Selector dropdown */}
        <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <BiMoviePlay size={20} className="text-amber-500" />
          <select 
            value={selectedMovieId} 
            onChange={(e) => setSelectedMovieId(e.target.value)}
            className="bg-transparent border-none text-white font-black text-sm outline-none cursor-pointer pr-8"
          >
            {movies.map((m) => (
              <option key={m._id} value={m._id} className="bg-zinc-900 text-white font-bold">
                {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Interactive Milestone Checklist */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                <BiCalendarCheck size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">Launch Checklist</h3>
                <p className="text-xs text-zinc-500">Check off items relative to launch schedule</p>
              </div>
            </div>

            <div className="space-y-4">
              {milestones.map((m) => (
                <div 
                  key={m._id}
                  onClick={() => handleToggleMilestone(m._id)}
                  className={`flex gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                    m.status === "completed"
                      ? "bg-zinc-900 border-zinc-800 opacity-60"
                      : "bg-zinc-800/40 border-zinc-800/60 hover:border-zinc-700"
                  }`}
                >
                  <input 
                    type="checkbox"
                    checked={m.status === "completed"}
                    onChange={() => {}} // handled by parent onClick
                    className="mt-1 h-4 w-4 accent-amber-500 bg-zinc-800 rounded cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-black tracking-widest uppercase mb-1 ${
                      m.phase === "teaser" ? "text-blue-400" : m.phase === "launch" ? "text-amber-500" : "text-purple-400"
                    }`}>
                      {m.phase} Phase
                    </p>
                    <p className={`text-sm font-bold leading-tight ${m.status === "completed" ? "line-through text-zinc-500" : "text-white"}`}>
                      {m.task}
                    </p>
                    <p className="text-[10px] text-zinc-600 font-bold mt-2">
                      Target Date: {moment(m.scheduledDate).format("DD MMM YYYY")}
                    </p>
                  </div>
                </div>
              ))}
              {milestones.length === 0 && (
                <div className="py-12 text-center text-zinc-600 font-bold italic">
                  Loading launch pipeline milestones...
                </div>
              )}
            </div>
          </div>
          
          {/* Instagram Share kit Widget */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
                <BiCompass size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">Instagram Share Kit</h3>
                <p className="text-xs text-zinc-500">Copy ready-made captions & tags</p>
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-4 space-y-4">
              <div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Automated Caption</p>
                <div className="text-xs font-bold text-zinc-300 bg-zinc-900 p-3 rounded-xl max-h-36 overflow-y-auto whitespace-pre-line leading-relaxed">
                  🔥 Now Streaming on TMP OTT! 🎥
                  <br />
                  "{customText}"
                  <br /><br />
                  Don't miss "{selectedMovie?.title}" directed by {selectedMovie?.director}. Watch now! 🎬🍿
                  <br /><br />
                  #TMPOTT #{selectedMovie?.title?.replace(/\s+/g, '')} #Cinema #IndieFilm #StreamingNow
                </div>
              </div>
              <button 
                onClick={handleCopyCaption}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl text-xs font-black uppercase transition-all"
              >
                <BiCopy size={16} /> Copy Caption Copy
              </button>
            </div>
          </div>
        </div>

        {/* Center & Right Column: AI Dialogue Studio Canvas Editor */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col xl:flex-row gap-8">
          
          {/* Canvas Live Preview */}
          <div className="flex flex-col items-center gap-4 xl:w-96 flex-shrink-0">
            <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Live Canvas Preview</p>
            <div className={`relative border border-zinc-800 bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl ${
              canvasFormat === "post_1_1" ? "aspect-square w-72 h-72 sm:w-80 sm:h-80" : "w-52 h-96 aspect-[9/16]"
            }`}>
              <canvas ref={canvasRef} className="w-full h-full object-contain" />
            </div>
            <div className="flex gap-2">
              {[["post_1_1", "1:1 Square Feed"], ["story_9_16", "9:16 Portrait Story"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setCanvasFormat(val)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                    canvasFormat === val ? "bg-amber-500 text-black" : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Designer Tool Box */}
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
                <BiSparkles className="text-amber-500" /> AI Dialogue Studio
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Design catching dialogues overlay over movie stills</p>
            </div>

            {/* Quick Stills Dropdown */}
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Movie Background Still</label>
              <div className="flex gap-3">
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-3 rounded-xl text-xs font-black transition-all"
                >
                  <BiUpload size={16} /> Upload Custom Frame
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*"
                  className="hidden" 
                />
                <button 
                  onClick={() => setBackgroundImage(`${config.API_BASE_URL}/api/v1/movie/movie-photo/${selectedMovieId}`)}
                  className="bg-zinc-850 hover:bg-zinc-800 text-zinc-300 px-4 py-3 rounded-xl text-xs font-black transition-all border border-zinc-800"
                >
                  Reset Default Still
                </button>
              </div>
            </div>

            {/* Dialog Selector / Text Box */}
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Dialogue Overlay Text</label>
              <textarea 
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={3}
                placeholder="Enter movie dialouge or caption text..."
                className="w-full bg-zinc-850 border-none rounded-xl p-4 text-white font-bold text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Smart Suggested Quotes */}
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Suggested Dialogue Templates</label>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {dialogues.map((d, index) => (
                  <button
                    key={index}
                    onClick={() => setCustomText(d)}
                    className="text-left bg-zinc-950/60 hover:bg-zinc-850 border border-zinc-850 p-3 rounded-xl text-xs font-bold text-zinc-300 leading-normal transition-colors"
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Customization Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Font Size (px)</label>
                <input 
                  type="number"
                  min="20"
                  max="70"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value) || 28)}
                  className="w-full bg-zinc-850 border-none rounded-xl p-3 text-white font-black text-xs"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Align Text</label>
                <select
                  value={textAlignment}
                  onChange={(e) => setTextAlignment(e.target.value)}
                  className="w-full bg-zinc-850 border-none rounded-xl p-3 text-white font-black text-xs cursor-pointer"
                >
                  <option value="center">Center</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">
                  Vignette Filter Opacity ({Math.round(overlayOpacity * 100)}%)
                </label>
                <input 
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>
            </div>

            {/* Export and download button */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black py-4 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-[0_10px_30px_rgba(245,165,9,0.25)]"
            >
              <BiDownload size={18} /> EXPORT & DOWNLOAD POSTER
            </button>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
}
