import React from 'react';
import { Link } from '@tanstack/react-router';
import { authService } from '../services/auth.service';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from './ui/button';
import { HiCalendar, HiOfficeBuilding, HiUser, HiMoon, HiSun, HiMenu } from 'react-icons/hi';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

const MenuContent: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'light');
  };

  return (
    <div className={`flex flex-col items-center justify-center h-full p-4 ${className}`}>
      <h1 className="hidden xl:block text-2xl font-bold mb-4 text-center">Arcane City</h1>
      <div className="block xl:hidden mb-4">
        <HiOfficeBuilding size={24} />
      </div>
      <nav className="flex flex-col gap-2 items-center">
        <Link to="/events" className="flex items-center gap-2 hover:underline">
          <HiCalendar />
          <span className="hidden xl:inline">Event Listings</span>
        </Link>
        <Link to="/entities" className="flex items-center gap-2 hover:underline">
          <HiOfficeBuilding />
          <span className="hidden xl:inline">Entity Listings</span>
        </Link>
        {authService.isAuthenticated() && (
          <Link to="/account" className="flex items-center gap-2 hover:underline">
            <HiUser />
            <span className="lg:inline">My Account</span>
          </Link>
        )}
      </nav>
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
      <div className="md:hidden fixed top-0 left-0 w-full p-4 flex items-center bg-background border-b">
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
      <div className="hidden md:block fixed top-0 left-0 h-full w-20 xl:w-64">
        <MenuContent />
      </div>
    </>
  );
};

export default MenuBar;