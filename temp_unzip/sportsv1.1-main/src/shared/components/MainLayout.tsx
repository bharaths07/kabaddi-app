import React, { useState } from "react";
import { TopNavbar } from "./navigation/TopNavbar";
import { SidebarDrawer } from "./navigation/SidebarDrawer";
import { RightSidebar } from "./navigation/RightSidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Sticky Top Navbar */}
      <TopNavbar onMenuClick={() => setIsDrawerOpen(true)} />

      {/* Mobile Drawer */}
      <SidebarDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      <div className="flex-1 flex w-full max-w-[1440px] mx-auto relative">
        {/* Main Content Area */}
        <main className="flex-1 min-w-0 w-full lg:max-w-[calc(1440px-280px)]">
          <div className="p-4 md:p-6 lg:p-8 animate-fade-in">
            <div className="max-w-[900px]">
              {children}
            </div>
          </div>
        </main>

        {/* Persistent Right Sidebar (Desktop Only) */}
        <RightSidebar />
      </div>
    </div>
  );
};
