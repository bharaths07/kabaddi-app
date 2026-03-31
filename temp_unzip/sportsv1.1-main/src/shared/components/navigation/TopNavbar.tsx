import React from "react";
import { NavLink, Link } from "react-router-dom";
import { Bell, Menu, Settings, Zap } from "lucide-react";
import { useGlobalState } from "@/app/AppProviders";

interface TopNavbarProps {
  onMenuClick: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuClick }) => {
  const { notifications } = useGlobalState();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-5 text-sm font-semibold transition-colors duration-200 ${isActive ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
    }`;

  const activeIndicatorClass = ({ isActive }: { isActive: boolean }) =>
    `absolute bottom-0 left-0 right-0 h-[2px] bg-red-500 transition-transform duration-300 ${isActive ? "scale-x-100" : "scale-x-0"
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

        {/* Left Section: Logo & Primary Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
              <Zap size={18} fill="currentColor" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-gray-900 font-display">
              game legends
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            <NavLink to="/" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  Home
                  <div className={activeIndicatorClass({ isActive })} />
                </>
              )}
            </NavLink>
            <NavLink to="/matches" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  Matches
                  <div className={activeIndicatorClass({ isActive })} />
                </>
              )}
            </NavLink>
            <NavLink to="/tournaments" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  Tournaments
                  <div className={activeIndicatorClass({ isActive })} />
                </>
              )}
            </NavLink>
            <NavLink to="/leaderboard" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  Leaderboard
                  <div className={activeIndicatorClass({ isActive })} />
                </>
              )}
            </NavLink>
          </nav>
        </div>

        {/* Right Section: Icons */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/notifications" className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white text-[10px] font-bold text-white flex items-center justify-center">
                {Math.min(9, notifications.length)}
              </span>
            )}
          </Link>

          <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors hidden sm:block">
            <Settings size={20} />
          </button>

          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};
