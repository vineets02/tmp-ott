import config from "../config";
import axios from "axios"
import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import Modal from "react-modal"
import "./banner.css"
import "./modals.css"
import Modals from "./Modals"
import VideoPlayer from "./VideoPlayer"
import { AiOutlinePlus } from "react-icons/ai"
Modal.setAppElement("#root")
function Banner() {
  // const [modalOpen, setModalOpen] = useState(false)
  const [banner, setBanner] = useState(null)
  const navigate = useNavigate()
  const playerRef = useRef(null)

  const [isModalOpen, setModalOpen] = useState(false)

  const handleOpenModal = (movie) => {
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
  }

  const getAllBanner = async () => {
    try {
      const { data } = await axios.get(
        `${config.API_BASE_URL}/api/v1/movie/get-movie`
      )
      const allMovies = data.movies
      if (allMovies && allMovies.length > 0) {
        setBanner(allMovies[0]) // Just pick the first one for now
      }
    } catch (error) {
      
    }
  }
  const [movieDetails, setMovieDetails] = useState("")

  useEffect(() => {
    getAllBanner()
    const interval = setInterval(() => {
      getAllBanner()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  function truncate(string, n) {
    return string?.length > n ? string.substr(0, n - 1) + "..." : string
  }

  return (
    <div>
      {
        banner && (
          <header
            className="banner"
            style={{
              backgroundSize: "cover",
              backgroundImage: `url(${config.API_BASE_URL}/api/v1/movie/movie-photo/${banner._id})`,
              backgroundPosition: "center center",
            }}
          >
            <div className="banner_contents">
              <h1 className="banner_title">{banner?.title}</h1>
              <div>
                <button
                  className="banner_button"
                  onClick={() => handleOpenModal(banner)}
                >
                  Watch Trailer
                </button>
              </div>
              <h1 className="banner_description">
                {truncate(banner?.description, 150)}
              </h1>
            </div>
            <div className="banner--fadeButton" />
          </header>
        )
      }
      <Modals
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.75)",
          },
          content: {
            backgroundColor: "#000",
            width: "50%",
            height: "fit-content",
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          },
        }}
      >
        <div className="bg-[#121212] w-full">
          {banner && (
            <VideoPlayer
              options={{
                autoplay: true,
                controls: true,
                responsive: true,
                fluid: true,
                sources: [{
                  src: `${config.API_BASE_URL}/api/v1/movie/movie-trailer/${banner._id}`,
                  type: 'video/mp4'
                }]
              }}
              onReady={(player) => {
                playerRef.current = player;
              }}
            />
          )}
          <div className="banner--fadeButtons" />
          <div className="mx-5 pb-10">
            <h1 className="font-semibold text-2xl text-white mt-4">
              {banner?.title}
            </h1>
            <div className="flex py-6 gap-4">
              <button 
                className="px-10 py-2 bg-white rounded text-black font-bold hover:bg-zinc-200 transition-all"
                onClick={() => navigate(`/movie/${banner.slug}`)}
              >
                Watch Now
              </button>
              <button className="flex items-center justify-center bg-zinc-800 p-2 rounded-full text-white hover:bg-zinc-700">
                <AiOutlinePlus size={24} />
              </button>
            </div>

            <div className="text-zinc-400 leading-relaxed">
              {banner?.description}
            </div>
          </div>
        </div>
      </Modals>
    </div>
  )
}

export default Banner
