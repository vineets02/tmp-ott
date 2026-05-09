import React from "react";
import { Link } from "react-router-dom";
import config from "../config";

export default function HistoryCard({ item }) {
  const { movie, progress } = item;
  if (!movie) return null;

  // Assuming duration is like "2h 30m" or similar, we might need to parse it 
  // but for now let's just show a generic progress bar if we don't have total seconds.
  // Ideally, progress is in seconds and we'd have movie.durationSeconds.
  
  const posterUrl = `${config.API_BASE_URL}/api/v1/movie/movie-photo/${movie._id}`;

  return (
    <div className="group relative flex flex-col gap-2 transition-all hover:scale-105">
      <Link to={`/movie/${movie._id}`}>
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-xl">
          <img
            src={posterUrl}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
          />
          {/* Progress Bar Overlay */}
          <div className="absolute bottom-0 left-0 h-1.5 w-full bg-white/20">
            <div 
              className="h-full bg-amber-500" 
              style={{ width: `${Math.min(progress, 100)}%` }} // Using progress as % for now
            />
          </div>
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-2xl">
              <span className="ml-1 text-xl">▶</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex flex-col">
        <h3 className="line-clamp-1 text-sm font-bold text-white">{movie.title}</h3>
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">
          Continue Watching
        </p>
      </div>
    </div>
  );
}
