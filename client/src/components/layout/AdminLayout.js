import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Helmet } from "react-helmet";
import { Toaster } from "react-hot-toast";

export default function AdminLayout({ children, title }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950">
      <Helmet>
        <title>{title || "Admin Dashboard - TMP OTT"}</title>
      </Helmet>
      
      <div className="flex">
        {/* Sidebar handles its own mobile state, but we pass isCollapsed for desktop syncing if needed */}
        <Sidebar onCollapse={setIsCollapsed} />
        
        <main 
          className={`flex-1 transition-all duration-500 min-h-screen
            ${isCollapsed ? "md:ml-20" : "md:ml-64"} ml-0 p-6 pt-24 md:p-10`}
        >
          <Toaster toastStyle={{ backgroundColor: "#EFA80A" }} />
          {children}
        </main>
      </div>
    </div>
  );
}
