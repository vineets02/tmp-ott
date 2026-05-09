import React from "react"
import Header from "./Header"
import Footer from "./Footer"
import { Helmet } from "react-helmet-async"
import { Toaster } from "react-hot-toast"
import Sidebar from "./Sidebar"

function Layout({ children, title, description, keywords, author }) {
  return (
    <div>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="description" content={description || "TMP OTT - Stream high-quality movies and web shows."} />
        <meta name="keywords" content={keywords || "movies, streaming, ott, web shows, originals"} />
        <meta name="author" content={author || "TMP OTT Admin"} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || "TMP OTT - Premium Entertainment"}</title>
      </Helmet>
      <Header />
      <main style={{ minHeight: "20vh" }}>
        <Toaster toastStyle={{ backgroundColor: "#EFA80A" }} />
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout;
