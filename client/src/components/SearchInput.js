import { useSelector } from "react-redux";
import { FaSearch } from "react-icons/fa"
import { Button, TextInput } from "flowbite-react"
import React from "react"

import axios from "axios"
import { useNavigate } from "react-router-dom"

function SearchInput() {
  const values = useSelector((state) => state.search)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.get(
        `https://tmp-h86h.onrender.com/api/v1/movie/search/${values.keyword}`
      )
      setValues({ ...values, results: data })

      navigate("/search")
    } catch (error) {
      
    }
  }

  return (
    <div>
      <form className="flex max-w-md flex-col gap-4" onSubmit={handleSubmit}>
        <div className=" relative z-100">
          <input
            type="search"
            value={values.keyword}
            onChange={(e) => setValues({ ...values, keyword: e.target.value })}
          />

          <button
            className="button"
            type="submit"
            style={
              {
                // padding: 0,
                // marginTop: -30,
                // backgroundColor: "#000",
              }
            }
          >
            <FaSearch
              style={{
                alignItems: "center",
                justifyCntent: "center",
                zIndex: 1111,
                marginLeft: -20,
                padding: 2,
                // margin: 2,
                // backgroundColor: "#000",
              }}
              size={16}
              color="#EFA80A"
            />
          </button>
        </div>
      </form>
    </div>
  )
}

export default SearchInput
