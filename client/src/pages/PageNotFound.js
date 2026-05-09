import React, { useEffect } from "react"
// import useHistory from "react-router-dom"
// import { Spinner } from "react-bootstrap"
import { useNavigate } from "react-router-dom"
import Layout from "../components/layout/Layout"

const PageNotFound = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      navigate("/") // Redirect to the home page
    }, 3000)

    return () => {
      clearInterval(interval) // Cleanup the interval on component unmount
    }
  }, [navigate])

  return (
    <>
      <Layout>
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "100vh" }}
        >
          <div>
            <h1>Page Not Found</h1>
            <p>Redirecting to home page...</p>
            {/* <Spinner animation="border" variant="primary" /> */}
          </div>
        </div>
      </Layout>
    </>
  )
}

export default PageNotFound
