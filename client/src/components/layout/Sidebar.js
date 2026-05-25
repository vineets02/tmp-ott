import React, { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { 
  BiGridAlt, 
  BiMoviePlay, 
  BiCategory, 
  BiReceipt, 
  BiPulse,
  BiGroup,
  BiHome,
  BiCoinStack,
  BiChevronLeft,
  BiChevronRight,
  BiLogOut,
  BiUniversalAccess,
  BiShieldQuarter,
  BiMenu,
  BiMegaphone
} from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/authSlice";

export default function Sidebar({ onCollapse }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dispatch = useDispatch();
  const location = useLocation();
  const auth = useSelector((state) => state.auth);

  // Sync collapse state to parent
  useEffect(() => {
    if (onCollapse) onCollapse(isCollapsed);
  }, [isCollapsed, onCollapse]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const menuItems = [
    { title: "Dashboard", icon: BiGridAlt, path: "/dashboard/admin" },
    { title: "Movies", icon: BiMoviePlay, path: "/dashboard/admin/movies", permission: "manage_content" },
    { title: "Genres", icon: BiCategory, path: "/dashboard/admin/genre", permission: "manage_content" },
    { title: "Content Types", icon: BiUniversalAccess, path: "/dashboard/admin/contenttype", permission: "manage_content" },
    { title: "Orders", icon: BiReceipt, path: "/dashboard/admin/allorders", permission: "manage_finance" },
    { title: "Users", icon: BiGroup, path: "/dashboard/admin/users", permission: "manage_users" },
    { title: "Homepage", icon: BiHome, path: "/dashboard/admin/homepage", permission: "manage_settings" },
    { title: "Subscription", icon: BiCoinStack, path: "/dashboard/admin/subscription-manager", permission: "manage_finance" },
    { title: "Marketing Planner", icon: BiMegaphone, path: "/dashboard/admin/marketing", permission: "manage_content" },
    { title: "Staff & Logs", icon: BiShieldQuarter, path: "/dashboard/admin/staff", permission: "manage_users" },
    { title: "Analytics", icon: BiPulse, path: "/dashboard/admin/analytics", permission: "view_finance" },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    // If no permission specified, it's public for all admins
    if (!item.permission) return true;
    
    // If Super Admin (Legacy role 1)
    if (auth?.user?.role === 1) return true;
    
    // Check dynamic permissions
    return auth?.user?.dynamicRole?.permissions?.includes(item.permission);
  });


  return (
    <>
      {/* Mobile Hamburger Toggle */}
      <button 
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-6 left-4 z-[110] p-3 rounded-2xl bg-amber-500 text-black shadow-xl md:hidden hover:scale-110 transition-all active:scale-95"
      >
        <BiMenu size={24} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[120] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={`fixed left-0 top-0 h-full bg-zinc-950 border-r border-zinc-900 transition-all duration-500 z-[130] flex flex-col
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isCollapsed ? "md:w-20" : "md:w-64"} w-64`}
      >
        {/* Sidebar Header */}
        <div className="p-6 mb-8 flex items-center justify-between">
          {(!isCollapsed || isMobileOpen) && (
            <Link to="/" className="flex items-center gap-3">
              <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center font-black text-black">T</div>
              <span className="text-white font-black tracking-tighter text-lg uppercase">TMP <span className="text-zinc-600">Admin</span></span>
            </Link>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white transition-colors ml-auto"
          >
            {isCollapsed ? <BiChevronRight size={20} /> : <BiChevronLeft size={20} />}
          </button>
          
          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white"
          >
            <BiChevronLeft size={24} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive 
                  ? "bg-amber-500 text-black font-black shadow-[0_0_20px_rgba(245,165,9,0.3)]" 
                  : "text-zinc-500 hover:bg-zinc-900 hover:text-white"}
              `}
            >
              <item.icon size={24} className={`${isCollapsed && !isMobileOpen ? "md:mx-auto" : ""}`} />
              {(!isCollapsed || isMobileOpen) && <span className="text-sm tracking-tight">{item.title}</span>}
              
              {isCollapsed && !isMobileOpen && (
                <div className="fixed left-24 bg-zinc-900 text-white text-xs font-bold px-3 py-2 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity border border-zinc-800">
                  {item.title}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto border-t border-zinc-900">
          <button 
            onClick={() => dispatch(logout())}
            className={`flex items-center gap-4 px-4 py-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-all w-full
              ${isCollapsed && !isMobileOpen ? "md:justify-center" : ""}`}
          >
            <BiLogOut size={24} />
            {(!isCollapsed || isMobileOpen) && <span className="text-sm font-black uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
