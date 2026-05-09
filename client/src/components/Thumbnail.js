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
      className="group relative h-40 min-w-[240px] cursor-pointer overflow-hidden rounded-xl bg-zinc-900 transition-all duration-300 hover:scale-110 hover:z-50 shadow-lg hover:shadow-amber-500/20"
    >
      {/* Poster Image */}
      <img
        src={`${config.API_BASE_URL}/api/v1/movie/movie-photo/${movie._id}`}
        alt={movie.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Info on Hover */}
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <h4 className="text-sm font-black text-white truncate drop-shadow-md uppercase tracking-wider">
          {movie.title}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          {movie.isPremium && (
            <span className="flex items-center gap-0.5 rounded-sm bg-amber-500 px-1 text-[10px] font-black text-black">
              <AiFillStar size={8} /> PREMIUM
            </span>
          )}
          <span className="text-[10px] font-bold text-zinc-400">
            {movie.duration} • {movie.language}
          </span>
        </div>
      </div>

      {/* Border Glow on Hover */}
      <div className="absolute inset-0 rounded-xl border-2 border-amber-500/0 transition-colors duration-300 group-hover:border-amber-500/50" />
    </div>
  );
}
