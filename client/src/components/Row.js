import React from "react"
import { useRef, useState } from "react"
import { BsChevronLeft } from "react-icons/bs"
import { BsChevronRight } from "react-icons/bs"
import Thumbnail from "../components/Thumbnail"

const Row = ({ title, movies }) => {
  const rowRef = useRef(null)
  const [isMoved, setIsMoved] = useState(false)
  const handleClick = (direction) => {
    setIsMoved(true)
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current

      const scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth
          : scrollLeft + clientWidth
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" })
    }
  }
  return (
    <div className="space-y-0.5 md:space-y-4 overflow-visible">
      <h2 className="cursor-pointer text-xl font-black text-zinc-400 transition duration-200 hover:text-white md:text-2xl uppercase tracking-wider px-2">
        {title}
      </h2>
      <div className="group relative md:-ml-2">
        <BsChevronLeft
          className={`absolute top-0 bottom-0 left-2 z-40 m-auto h-12 w-12 cursor-pointer opacity-0 transition-all hover:scale-110 group-hover:opacity-100 bg-black/50 backdrop-blur-md rounded-full p-3 text-white shadow-xl hover:bg-amber-500 hover:text-black ${
            !isMoved && "hidden"
          }`}
          onClick={() => handleClick("left")}
        />
        <div
          className="flex items-center space-x-3 overflow-x-scroll scrollbar-hide md:space-x-6 p-4"
          ref={rowRef}
        >
          {movies.map((movie, id) => (
            <Thumbnail key={movie._id} movie={movie} />
          ))}
        </div>
        <BsChevronRight
          className="absolute top-0 bottom-0 right-2 z-40 m-auto h-12 w-12 cursor-pointer opacity-0 transition-all hover:scale-110 group-hover:opacity-100 bg-black/50 backdrop-blur-md rounded-full p-3 text-white shadow-xl hover:bg-amber-500 hover:text-black"
          onClick={() => handleClick("right")}
        />
      </div>
    </div>
  )
}

export default Row
