import { useState, useEffect, useContext, createContext } from "react"

const RentContext = createContext()
const RentProvider = ({ children }) => {
  const [rent, setRent] = useState([])

  //default axios
  //   axios.defaults.headers.common["Authorization"] = auth?.token

  useEffect(() => {
    let existingRent = localStorage.getItem("rent")
    if (existingRent) setRent(JSON.parse(existingRent))
    //eslint-disable-next-line
  }, [])
  return (
    <RentContext.Provider value={[rent, setRent]}>
      {children}
    </RentContext.Provider>
  )
}

// custom hook
const useRent = () => useContext(RentContext)

export { useRent, RentProvider }
