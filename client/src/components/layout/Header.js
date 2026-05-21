import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AiOutlineMenu, AiOutlineClose, AiOutlineSearch, AiOutlineBell } from "react-icons/ai";
import { BsFillBagFill } from "react-icons/bs";
import { useSelector, useDispatch } from "react-redux";
import { logout as logoutAction } from "../../redux/slices/authSlice";
import axios from "axios";
import config from "../../config";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/originals", label: "Originals" },
  { to: "/categories", label: "Genres" },
  { to: "/branded-content", label: "Exclusive" },
  { to: "/contact", label: "Contact" },
];

const getAvatarUrl = (avatar, name = "") => {
  if (!avatar || avatar === "/netflix_icon.jpg" || avatar.includes("netflix_icon.jpg") || avatar.includes("wiki") || avatar.includes("pinimg")) {
    const colors = ["#E50914", "#E87511", "#F5A623", "#46D369", "#2B90EF", "#7B1FA2", "#E91E63", "#00BCD4"];
    let hash = 0;
    const cleanName = name || "User";
    for (let i = 0; i < cleanName.length; i++) {
      hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100"><rect width="100" height="100" rx="16" fill="${color}"/><circle cx="33" cy="40" r="7" fill="white"/><circle cx="67" cy="40" r="7" fill="white"/><path d="M30 62 Q50 78 70 62" stroke="white" stroke-width="7" stroke-linecap="round" fill="none"/></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
  }
  return avatar;
};

export default function Header() {
  const auth = useSelector((state) => state.auth);

  const watchlist = useSelector((state) => state.watchlist);
  const rent = useSelector((state) => state.rent);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [settings, setSettings] = useState({ paywallEnabled: true });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);

  useEffect(() => {
    if (auth?.token) {
      fetchNotifications();
    }
  }, [auth?.token]);

  const fetchNotifications = async () => {
    try {
      const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/notifications/user`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.log("Failed to fetch notifications");
    }
  };

  const handleMarkAsRead = async (notificationId = null) => {
    try {
      await axios.put(`${config.API_BASE_URL}/api/v1/notifications/mark-read`, { notificationId }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.log(error);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.readBy.includes(auth.user._id)) {
      handleMarkAsRead(n._id);
    }
    if (n.link) {
      navigate(n.link);
    }
    setNotificationDropdownOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get(`${config.API_BASE_URL}/api/v1/settings/get-settings`);
        if (data?.settings) setSettings(data.settings);
      } catch (err) {
        
      }
    };
    window.addEventListener("scroll", handleScroll);
    fetchSettings();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search/${searchQuery}`);
      setIsSearchExpanded(false);
      setSearchQuery("");
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    navigate("/login");
  };

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-[100] transition-all duration-500 px-3 py-3 md:px-12 md:py-4 ${
        isScrolled ? "bg-black/95 backdrop-blur-xl border-b border-zinc-800 shadow-2xl" : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-6 md:gap-12 min-w-0">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <img
              src="/Logo.png"
              alt="TMP"
              className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 object-contain transition-transform group-hover:scale-110"
            />
            <div className="flex flex-col leading-none">
              <span className="text-xs sm:text-sm md:text-xl font-black text-white tracking-tighter">
                TORTOISE <span className="text-amber-500">MOTION</span>
              </span>
              <span className="hidden sm:block text-[8px] md:text-[10px] font-bold text-zinc-500 tracking-[0.3em] uppercase">Pictures</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `text-sm font-bold uppercase tracking-widest transition-all hover:text-amber-500 ${
                    isActive ? "text-amber-500" : "text-zinc-400"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-6 shrink-0">
          
          {/* Desktop Search */}
          <div className={`hidden md:flex relative items-center transition-all duration-300 ${isSearchExpanded ? "w-64" : "w-10"}`}>
            <input
              type="text"
              placeholder="Search Titles..."
              className={`w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-8 pr-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-all ${
                isSearchExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <button 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="absolute left-0 h-10 w-10 flex items-center justify-center text-zinc-400 hover:text-amber-500 transition-colors"
            >
              <AiOutlineSearch size={18} />
            </button>
          </div>

          {/* Mobile Search Button */}
          <button 
            onClick={() => setIsSearchExpanded(true)}
            className="md:hidden p-1.5 text-zinc-400 hover:text-amber-500 transition-colors"
          >
            <AiOutlineSearch size={18} />
          </button>

          {/* Notifications */}
          {auth?.user && (
            <div className="relative group/notif">
              <button 
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="relative p-1.5 sm:p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <AiOutlineBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-2 h-2.5 w-2.5 bg-red-500 rounded-full border border-black animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                )}
              </button>

              <div className={`fixed top-16 left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-3 sm:w-80 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl transition-all ${notificationDropdownOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-2"} z-[150]`}>
                <div className="sticky top-0 bg-zinc-900/95 backdrop-blur z-10 border-b border-zinc-800 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-white font-black uppercase tracking-widest text-xs">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={() => handleMarkAsRead()} className="text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest">Mark All Read</button>
                  )}
                </div>
                <div className="flex flex-col">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-zinc-500 text-xs italic font-semibold">No notifications yet</div>
                  ) : (
                    notifications.map((n) => {
                      const isUnread = !n.readBy.includes(auth.user._id);
                      return (
                        <button 
                          key={n._id}
                          onClick={() => handleNotificationClick(n)}
                          className={`flex flex-col gap-1 text-left px-4 py-4 border-b border-zinc-800/50 hover:bg-zinc-800 transition-colors ${isUnread ? "bg-amber-500/5" : ""}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`text-sm font-black tracking-tight leading-tight ${isUnread ? "text-amber-500" : "text-zinc-200"}`}>{n.title}</span>
                            {isUnread && <div className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0"></div>}
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{n.message}</p>
                          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-1">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Watchlist Count */}
          <Link to="/watchlist" className="relative group text-zinc-400 hover:text-white transition-colors">
            <span className="text-xs md:text-sm font-black uppercase tracking-widest hidden sm:block">My List</span>
            <BsFillBagFill size={18} className="sm:hidden"/>
            <span className="absolute -top-2 -right-3 h-4 min-w-[16px] flex items-center justify-center bg-amber-500 text-black text-[9px] font-black rounded-full px-0.5 shadow-lg ring-2 ring-black">
              {watchlist?.length || 0}
            </span>
          </Link>

          {/* Profile Dropdown */}
          {!auth?.user ? (
            <button
              onClick={() => navigate("/login")}
              className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-1.5 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-black transition-all shadow-xl hover:scale-105"
            >
              LOGIN
            </button>
          ) : (
            <div className="relative group/profile">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2"
              >
                <img
                  src={getAvatarUrl(auth?.activeProfile?.avatar, auth?.activeProfile?.name)}
                  alt="Avatar"
                  className="h-8 w-8 md:h-10 md:w-10 rounded-xl object-cover border-2 border-transparent group-hover/profile:border-amber-500 transition-all"
                />
              </button>

              <div className="absolute right-0 mt-3 w-56 md:w-64 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all translate-y-2 group-hover/profile:translate-y-0 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800 bg-zinc-950/50 rounded-xl mb-2">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Watching as</p>
                  <p className="text-amber-500 font-black truncate">{auth?.activeProfile?.name || auth?.user?.name}</p>
                </div>
                
                <Link to="/profiles" className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl transition-all">
                  Switch Profiles
                </Link>
                <Link to={`/dashboard/${auth?.user?.role === 1 ? "admin" : "user"}`} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl transition-all">
                  Dashboard Settings
                </Link>
                
                {auth.user.role !== 1 && !auth.user.subscription && settings.paywallEnabled && (
                  <button 
                    onClick={() => navigate("/subscribe")}
                    className="w-full mt-2 bg-amber-500 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 transition-all"
                  >
                    Go Premium
                  </button>
                )}

                <div className="h-px bg-zinc-800 my-2" />
                <button 
                  onClick={logout}
                  className="w-full text-left px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  Sign Out of TMP
                </button>
              </div>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white p-1"
          >
            {mobileMenuOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchExpanded && (
        <div className="md:hidden absolute inset-0 bg-zinc-950 z-[200] flex items-center px-4 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <AiOutlineSearch size={20} className="text-zinc-400" />
          <input
            type="text"
            autoFocus
            placeholder="Search movies, shows..."
            className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-zinc-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
          <button onClick={() => setIsSearchExpanded(false)} className="p-2 text-zinc-400 hover:text-white">
            <AiOutlineClose size={20} />
          </button>
        </div>
      )}


      {/* Mobile Slide-out Menu */}
      <div className={`fixed inset-0 z-[200] bg-black transition-transform duration-500 lg:hidden ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-12">
            <img src="/Logo.png" className="h-12 w-12" alt="" />
            <button onClick={() => setMobileMenuOpen(false)} className="text-white">
              <AiOutlineClose size={32} />
            </button>
          </div>
          <nav className="flex flex-col gap-6 text-2xl font-black italic uppercase tracking-tighter">
            {navItems.map((n) => (
              <Link 
                key={n.to} 
                to={n.to} 
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-amber-500 transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-8 border-t border-zinc-800">
            {auth?.user ? (
              <button onClick={logout} className="text-red-500 font-black uppercase tracking-widest">Sign Out</button>
            ) : (
              <button onClick={() => navigate("/login")} className="text-amber-500 font-black uppercase tracking-widest">Login to Account</button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
