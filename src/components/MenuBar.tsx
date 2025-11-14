import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMediaPlayerContext } from '../hooks/useMediaPlayerContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { HiCalendar, HiOfficeBuilding, HiUser, HiUserGroup, HiMoon, HiSun, HiMenu, HiCollection, HiTag, HiBookOpen, HiInformationCircle, HiQuestionMarkCircle, HiSearch, HiVolumeUp, HiVolumeOff, HiWifi, HiMap } from 'react-icons/hi';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const MenuContent: React.FC<{ className?: string; onNavigate?: () => void }> = ({ className = '', onNavigate }) => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const { mediaPlayersEnabled, toggleMediaPlayers } = useMediaPlayerContext();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
  });

  // Ensure the HTML element reflects the stored theme value
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Track whether user explicitly toggled
  const userSetRef = useRef(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    try { localStorage.setItem('themeSource', 'user'); } catch { /* ignore */ }
    userSetRef.current = true;
  };

  // Listen for system preference changes if user hasn't explicitly chosen
  useEffect(() => {
    const source = localStorage.getItem('themeSource');
    if (source === 'user') return;
    if (!window.matchMedia) return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (userSetRef.current || localStorage.getItem('themeSource') === 'user') return;
      setTheme(e.matches ? 'dark' : 'light');
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [setTheme]);

  // Close the mobile sheet when any link inside the menu is clicked
  const handleMenuClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!onNavigate) return;
    const target = e.target as HTMLElement | null;
    if (target && target.closest('a')) {
      onNavigate();
    }
  };

  return (
    <div className={`flex flex-col items-center h-full p-4 ${className}`} onClick={handleMenuClick}>
      <Link to="/" className="text-center mb-1">
        <h1 className=" xl:block text-2xl font-bold text-center hover:underline">Arcane City</h1>
        <p className=" xl:block text-xs text-gray-500 dark:text-gray-400 text-center">pittsburgh events guide</p>
      </Link>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = search.trim();
          if (q) {
            navigate({ to: '/search', search: { q } });
            setSearch('');
          }
        }}
        className="w-full mt-2 px-2 hidden xl:block"
      >
        <Input
          id="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          aria-label="Search events, venues, and artists"
          className="h-8 w-full bg-white dark:bg-black border-gray-300 dark:border-gray-600"
        />
      </form>
      <div className="w-full border-b border-gray-200 dark:border-gray-700 my-4"></div>

      <nav className="flex flex-col gap-2 items-start">
        {user && (
          <Link to="/radar" className="flex items-center gap-2 hover:underline">
            <HiWifi />
            <span className=" xl:inline">Your Radar</span>
          </Link>
        )}
        <Link to="/events" className="flex items-center gap-2 hover:underline">
          <HiCalendar />
          <span className=" xl:inline">Event Listings</span>
        </Link>
        <Link to="/event-grid" className="flex items-center gap-2 hover:underline text-sm ml-6 text-gray-600 dark:text-gray-300">
          <HiCalendar className="h-4 w-4" />
          <span className=" xl:inline">Event Grid</span>
        </Link>
        <Link to="/event-map" className="flex items-center gap-2 hover:underline text-sm ml-6 text-gray-600 dark:text-gray-300">
          <HiMap className="h-4 w-4" />
          <span className=" xl:inline">Event Map</span>
        </Link>
        <Link to="/calendar" className="flex items-center gap-2 hover:underline">
          <HiCalendar />
          <span className=" xl:inline">Event Calendar</span>
        </Link>
        {user && (
          <Link to="/calendar/your" className="flex items-center gap-2 hover:underline text-sm ml-6 text-gray-600 dark:text-gray-300">
            <HiCalendar className="h-4 w-4" />
            <span className=" xl:inline">Your Calendar</span>
          </Link>
        )}
        <Link to="/entities" className="flex items-center gap-2 hover:underline">
          <HiOfficeBuilding />
          <span className=" xl:inline">Entity Listings</span>
        </Link>
        {user && (
          <Link to="/entities/your" className="flex items-center gap-2 hover:underline text-sm ml-6 text-gray-600 dark:text-gray-300">
            <HiOfficeBuilding className="h-4 w-4" />
            <span className=" xl:inline">Your Entities</span>
          </Link>
        )}
        <Link to="/series" className="flex items-center gap-2 hover:underline">
          <HiCollection />
          <span className=" xl:inline">Series Listings</span>
        </Link>
        <Link to="/tags" className="flex items-center gap-2 hover:underline">
          <HiTag />
          <span className=" xl:inline">Tags</span>
        </Link>
        <Link to="/users" className="flex items-center gap-2 hover:underline">
          <HiUserGroup />
          <span className=" xl:inline">Users</span>
        </Link>
        <Link to="/search" className="flex items-center gap-2 hover:underline">
          <HiSearch />
          <span className=" xl:inline">Search</span>
        </Link>

        <div className="w-full border-b border-gray-200 dark:border-gray-700 my-4"></div>
        <Link to="/about" className="flex items-center gap-2 hover:underline">
          <HiInformationCircle />
          <span className=" xl:inline">About</span>
        </Link>
        <Link to="/blogs" className="flex items-center gap-2 hover:underline">
          <HiBookOpen />
          <span className=" xl:inline">Blogs</span>
        </Link>
        <Link to="/help" className="flex items-center gap-2 hover:underline">
          <HiQuestionMarkCircle />
          <span className=" xl:inline">Help</span>
        </Link>
        <Link to="/privacy" className="flex items-center gap-2 hover:underline">
          <HiInformationCircle />
          <span className=" xl:inline">Privacy</span>
        </Link>
      </nav>
      <div className="w-full border-b border-gray-200 dark:border-gray-700 my-4"></div>
      {user ? (
        <div className="w-full flex flex-row xl:flex-col gap-2 mb-2">
          <Button asChild className="flex items-center justify-center gap-2 flex-1 xl:w-full">
            <Link to="/account">
              <HiUser />
              <span className="lg:inline">My Account</span>
            </Link>
          </Button>
          <Button onClick={() => { authService.logout(); window.location.reload(); }} className="flex-1 xl:w-full">
            Log out
          </Button>
        </div>
      ) : (
        <>
          <Button asChild className="w-full flex items-center justify-center gap-2 mb-2">
            <Link to="/login">
              <HiUser />
              <span className="lg:inline">Login / Register</span>
            </Link>
          </Button>
        </>
      )}
      <div className="mt-auto w-full flex flex-row xl:flex-col items-center gap-2">
        <Button
          onClick={toggleTheme}
          data-testid="theme-toggle"
          className="flex items-center gap-2 flex-1 xl:w-full"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'light' ? <HiMoon aria-hidden="true" /> : <HiSun aria-hidden="true" />}
          <span className="hidden xl:inline">
            Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
          </span>
        </Button>
        <Button
          onClick={toggleMediaPlayers}
          data-testid="media-player-toggle"
          className="flex items-center gap-2 flex-1 xl:w-full"
          aria-label={mediaPlayersEnabled ? 'Disable media players' : 'Enable media players'}
          aria-pressed={mediaPlayersEnabled}
        >
          {mediaPlayersEnabled ? <HiVolumeUp aria-hidden="true" /> : <HiVolumeOff aria-hidden="true" />}
          <span className="hidden xl:inline">
            {mediaPlayersEnabled ? 'Disable' : 'Enable'} Media Players
          </span>
        </Button>
      </div>
    </div>
  );
};

const MenuBar: React.FC = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu */}
      <div className="xl:hidden fixed top-0 left-0 w-full p-4 flex items-center justify-between bg-background border-b z-50">
        <div className="flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                aria-expanded={open}
              >
                <HiMenu className="h-6 w-6" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0" aria-label="Main navigation">
              <MenuContent onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <Link to="/" className="ml-4">
            <span className="font-bold hover:underline">Arcane City</span>
            <p className="text-xs text-gray-500 dark:text-gray-400">pittsburgh events guide</p>
          </Link>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = search.trim();
            if (q) {
              navigate({ to: '/search', search: { q } });
              setSearch('');
            }
          }}
          className="px-2"
        >
          <Input
            id="mobile-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            aria-label="Search events, venues, and artists"
            className="h-8 w-40"
          />
        </form>
      </div>

      {/* Desktop Menu */}
      <div className="hidden xl:block fixed top-0 left-0 h-full w-20 xl:w-64">
        <MenuContent />
      </div>
    </>
  );
};

export default MenuBar;
