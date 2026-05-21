import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { BiHomeAlt, BiMoviePlay, BiListPlus, BiUserCircle } from "react-icons/bi";

export default function MobileBottomNav() {
  const auth = useSelector((state) => state.auth);

  const tabs = [
    {
      label: "Home",
      path: "/",
      icon: BiHomeAlt
    },
    {
      label: "Originals",
      path: "/originals",
      icon: BiMoviePlay
    },
    {
      label: "Watchlist",
      path: "/watchlist",
      icon: BiListPlus
    },
    {
      label: "Profile",
      path: auth?.user ? "/profiles" : "/login",
      icon: BiUserCircle
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-black/95 backdrop-blur-xl border-t border-zinc-900 pb-safe">
      <nav className="flex justify-around items-center px-2 py-3">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={idx}
              to={tab.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center w-full gap-1 transition-all
                ${isActive ? "text-amber-500 scale-110" : "text-zinc-500 hover:text-zinc-300"}
              `}
            >
              <Icon size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
