import { useSelector, useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";

import { addToWatchlist } from "../../../redux/slices/watchSlice";
import React, { useEffect, useRef, useState } from "react";
import Layout from "../../../components/layout/Layout";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import VideoPlayer from "../../../components/VideoPlayer";
import { AiOutlinePlus, AiOutlineShareAlt, AiFillStar, AiFillHeart } from "react-icons/ai";
import { FaWhatsapp, FaTelegramPlane } from "react-icons/fa";
import { BiGroup, BiMessageDetail, BiUserCircle } from "react-icons/bi";
import NewCard from "../../../components/NewCard";
import RentModal from "../../../components/RentModal";
import WatchParty from "../../../components/WatchParty";
import Swal from "sweetalert2";
import config from "../../../config";


function MovieDetails() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();
  const location = useLocation();
  const auth = useSelector((state) => state.auth);
  const [movieDetails, setMovieDetails] = useState(null);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const watchlist = useSelector((state) => state.watchlist);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ paywallEnabled: true });
  const [showRentModal, setShowRentModal] = useState(false);
  const [rentalAccess, setRentalAccess] = useState(false);
  const [rentalExpiry, setRentalExpiry] = useState(null);
  const playerRef = useRef(null);
  const [initialProgress, setInitialProgress] = useState(0);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);
  const lastSyncTime = useRef(0);

  // Module B: Engagement & Community
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [userReview, setUserReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews"); // reviews | watchparty


  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const [movieRes, settingsRes] = await Promise.all([
          axios.get(`${config.API_BASE_URL}/api/v1/movie/get-movie/${slug}`),
          axios.get(`${config.API_BASE_URL}/api/v1/settings/get-settings`)
        ]);

        if (settingsRes.data?.settings) {
          setSettings(settingsRes.data.settings);
        }

        if (movieRes.data?.success) {
          const movie = movieRes.data.movie;
          setMovieDetails(movie);
          
          // Fetch Reviews using ID (Separately to avoid crashing the main page)
          try {
            const revRes = await axios.get(`${config.API_BASE_URL}/api/v1/review/movie/${movie._id}`);
            if (revRes.data?.success) {
              setReviews(revRes.data.reviews);
              setAverageRating(revRes.data.averageRating);
              setTotalReviews(revRes.data.totalReviews);
            }
          } catch (reviewErr) {
            
          }

          // Fetch initial progress from history
          if (auth?.token) {
            const historyRes = await axios.get(`${config.API_BASE_URL}/api/v1/auth/history?profileId=${auth?.activeProfile?._id || ""}`, {
              headers: { Authorization: `Bearer ${auth.token}` }
            });
            const movieHistory = historyRes.data.history?.find(h => h.movie?._id === movie._id);
            if (movieHistory) {
              setInitialProgress(movieHistory.progress);
            }

            // Check active rental
            const rentRes = await axios.get(
              `${config.API_BASE_URL}/api/v1/rent/check/${movie._id}`,
              { headers: { Authorization: `Bearer ${auth.token}` } }
            );
            if (rentRes.data?.hasAccess) {
              setRentalAccess(true);
              setRentalExpiry(rentRes.data.expiresAt);
            }
          }

          const relatedRes = await axios.get(
            `${config.API_BASE_URL}/api/v1/movie/related-product/${movie._id}/${movie.category._id}`
          );
          setRelatedMovies(relatedRes.data.movies);
        }
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [slug, auth?.token]);

  // If no progress, allow direct play
  useEffect(() => {
    if (initialProgress === 0) {
      setIsReadyToPlay(true);
    }
  }, [initialProgress]);

  const handleProgress = async (currentTime) => {
    // Throttled sync (every 10 seconds)
    const now = Date.now();
    if (now - lastSyncTime.current < 10000) return;
    lastSyncTime.current = now;

    if (auth?.token && movieDetails?._id) {
      try {
        await axios.post(`${config.API_BASE_URL}/api/v1/auth/history`, {
          movieId: movieDetails._id,
          progress: Math.floor(currentTime),
          profileId: auth?.activeProfile?._id
        }, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
      } catch (err) {
        
      }
    }
  };

  const handleAddToWatchlist = async () => {
    if (!auth?.token) {
      return Swal.fire("Login Required", "Please login to manage your watchlist", "warning");
    }
    try {
      const { data } = await axios.post(`${config.API_BASE_URL}/api/v1/auth/watchlist`,
        { 
          movieId: movieDetails._id,
          profileId: auth?.activeProfile?._id 
        },
        { headers: { Authorization: `Bearer ${auth.token}` } }
      );
      if (data.success) {
        dispatch(addToWatchlist(movieDetails));
        Swal.fire({
          icon: "success",
          title: "Added to Watchlist",
          showConfirmButton: false,
          timer: 1500
        });
      }
    } catch (error) {
      Swal.fire("Error", "Could not add to watchlist", "error");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!auth?.token) return Swal.fire("Login Required", "Please login to leave a review", "warning");
    if (!userReview.comment) return Swal.fire("Required", "Please write a comment", "info");

    try {
      setSubmittingReview(true);
      const { data } = await axios.post(`${config.API_BASE_URL}/api/v1/review/create`, {
        movieId: movieDetails._id,
        rating: userReview.rating,
        comment: userReview.comment
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      if (data.success) {
        Swal.fire("Thank You!", "Your review has been submitted.", "success");
        setUserReview({ rating: 5, comment: "" });
        // Refresh reviews
        const revRes = await axios.get(`${config.API_BASE_URL}/api/v1/review/movie/${movieDetails._id}`);
        setReviews(revRes.data.reviews);
        setAverageRating(revRes.data.averageRating);
        setTotalReviews(revRes.data.totalReviews);
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to submit review", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = (platform) => {
    const shareUrl = window.location.href;
    const shareText = `Check out this movie on TMP OTT: ${movieDetails.title}`;
    
    if (platform === "whatsapp") {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`);
    } else if (platform === "telegram") {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`);
    } else {
      navigator.clipboard.writeText(shareUrl);
      Swal.fire({
        icon: "success",
        title: "Link Copied!",
        timer: 1500,
        showConfirmButton: false
      });
    }
  };


  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-500"></div></div>;
  if (!movieDetails) return <Layout><div className="h-[60vh] flex items-center justify-center text-white">Movie not found</div></Layout>;

  const isAdmin = auth?.user?.role === 1;
  const isExpired = auth?.user?.subscriptionEndDate && new Date(auth?.user?.subscriptionEndDate) < new Date();
  const isSubscribed = (auth?.user?.subscription && !isExpired) || isAdmin;
  const isPremium = movieDetails.isPremium;
  const showPaywall = isPremium && !isSubscribed && !rentalAccess && settings.paywallEnabled;
  const canRent = movieDetails.rentalPrice > 0;
  return (
    <Layout 
      title={`${movieDetails.title} - TMP OTT`}
      description={movieDetails.description}
      keywords={`${movieDetails.title}, ${movieDetails.category?.name}, ${movieDetails.cast?.join(", ")}, TMP OTT`}
    >
      <Helmet>
        <meta property="og:title" content={movieDetails.title} />
        <meta property="og:description" content={movieDetails.description} />
        <meta property="og:image" content={`${config.API_BASE_URL}/api/v1/movie/movie-poster/${movieDetails._id}`} />
        <meta property="og:type" content="video.movie" />
      </Helmet>
      <div className="min-h-screen bg-zinc-950 text-white">

        {/* Theater Mode Player */}
        <div className="relative aspect-video w-full overflow-hidden bg-black shadow-2xl md:h-[80vh]">
          {showPaywall ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center">
              <div className="mb-6 rounded-full bg-amber-500/10 p-6 text-amber-500 ring-1 ring-amber-500/50">
                <AiFillStar size={48} className="animate-pulse" />
              </div>
              <h2 className="mb-2 text-3xl font-black md:text-5xl">
                {isExpired ? "Subscription Expired" : "Premium Content"}
              </h2>
              <p className="mb-8 max-w-md text-zinc-400">
                {isExpired
                  ? "Your cinematic journey has paused. Renew to continue."
                  : "Subscribe for unlimited access or rent this title for just 48 hours."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/subscribe")}
                  className="rounded-full bg-amber-500 px-10 py-4 text-lg font-black text-black transition-all hover:scale-105 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                >
                  SUBSCRIBE — Unlimited
                </button>
                {canRent && (
                  <button
                    onClick={() => setShowRentModal(true)}
                    className="rounded-full border-2 border-amber-500 text-amber-500 px-10 py-4 text-lg font-black transition-all hover:scale-105 hover:bg-amber-500/10"
                  >
                    RENT — ₹{movieDetails.rentalPrice} / 48hrs
                  </button>
                )}
                <button
                  onClick={() => navigate("/")}
                  className="rounded-full bg-white/10 px-10 py-4 text-lg font-bold text-white backdrop-blur transition-all hover:bg-white/20"
                >
                  Browse Free
                </button>
              </div>
            </div>
          ) : (
            <div className="relative h-full w-full">
              {!isReadyToPlay && initialProgress > 0 ? (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
                  <div className="mb-8 text-center">
                    <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
                    <p className="text-zinc-400">You were watching this movie. How would you like to continue?</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6">
                    <button
                      onClick={() => setIsReadyToPlay(true)}
                      className="group flex items-center gap-4 rounded-2xl bg-amber-500 px-8 py-4 text-xl font-black text-black transition-all hover:scale-105 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                    >
                      RESUME AT {Math.floor(initialProgress / 60)}:{String(initialProgress % 60).padStart(2, '0')}
                    </button>
                    <button
                      onClick={() => {
                        setInitialProgress(0);
                        setIsReadyToPlay(true);
                      }}
                      className="flex items-center gap-4 rounded-2xl bg-white/10 px-8 py-4 text-xl font-bold text-white backdrop-blur transition-all hover:bg-white/20"
                    >
                      START OVER
                    </button>
                  </div>
                </div>
              ) : (
                <VideoPlayer
                  options={{
                    autoplay: true,
                    controls: true,
                    responsive: true,
                    fluid: true,
                    title: movieDetails.title,
                    startTime: initialProgress,
                    sources: [{
                      src: `${config.API_BASE_URL}/api/v1/movie/movie-video/${movieDetails._id}?token=${auth?.token}`,
                      type: 'video/mp4'
                    }],
                    tracks: movieDetails.subtitles ? [{
                      kind: 'captions',
                      src: `${config.API_BASE_URL}/api/v1/movie/movie-subtitles/${movieDetails._id}`,
                      srclang: 'en',
                      label: 'English',
                      default: true
                    }] : [],
                    playbackRates: [0.5, 1, 1.5, 2],
                    userActions: {
                      hotkeys: true
                    }
                  }}
                  onProgress={handleProgress}
                  onReady={(player) => {
                    playerRef.current = player;
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-10">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Left: Info */}
            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-4xl font-black md:text-6xl">{movieDetails.title}</h1>
                <div className="flex items-center gap-1 rounded bg-zinc-800 px-3 py-1 text-amber-500">
                  <AiFillStar />
                  <span className="font-bold">{averageRating || movieDetails.rating || "0.0"}</span>
                  <span className="text-[10px] text-zinc-500 ml-1">({totalReviews})</span>
                </div>

              </div>

              <div className="flex flex-wrap gap-3 text-sm font-medium text-zinc-400">
                <span className="rounded border border-zinc-700 px-2 py-0.5">HD</span>
                <span>{movieDetails.language}</span>
                <span>•</span>
                <span>{movieDetails.duration}</span>
                <span>•</span>
                <span>{movieDetails.category?.name}</span>
              </div>

              <p className="text-lg leading-relaxed text-zinc-300 md:text-xl">
                {movieDetails.description}
              </p>

              <div className="grid grid-cols-1 gap-6 pt-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-zinc-500 font-bold uppercase tracking-wider text-xs">Director</h3>
                  <p className="text-amber-500 font-semibold">{movieDetails.director}</p>
                </div>
                <div>
                  <h3 className="mb-2 text-zinc-500 font-bold uppercase tracking-wider text-xs">Starring</h3>
                  <p className="text-zinc-200">{movieDetails.cast?.join(", ") || "Main Cast Info Unavailable"}</p>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="w-full lg:w-72 space-y-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleShare("copy")}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/5 py-4 font-bold transition-all hover:bg-white/10"
                >
                  <AiOutlineShareAlt className="text-xl" /> Copy Link
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 py-3 text-emerald-500 font-bold hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                  >
                    <FaWhatsapp /> WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare("telegram")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-500/10 py-3 text-blue-500 font-bold hover:bg-blue-500/20 transition-all border border-blue-500/20"
                  >
                    <FaTelegramPlane /> Telegram
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-zinc-900 p-6">
                <p className="text-zinc-400 text-sm mb-4 text-center italic font-medium">Experience high-quality streaming</p>
                <button className="w-full rounded-lg bg-amber-500 py-3 font-black text-black transition-all hover:scale-105 shadow-[0_5px_15px_rgba(245,158,11,0.2)]">
                  RENT IN 4K — ₹{movieDetails.rentalPrice || 199}
                </button>
              </div>
            </div>
          </div>

          {/* INTERACTIVE SECTION TABS */}
          <div className="mt-20 border-t border-zinc-900 pt-16">
            <div className="flex gap-8 mb-10 border-b border-zinc-900">
               <button 
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-4 text-xl font-black transition-all ${activeTab === "reviews" ? "text-amber-500 border-b-2 border-amber-500" : "text-zinc-600 hover:text-zinc-400"}`}
               >
                  USER REVIEWS ({totalReviews})
               </button>
               <button 
                  onClick={() => setActiveTab("watchparty")}
                  className={`pb-4 text-xl font-black transition-all flex items-center gap-2 ${activeTab === "watchparty" ? "text-amber-500 border-b-2 border-amber-500" : "text-zinc-600 hover:text-zinc-400"}`}
               >
                  WATCH PARTY <span className="bg-amber-500/10 text-amber-500 text-[10px] px-2 py-0.5 rounded-full animate-pulse">LIVE Beta</span>
               </button>
            </div>

            {activeTab === "reviews" ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left: Write Review */}
                <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                        <BiMessageDetail size={24} />
                    </div>
                    <h3 className="text-xl font-black text-white">Rate this Movie</h3>
                  </div>
                  
                  <form onSubmit={handleReviewSubmit} className="space-y-6">
                    <div>
                      <label className="text-xs font-black uppercase text-zinc-500 tracking-widest block mb-4">Your Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setUserReview({ ...userReview, rating: star })}
                            className={`p-2 transition-all ${userReview.rating >= star ? "text-amber-500 scale-110" : "text-zinc-700"}`}
                          >
                            <AiFillStar size={32} />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs font-black uppercase text-zinc-500 tracking-widest block mb-2">Your Review</label>
                      <textarea
                        value={userReview.comment}
                        onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
                        placeholder="Share your thoughts about this movie..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white min-h-[120px] focus:border-amber-500 outline-none transition-all"
                      />
                    </div>

                    <button
                      disabled={submittingReview}
                      className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black hover:bg-amber-400 transition-all shadow-lg disabled:opacity-50"
                    >
                      {submittingReview ? "SUBMITTING..." : "POST REVIEW"}
                    </button>
                  </form>
                </div>

                {/* Right: Review List */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <h3 className="text-2xl font-black text-white">Recent Feedback</h3>
                    <div className="flex items-center gap-2 text-amber-500 font-black">
                      <AiFillStar /> {averageRating} / 5
                    </div>
                  </div>

                  <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                    {reviews.length > 0 ? (
                      reviews.map((rev) => (
                        <div key={rev._id} className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-500">
                                <BiUserCircle size={24} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{rev.user?.name || "Anonymous"}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-black">{new Date(rev.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex text-amber-500">
                              {[...Array(rev.rating)].map((_, i) => <AiFillStar key={i} size={14} />)}
                            </div>
                          </div>
                          <p className="text-zinc-400 leading-relaxed italic">"{rev.comment}"</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 text-zinc-700">
                        <BiMessageDetail size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-bold italic">Be the first to review this movie!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 min-h-[600px]">
                <div className="lg:col-span-3 aspect-video bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center justify-center relative overflow-hidden group">
                   <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
                   <div className="text-center space-y-4 relative z-10">
                      <div className="h-20 w-20 bg-amber-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)]">
                         <BiGroup size={40} className="text-black" />
                      </div>
                      <h3 className="text-3xl font-black text-white">Watch Sync Enabled</h3>
                      <p className="text-zinc-500 max-w-sm mx-auto">Start a room to synchronize your player with others in real-time.</p>
                   </div>
                </div>
                <div className="h-full">
                   <WatchParty 
                      movieId={movieDetails._id} 
                      movieTitle={movieDetails.title} 
                      player={playerRef.current}
                      auth={auth}
                   />
                </div>
              </div>
            )}
          </div>



          {/* Related Content Section */}
          {relatedMovies.length > 0 && (
            <div className="mt-20 border-t border-zinc-900 pt-16">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.3em] text-amber-500 mb-1">Recommended</h2>
                  <h3 className="text-3xl font-black text-white">You May Also Like</h3>
                </div>
                <div className="h-px flex-1 mx-10 bg-zinc-900" />
              </div>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-20">
                {relatedMovies.map((m) => (
                  <NewCard key={m._id} movie={m} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rental Expiry Badge */}
      {rentalAccess && rentalExpiry && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 border border-amber-500/50 rounded-2xl px-5 py-3 shadow-xl shadow-amber-500/10">
          <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Rental Access</p>
          <p className="text-white font-bold text-sm">
            Expires: {new Date(rentalExpiry).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      )}

      {/* Rent Modal */}
      {showRentModal && (
        <RentModal
          movie={movieDetails}
          auth={auth}
          onClose={() => setShowRentModal(false)}
          onSuccess={() => {
            setShowRentModal(false);
            setRentalAccess(true);
          }}
        />
      )}
    </Layout>
  );
}

export default MovieDetails;
