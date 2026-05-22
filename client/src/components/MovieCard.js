import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import HoverVideoPlayer from "react-hover-video-player"
import { AiFillPlayCircle, AiOutlineCheckCircle } from "react-icons/ai"
import { IoAddCircleOutline } from "react-icons/io5"
import { BsHandThumbsUp } from "react-icons/bs"
import { useSelector, useDispatch } from "react-redux";
import { addToRent, removeFromRent } from "../redux/slices/rentSlice";
import { addToWatchlist, removeFromWatchlist } from "../redux/slices/watchSlice";

const MovieCard = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false)
  const watchlist = useSelector((state) => state.watchlist);
  const rent = useSelector((state) => state.rent);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [loggedIn, setLoggedIn] = useState(false);

  const navigate = useNavigate();

  const handleMovieDetails = (movie) => {
    navigate(`/movie/${movie._id}`, {
      state: movie,
    })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const rentMovie = (movie) => {
    if (auth.user) {
      setLoggedIn(true)
      dispatch(addToRent(movie))
      // alert("Movie rented successfully")
      navigate(`/dashboard/user/rent`)
    } else {
      setLoggedIn(false)
      navigate(`/login`)
    }
  }

  const removeWatchlist = (pid) => {
    try {
      dispatch(removeFromWatchlist(pid));
    } catch (error) {
      
    }
  }

  const removeRent = (pid) => {
    try {
      dispatch(removeFromRent(pid));
    } catch (error) {
      
    }
  }

  const isMovieInWatchlist = watchlist.some((item) => item._id === movie._id)
  const isMovieRented = rent.some((item) => item._id === movie._id)

  return (
    <>
      <div
        className="relative z-50 h-56 min-w-[180px]  sm:grid-cols-1  cursor-pointer transition duration-200 ease-out md:h-48 md:min-w-[260px] md:hover:scale-110"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <HoverVideoPlayer
          videoSrc={movie.trailer?.startsWith("http") ? movie.trailer : `${config.API_BASE_URL}/${movie.trailer}`}
          volume={1}
          controls
          loop
          // pausedOverlay={<div>Paused!</div>}
          disableRemotePlayback={true}
          overlayTransitionDuration={500}
          disablePictureInPicture={false}
          controlsList="nodownload nofullscreen"
          playbackStartDelay={100}
          unloadVideoOnPaused
          preload="metadata"
          sizingMode="video"
          playbackRangeStart={2.5}
          // playbackRangeEnd={5}
          className="mx-1 bg-black "
          videoCaptions={
            <>
              <track
                src="captions/english.vtt"
                srcLang="en"
                label="English"
                kind="captions"
                default
              />
              <track
                src="captions/french.vtt"
                srcLang="fr"
                label="Francais"
                kind="subtitles"
              />
            </>
          }
          pausedOverlay={
            <img
              src={`https://tmp-h86h.onrender.com/api/v1/movie/movie-photo/${movie._id}`}
              alt={movie.title}
              className="rounded-sm object-fill md:rounded bg-black"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "fill",
              }}
            />
          }
          loadingOverlay={
            <div className="loading-overlay">
              <div className="loading-spinner" />
            </div>
          }
        />
        {isHovered && (
          <div className="movie-details bg-black">
            <div className="flex justify-between align-items-center bg-black flex-auto p-2">
              <div className=" z-50 relative">
                {!isMovieRented ? (
                  <Tooltip
                    content="Rent Now"
                    className="z-50 relative"
                    style="dark"
                  >
                    <AiFillPlayCircle
                      className="text-[#fff] hover:text-[#f5a609b0]"
                      onClick={() => rentMovie(movie)}
                      size={25}
                    />
                  </Tooltip>
                ) : (
                  <AiFillPlayCircle
                    className="text-[#fff] hover:text-[#f5a609b0]"
                    onClick={() => handleMovieDetails(movie)}
                    size={25}
                  />
                )}
                {isMovieRented ? (
                  <button
                    className=" font-bold text-4xl"
                    onClick={() => removeRent(movie._id)}
                  >
                    remove
                  </button>
                ) : null}
              </div>
              <div className=" ">
                {isMovieInWatchlist ? (
                  <Tooltip content="Remove from Watchlist" style="dark">
                    <AiOutlineCheckCircle
                      size={25}
                      onClick={() => removeWatchlist(movie._id)}
                    />
                  </Tooltip>
                ) : (
                  <Tooltip content="Add to Watchlist" style="dark">
                    <IoAddCircleOutline
                      className="text-[#fff] hover:text-[#fff]"
                      onClick={() => {
                        dispatch(addToWatchlist(movie));
                        alert("Movie added to watchlist")
                      }}
                      size={25}
                    />
                  </Tooltip>
                )}
              </div>
              <div className=" ">
                <BsHandThumbsUp
                  className="text-[#fff] hover:text-[#fff]"
                  onClick={() => handleMovieDetails(movie)}
                  size={25}
                />
              </div>
            </div>
            <div className="justify-start">
              <div className="flex mx-2">
                <div>{movie.language}</div>
                <div className="flex mx-2">
                  <span className="align-items-center my-1 mx-1">
                    {/* <BiTimeFive /> */}
                  </span>
                  {movie.duration}
                </div>
              </div>
            </div>
            <div className="flex justify-start capitalize px-2  font-medium">
              <span>{movie.contenttype.contenttype} </span>
              <span className="mx-2">&#x2022; </span>
              <span>{movie.category.name}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default MovieCard
