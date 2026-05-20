import React from "react";
import config from "../config";
import { useNavigate } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";

export default function Thumbnail({ movie }) {
  const navigate = useNavigate();

  if (!movie) return null;

  return (
    <div
      onClick={() => navigate(`/movie/${movie.slug}`)}
      className="group relative h-28 sm:h-36 md:h-40 w-[140px] sm:w-[190px] md:w-[240px] flex-shrink-0 cursor-pointer overflow-hidden rounded-lg sm:rounded-xl bg-zinc-900 transition-all duration-300 hover:scale-105 hover:z-50 shadow-lg hover:shadow-amber-500/20"
    >
      {/* Poster Image */}
      <img
        src={`${config.API_BASE_URL}/api/v1/movie/movie-photo/${movie._id}`}
        alt={movie.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Always-visible title on mobile, hover on desktop */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      {/* Info — always shown on mobile, hover-reveal on desktop */}
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 sm:translate-y-4 sm:opacity-0 transition-all duration-300 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
        <h4 className="text-[11px] sm:text-sm font-black text-white truncate drop-shadow-md uppercase tracking-wide">
          {movie.title}
        </h4>
        <div className="flex items-center gap-1.5 mt-0.5">
          {movie.isPremium && (
            <span className="flex items-center gap-0.5 rounded-sm bg-amber-500 px-1 text-[8px] sm:text-[10px] font-black text-black">
              <AiFillStar size={7} /> PREMIUM
            </span>
          )}
          <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400">
            {movie.language}
          </span>
        </div>
      </div>

      {/* Border Glow on Hover */}
      <div className="absolute inset-0 rounded-lg sm:rounded-xl border-2 border-amber-500/0 transition-colors duration-300 group-hover:border-amber-500/50" />
    </div>
  );
}
