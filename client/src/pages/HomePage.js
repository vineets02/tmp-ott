import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import Layout from "../components/layout/Layout";
import axios from "axios";
import Row from "../components/Row";
import Hero from "../components/Hero";
import config from "../config";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

function Loader() {
  return (
    <div className="flex h-screen bg-black items-center justify-center">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [trending, setTrending] = useState([]);
  const [history, setHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [pinnedCategories, setPinnedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const isKids = auth?.activeProfile?.isChild;
      
      const [movieDataRes, catDataRes, homeSettingsRes] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/api/v1/movie/get-movie?kids=${isKids || false}`),
        axios.get(`${config.API_BASE_URL}/api/v1/category/get-category`),
        axios.get(`${config.API_BASE_URL}/api/v1/homepage/get-settings`)
      ]);

      const allMovies = movieDataRes.data.movies || [];
      setMovies(allMovies);
      setTrending(allMovies.slice(0, 10));

      setCategories(catDataRes.data.category || []);

      if (homeSettingsRes.data.success) {
        const { heroMovies, pinnedCategories, isManualHero, isManualCategories } = homeSettingsRes.data.settings;
        
        // Handle Hero Slider
        if (isManualHero && heroMovies.length > 0) {
          setFeaturedMovies(heroMovies);
        } else {
          setFeaturedMovies(allMovies.slice(0, 5));
        }

        // Handle Categories
        if (isManualCategories && pinnedCategories.length > 0) {
          setPinnedCategories(pinnedCategories.map(p => p.category).filter(Boolean));
        } else {
          setPinnedCategories([]); // Fallback to all categories
        }
      }

      // Fetch History
      if (auth?.token) {
        const { data: historyData } = await axios.get(
          `${config.API_BASE_URL}/api/v1/auth/history?profileId=${auth?.activeProfile?._id || ""}`,
          { headers: { Authorization: `Bearer ${auth.token}` } }
        );
        if (historyData.success) {
          setHistory(historyData.history.filter(h => h.movie && h.movie.slug).slice(0, 10));
        }
      }
    } catch (e) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [auth?.token, auth?.activeProfile?._id]);

  if (loading) return <Loader />;

  const displayFeatured = featuredMovies;

  return (
    <Layout title="TMP OTT - Premium Streaming">
      <div className="min-h-screen bg-zinc-950 text-white">
        
        {/* HERO SLIDER */}
        <Carousel
          showThumbs={false}
          autoPlay
          infiniteLoop
          interval={5000}
          showStatus={false}
          showIndicators={true}
          className="hero-carousel"
        >
        {displayFeatured.map((heroMovie) => {
            const heroPoster = `${config.API_BASE_URL}/api/v1/movie/movie-poster/${heroMovie._id}`;
            const heroTrailer = `${config.API_BASE_URL}/api/v1/movie/movie-trailer/${heroMovie._id}`;

            return (
              <div key={heroMovie._id}>
                <Hero videoUrl={heroTrailer} posterUrl={heroPoster}>
                  <div className="max-w-2xl space-y-3 sm:space-y-6 text-left">

                    {/* Featured tag */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-0.5 w-8 sm:h-1 sm:w-12 bg-amber-500 rounded-full" />
                      <span className="text-[10px] sm:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-amber-500">
                        FEATURED CONTENT
                      </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl sm:text-5xl font-black leading-none tracking-tighter md:text-8xl drop-shadow-2xl line-clamp-2">
                      {heroMovie.title}
                    </h1>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-zinc-400">
                      <span className="text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] sm:text-xs">HD</span>
                      <span>{heroMovie.language}</span>
                      <span>{heroMovie.duration}</span>
                      <span className="hidden sm:inline">{heroMovie.category?.name}</span>
                    </div>

                    {/* Description — hidden on very small screens */}
                    <p className="hidden sm:block line-clamp-2 md:line-clamp-3 text-sm sm:text-lg leading-relaxed text-zinc-300 md:text-xl max-w-xl">
                      {heroMovie.description}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-wrap gap-2 sm:gap-4 pt-1 sm:pt-4">
                      <button
                        onClick={() => navigate(`/movie/${heroMovie.slug}`)}
                        className="group flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl bg-white px-5 py-2.5 sm:px-8 sm:py-4 text-sm sm:text-lg font-black text-black transition-all hover:scale-105 hover:bg-amber-500 shadow-xl"
                      >
                        <span className="text-lg sm:text-2xl transition-transform group-hover:scale-125">▶</span>
                        PLAY NOW
                      </button>
                      <button
                        onClick={() => navigate(`/movie/${heroMovie.slug}`)}
                        className="flex items-center gap-2 sm:gap-3 rounded-lg sm:rounded-xl bg-white/10 px-5 py-2.5 sm:px-8 sm:py-4 text-sm sm:text-lg font-bold text-white backdrop-blur-xl transition-all hover:bg-white/20 border border-white/10"
                      >
                        <AiOutlineInfoCircle size={20} />
                        <span className="hidden xs:inline">MORE INFO</span>
                        <span className="xs:hidden">INFO</span>
                      </button>
                    </div>
                  </div>
                </Hero>
              </div>
            );
          })}

        </Carousel>

        {/* CONTENT ROWS */}
        <div className="relative z-30 -mt-10 sm:-mt-20 md:-mt-32 space-y-6 sm:space-y-10 pb-16 px-3 sm:px-4 md:px-10">
          
          {/* Continue Watching */}
          {history.length > 0 && (
            <Row title="Continue Watching" movies={history.map(h => h.movie)} />
          )}

          {/* Trending Now */}
          <Row title="Trending Now" movies={trending} />

          {/* Curated Pinned Categories */}
          {pinnedCategories.length > 0 ? (
            pinnedCategories.map((cat) => {
              const catMovies = movies.filter(m => m.category?._id === cat._id);
              if (catMovies.length === 0) return null;
              return (
                <Row 
                  key={cat._id} 
                  title={cat.name} 
                  movies={catMovies} 
                />
              );
            })
          ) : (
            /* Fallback to all categories if none pinned */
            categories.map((cat) => {
              const catMovies = movies.filter(m => m.category?._id === cat._id);
              if (catMovies.length === 0) return null;
              return (
                <Row 
                  key={cat._id} 
                  title={cat.name} 
                  movies={catMovies} 
                />
              );
            })
          )}
        </div>

        {/* Footer Fade */}
        <div className="h-64 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>
    </Layout>
  );
}
