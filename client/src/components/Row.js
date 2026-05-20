import React from "react"
import { useRef, useState } from "react"
import { BsChevronLeft, BsChevronRight } from "react-icons/bs"
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
    <div className="space-y-2 md:space-y-4 overflow-visible">
      <h2 className="cursor-pointer text-base sm:text-xl font-black text-zinc-400 transition duration-200 hover:text-white md:text-2xl uppercase tracking-wider px-1 sm:px-2">
        {title}
      </h2>
      <div className="group relative">
        {/* Left arrow — hidden on touch/mobile, shown on desktop hover */}
        <BsChevronLeft
          className={`absolute top-0 bottom-0 left-1 z-40 m-auto h-9 w-9 md:h-12 md:w-12 cursor-pointer opacity-0 transition-all hover:scale-110 group-hover:opacity-100 bg-black/60 backdrop-blur-md rounded-full p-2 md:p-3 text-white shadow-xl hover:bg-amber-500 hover:text-black hidden md:flex items-center justify-center ${
            !isMoved && "!hidden"
          }`}
          onClick={() => handleClick("left")}
        />

        {/* Scrollable row — touch-friendly with momentum scroll */}
        <div
          className="flex items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide p-1 sm:p-2 md:p-3"
          ref={rowRef}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {movies.map((movie) => (
            <Thumbnail key={movie._id} movie={movie} />
          ))}
        </div>

        {/* Right arrow — desktop only */}
        <BsChevronRight
          className="absolute top-0 bottom-0 right-1 z-40 m-auto h-9 w-9 md:h-12 md:w-12 cursor-pointer opacity-0 transition-all hover:scale-110 group-hover:opacity-100 bg-black/60 backdrop-blur-md rounded-full p-2 md:p-3 text-white shadow-xl hover:bg-amber-500 hover:text-black hidden md:flex items-center justify-center"
          onClick={() => handleClick("right")}
        />
      </div>
    </div>
  )
}

export default Row
