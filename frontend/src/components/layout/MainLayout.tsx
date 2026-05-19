'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import TopNavbar from './TopNavbar';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import MobileBottomNav from './MobileBottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine if we should hide the right sidebar (e.g. on admin pages)
  const isAdminPage = pathname?.startsWith('/admin');

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar overlay is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // TODO: After login, show challenge popup (1.5s delay) and admin broadcast popup (3s delay)
  // These will be separate components (e.g. <ChallengePopup />, <BroadcastPopup />)

  return (
    <>
      {/* Top Navigation Bar */}
      <TopNavbar onMenuClick={handleToggleSidebar} />

      {/* Dark overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="overlay"
          onClick={handleCloseSidebar}
        />
      )}

      {/* 3-Column Layout Body */}
      <div className="ppw-body" id="ppwBody">
        {/* Left Sidebar */}
        <LeftSidebar open={sidebarOpen} onClose={handleCloseSidebar} />

        {/* Main Content Area */}
        <main className="ppw-main" id="mainContent">
          {children}
        </main>

        {/* Right Sidebar — hidden on admin pages */}
        {!isAdminPage && <RightSidebar />}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </>
  );
}
