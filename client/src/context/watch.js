import { useState, useEffect, useContext, createContext } from "react"

const WatchlistContext = createContext()
const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState([])

  //default axios
  //   axios.defaults.headers.common["Authorization"] = auth?.token

  useEffect(() => {
    let existingWatchlist = localStorage.getItem("watchlist")
    if (existingWatchlist) setWatchlist(JSON.parse(existingWatchlist))
    //eslint-disable-next-line
  }, [])
  return (
    <WatchlistContext.Provider value={[watchlist, setWatchlist]}>
      {children}
    </WatchlistContext.Provider>
  )
}

// custom hook
const useWatchlist = () => useContext(WatchlistContext)

export { useWatchlist, WatchlistProvider }
