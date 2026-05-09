import config from "../../config";
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { Outlet } from "react-router-dom"
import axios from "axios"
import Spinner from "../Spinner"

export default function AdminRoute() {
  const [ok, setOk] = useState(false)
  const auth = useSelector((state) => state.auth)
  const privateApi = `${config.API_BASE_URL}/api/v1/auth/admin-auth`

  useEffect(() => {
    const authCheck = async () => {
      try {
        const res = await axios.get(privateApi, {
          headers: {
            Authorization: auth?.token,
          },
        })
        if (res.data.ok) {
          setOk(true)
        } else {
          setOk(false)
        }
      } catch (error) {
        
        setOk(false)
      }
    }
    if (auth?.token) {
      authCheck()
    }
  }, [auth?.token])

  return ok ? <Outlet /> : <Spinner path=" " />
}
