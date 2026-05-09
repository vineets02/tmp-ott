import { useSelector } from "react-redux";
import React from "react"
import Sidebar from "../../components/layout/Sidebar"
import Layout from "../../components/layout/Layout"

function Webshows() {
  const auth = useSelector((state) => state.auth)

  return (
    <Layout>
      <div className="container-fluid  p-3">
        <div className="flex">
          <div className="w-1/4">
            <Sidebar />
          </div>
          <div className="w-3/4">
            <h1 className="text-white">Create Category</h1>
            <div className="card w-100 p-3 text-white">
              <h3 className="text-white"> Admin Name : {auth?.user?.name}</h3>
              <h3> Admin Email : {auth?.user?.email}</h3>
              <h3> Admin Contact : {auth?.user?.phone}</h3>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Webshows
