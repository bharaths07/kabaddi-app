import React from "react";
import { NavLink } from "react-router-dom";
import { X, Zap, Trophy, Layout, BarChart2, Settings, TrendingUp, LogOut, Heart } from "lucide-react";
import { useGlobalState } from "@/app/AppProviders";

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useGlobalState();

  const handleLogout = () => {
    logout();
    onClose();
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-4 px-4 py-3 rounded-xl text-base font-semibold transition-all ${isActive
      ? "bg-red-50 text-red-600 shadow-sm"
      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 lg:hidden ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-[300px] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out lg:hidden ${isOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        <div className="flex flex-col h-full">

          {/* Header */}
          <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Zap className="text-red-500" size={20} fill="currentColor" />
              <span className="text-xl font-extrabold text-gray-900 font-display">menu</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100">
                <Zap size={24} fill="currentColor" />
                <span className="text-xs font-bold">Start Match</span>
              </button>
              <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <Trophy size={24} />
                <span className="text-xs font-bold">Tournament</span>
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              <NavLink to="/" className={navLinkClass} onClick={onClose}>
                <Layout size={20} />
                <span>Home</span>
              </NavLink>
              <NavLink to="/matches" className={navLinkClass} onClick={onClose}>
                <Zap size={20} />
                <span>Matches</span>
              </NavLink>
              <NavLink to="/tournaments" className={navLinkClass} onClick={onClose}>
                <Trophy size={20} />
                <span>Tournaments</span>
              </NavLink>
              <NavLink to="/leaderboard" className={navLinkClass} onClick={onClose}>
                <BarChart2 size={20} />
                <span>Leaderboard</span>
              </NavLink>
            </nav>

            <div className="pt-4 border-t border-gray-50">
              <h4 className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Account</h4>
              <nav className="space-y-1">
                <NavLink to="/profile/me" className={navLinkClass} onClick={onClose}>
                  <div className="w-5 h-5 rounded-full bg-gray-200 border border-gray-100 overflow-hidden">
                    <img src={currentUser?.avatarUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span>My Profile</span>
                </NavLink>
                <NavLink to="/settings" className={navLinkClass} onClick={onClose}>
                  <Settings size={20} />
                  <span>Settings</span>
                </NavLink>
                <NavLink to="/upgrade" className={navLinkClass} onClick={onClose}>
                  <TrendingUp size={20} className="text-blue-500" />
                  <span className="text-blue-500">Plan Upgrade</span>
                </NavLink>
              </nav>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-gray-500 font-bold hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
            <div className="mt-4 flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <span>made with</span>
                <Heart size={10} fill="#EF4444" className="text-red-500" />
                <span>by game legends</span>
              </div>
              <span className="text-[10px] text-gray-300">v1.1.0</span>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
