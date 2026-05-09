import React from "react"
import Layout from "../components/layout/Layout"
import Sidebar from "../components/layout/Sidebar"

function Movies() {
  return (
    <Layout title={"TMP - Movies"}>
      <div className="container-fluid m-3 p-3">
        <div className="row">
          <div className="col-md-3">{/* <Sidebar /> */}</div>
          <div className="col-md-9">
            <h1>Create Category</h1>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Movies
