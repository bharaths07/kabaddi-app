import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Zap, Trophy, Layout, BarChart2, Award, Settings, HelpCircle, TrendingUp, LogOut } from "lucide-react";

import { useGlobalState } from "@/app/AppProviders";

export const RightSidebar: React.FC = () => {
    const { currentUser, logout } = useGlobalState();

    const user = {
        name: currentUser?.name || "Guest User",
        handle: currentUser?.username || currentUser?.id?.slice(0, 8) || "guest",
        avatar: currentUser?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name || 'Guest'}`,
    };

    const handleLogout = () => {
        logout();
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
            ? "bg-gray-100 text-gray-900 shadow-sm"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        }`;

    const comingSoonBadge = (
        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 border border-gray-200">
            SOON
        </span>
    );

    return (
        <aside className="w-[280px] hidden lg:block sticky top-16 h-[calc(100vh-64px)] overflow-y-auto bg-white border-l border-gray-100 p-6">
            <div className="flex flex-col gap-8">

                {/* Profile Card */}
                <div className="flex flex-col items-center text-center gap-4 py-2">
                    <div className="relative group">
                        <div className="w-[124px] h-[124px] rounded-full p-1 bg-gradient-to-br from-red-500 to-blue-600 transition-transform group-hover:rotate-12">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full rounded-full bg-white border-4 border-white object-cover"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
                        <span className="text-sm text-gray-500 italic">@{user.handle}</span>
                        <Link to="/profile" className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors mt-1">
                            View Full Profile
                        </Link>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-col gap-3">
                    <button className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        <Zap size={16} fill="white" />
                        Start a Match
                    </button>
                    <button className="w-full py-3 px-4 rounded-xl border-2 border-primary-blue text-primary-blue font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                        <Trophy size={16} />
                        Start Tournament
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col gap-1">
                    <NavLink to="/feed" className={navLinkClass}>
                        <Layout size={18} />
                        <span>Feed & News</span>
                    </NavLink>
                    <NavLink to="/my-game" className={navLinkClass}>
                        <Zap size={18} />
                        <span>My Game</span>
                    </NavLink>
                    <NavLink to="/leaderboard" className={navLinkClass}>
                        <BarChart2 size={18} />
                        <span>Leaderboard</span>
                    </NavLink>
                    <NavLink to="/awards" className={navLinkClass}>
                        <Award size={18} />
                        <span>Game Legends Award</span>
                    </NavLink>
                </div>

                {/* Settings Section */}
                <div className="flex flex-col gap-1 pt-4 border-t border-gray-50">
                    <NavLink to="/settings" className={navLinkClass}>
                        <Settings size={18} />
                        <span>Settings</span>
                    </NavLink>
                    <NavLink to="/support" className={navLinkClass}>
                        <HelpCircle size={18} />
                        <span>Help & Support</span>
                    </NavLink>
                    <NavLink to="/upgrade" className={navLinkClass}>
                        <TrendingUp size={18} className="text-primary-blue" />
                        <span className="text-primary-blue">Plan Upgrade</span>
                    </NavLink>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-50 hover:text-red-500 transition-all w-full text-left"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>

                {/* Coming Soon Features */}
                <div className="flex flex-col gap-1 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300">
                        <Layout size={18} />
                        <span>Highlights</span>
                        {comingSoonBadge}
                    </div>
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300">
                        <Award size={18} />
                        <span>Achievements</span>
                        {comingSoonBadge}
                    </div>
                </div>

            </div>
        </aside>
    );
};
