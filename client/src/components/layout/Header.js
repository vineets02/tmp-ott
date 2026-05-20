import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AiOutlineMenu, AiOutlineClose, AiOutlineSearch } from "react-icons/ai";
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
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <img
              src="/Logo.png"
              alt="TMP"
              className="h-8 w-8 md:h-10 md:w-10 object-contain transition-transform group-hover:scale-110"
            />
            <div className="flex flex-col leading-none">
              <span className="text-sm md:text-xl font-black text-white tracking-tighter">
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
        <div className="flex items-center gap-2 md:gap-6 shrink-0">
          
          {/* Search */}
          <div className={`relative flex items-center transition-all duration-300 ${isSearchExpanded ? "w-44 sm:w-64" : "w-8 md:w-10"}`}>
            <input
              type="text"
              placeholder="Search Titles..."
              className={`w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-8 pr-3 text-xs md:text-sm text-white focus:outline-none focus:border-amber-500 transition-all ${
                isSearchExpanded ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
            <button 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="absolute left-0 h-8 w-8 md:h-10 md:w-10 flex items-center justify-center text-zinc-400 hover:text-amber-500 transition-colors"
            >
              <AiOutlineSearch size={18} />
            </button>
          </div>

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
