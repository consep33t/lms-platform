import React from 'react';
import { AppNavbar } from '@/components/organisms/AppNavbar';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';

export interface AppLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
}

/**
 * Template AppLayout Component
 * Master template wrapping the application in global navbar, offline sync monitor,
 * and responsive content container.
 */
export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showNavbar = true,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Application Navbar */}
      {showNavbar && <AppNavbar />}

      {/* Main Page Body */}
      <main className="flex-1 w-full container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Global PWA Offline Connectivity Bar */}
      <OfflineIndicator />
    </div>
  );
};
