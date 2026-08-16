import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTenant } from '@/context/TenantContext';
import { Button } from '@/components/atoms/Button';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { GlobalSearchModal } from '@/components/search/GlobalSearchModal';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Search, Trophy, LogOut, User as UserIcon } from 'lucide-react';

/**
 * Organism AppNavbar Component
 * Top navigation bar featuring brand identity, menu links, quick search shortcut,
 * notification center, theme switch, and user profile management.
 */
export const AppNavbar: React.FC = () => {
  const { user, clearAuth, isAdmin } = useAuthStore();
  const { brand } = useTenant();
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Keyboard Shortcut: Ctrl+K or Cmd+K to open global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-emerald-600 dark:text-emerald-400 tracking-tight">
              {brand?.logoUrl && (
                <img src={brand.logoUrl} alt="Logo" className="h-6 w-auto object-contain" />
              )}
              <span>{brand?.name || 'LMS Platform'}</span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link to="/" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Modul Saya</Link>
              <Link to="/certificates" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Sertifikat</Link>
              <Link to="/leaderboard" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-amber-500" /> Leaderboard
              </Link>
              <Link to="/study-rooms" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Study Rooms</Link>
              <Link to="/history" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Riwayat</Link>
              <Link to="/verify" className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Cek Sertifikat</Link>
              {isAdmin() && (
                <Link to="/admin" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">CMS Admin</Link>
              )}
            </nav>
          </div>

          {/* Action Center (Search, Theme, Notifications, Profile) */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="h-8 gap-2 text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hidden sm:flex"
              leftIcon={<Search className="h-3.5 w-3.5" />}
            >
              <span>Cari...</span>
              <kbd className="pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-slate-100 dark:bg-slate-800 px-1 font-mono text-[10px] font-medium text-slate-500">
                ⌘K
              </kbd>
            </Button>

            <ThemeToggle />
            <NotificationBell />

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                    {user.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden lg:inline">{user.full_name}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAuth}
                  title="Keluar"
                  className="p-1.5 h-8 text-slate-400 hover:text-rose-500"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="primary" size="sm">Masuk</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
};
