import React from 'react';
import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from './ui/button';
import { HiCalendar, HiOfficeBuilding, HiUser, HiMoon, HiSun, HiMenu, HiCollection, HiTag } from 'react-icons/hi';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const MenuContent: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
  });

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'light');
  };

  return (
    <div className={`flex flex-col items-center justify-center h-full p-4 ${className}`}>
      <h1 className=" xl:block text-2xl font-bold mb-2 text-center">Arcane City</h1>
      <div className="w-full border-b border-gray-200 dark:border-gray-700 my-4"></div>

      <nav className="flex flex-col gap-2 items-center">
        <Link to="/events" className="flex items-center gap-2 hover:underline">
          <HiCalendar />
          <span className=" xl:inline">Event Listings</span>
        </Link>
        <Link to="/calendar" className="flex items-center gap-2 hover:underline">
          <HiCalendar />
          <span className=" xl:inline">Event Calendar</span>
        </Link>
        <Link to="/entities" className="flex items-center gap-2 hover:underline">
          <HiOfficeBuilding />
          <span className=" xl:inline">Entity Listings</span>
        </Link>
        <Link to="/series" className="flex items-center gap-2 hover:underline">
          <HiCollection />
          <span className=" xl:inline">Series Listings</span>
        </Link>
        <Link to="/tags" className="flex items-center gap-2 hover:underline">
          <HiTag />
          <span className=" xl:inline">Tags</span>
        </Link>
      </nav>
      <div className="w-full border-b border-gray-200 dark:border-gray-700 my-4"></div>
      {user ? (
        <>
          <Button asChild className="w-full flex items-center justify-center gap-2 mb-2">
            <Link to="/account">
              <HiUser />
              <span className="lg:inline">My Account</span>
            </Link>
          </Button>
          <Button onClick={() => { authService.logout(); window.location.reload(); }} className="w-full mb-2">
            Log out
          </Button>
        </>
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
      <Button onClick={toggleTheme} className="mt-auto flex items-center gap-2">
        {theme === 'light' ? <HiMoon /> : <HiSun />}
        <span className="hidden xl:inline">
          Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
        </span>
      </Button>
    </div>
  );
};

const MenuBar: React.FC = () => {
  return (
    <>
      {/* Mobile Menu */}
      <div className="xl:hidden fixed top-0 left-0 w-full p-4 flex items-center bg-background border-b">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <HiMenu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <MenuContent />
          </SheetContent>
        </Sheet>
        <span className="ml-4 font-bold">Arcane City</span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden xl:block fixed top-0 left-0 h-full w-20 xl:w-64">
        <MenuContent />
      </div>
    </>
  );
};

export default MenuBar;
