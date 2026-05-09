import { useState, useContext, createContext } from "react"

const SearchContext = createContext()

const SearchProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    keyword: " ",
    results: [],
  })

  //default axios
  //   axios.defaults.headers.common["Authorization"] = auth?.token

  //   useEffect(() => {
  //     const data = localStorage.getItem("user")
  //     if (data) {
  //       const parseData = JSON.parse(data)
  //       setAuth({
  //         ...auth,
  //         user: parseData.user,
  //         token: parseData.token,
  //       })
  //     }
  //     //eslint-disable-next-line
  //   }, [])
  return (
    <SearchContext.Provider value={[auth, setAuth]}>
      {children}
    </SearchContext.Provider>
  )
}

// custom hook
const useSearch = () => useContext(SearchContext)

export { useSearch, SearchProvider }
