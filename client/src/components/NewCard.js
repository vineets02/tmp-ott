import config from "../config";
import { useSelector, useDispatch } from "react-redux";
import { addToRent } from "../redux/slices/rentSlice";
import React from "react"
import { AiFillPlayCircle } from "react-icons/ai"
import { useNavigate } from "react-router-dom"

const NewCard = ({ movie }) => {
  const auth = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleMovieDetails = (movie) => {
    // Admins and Subscribed users can bypass the paywall
    if (auth?.user?.subscription || auth?.user?.role === 1) {
      navigate(`/movie/${movie.slug}`, {
        state: movie,
      })
    } else {
      dispatch(addToRent(movie))
      navigate(`/dashboard/user/rent`)
    }
  }

  return (
    <div 
      className="group relative mx-auto h-64 w-full cursor-pointer overflow-hidden rounded-xl bg-zinc-900 transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-amber-500/50"
      onClick={() => handleMovieDetails(movie)}
    >
      <img
        src={`${config.API_BASE_URL}/api/v1/movie/movie-photo/${movie._id}`}
        alt={movie.title}
        className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-70"
      />
      
      {/* Overlay info */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <h3 className="text-sm font-bold text-white line-clamp-1">{movie.title}</h3>
        <div className="flex items-center gap-2 text-[10px] text-zinc-300">
          <span>{movie.language}</span>
          <span>•</span>
          <span>{movie.duration}</span>
        </div>
      </div>

      {/* Premium Badge */}
      {movie.isPremium && (
        <div className="absolute left-2 top-2 rounded-md bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold text-black shadow-lg">
          PREMIUM
        </div>
      )}

      {/* Play Icon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <AiFillPlayCircle className="text-5xl text-amber-500 shadow-2xl" />
      </div>
    </div>
  )
}

export default NewCard
