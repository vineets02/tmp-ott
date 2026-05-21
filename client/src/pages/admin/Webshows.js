import { useSelector } from "react-redux";
import React from "react"
import AdminLayout from "../../components/layout/AdminLayout"

function Webshows() {
  const auth = useSelector((state) => state.auth)

  return (
    <AdminLayout title="Webshows - Admin">
          <div className="w-full">
            <h1 className="text-white">Create Category</h1>
            <div className="card w-100 p-3 text-white">
              <h3 className="text-white"> Admin Name : {auth?.user?.name}</h3>
              <h3> Admin Email : {auth?.user?.email}</h3>
              <h3> Admin Contact : {auth?.user?.phone}</h3>
            </div>
          </div>
    </AdminLayout>
  )
}

export default Webshows
