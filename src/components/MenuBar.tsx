import React from 'react';
import { Link } from '@tanstack/react-router';
import { authService } from '../services/auth.service';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from './ui/button';
import { HiCalendar, HiOfficeBuilding, HiUser, HiMoon, HiSun } from 'react-icons/hi';

const MenuBar: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'light');
  };

  return (
    <div className="fixed top-0 left-0 h-full w-20 lg:w-64 bg-gray-800 text-white flex flex-col p-4">
      <h1 className="hidden lg:block text-2xl font-bold mb-4">Arcane City</h1>
      <div className="block lg:hidden mb-4">
        <HiOfficeBuilding size={24} />
      </div>
      <nav className="flex flex-col gap-2">
        <Link to="/events" className="flex items-center gap-2 hover:underline">
          <HiCalendar />
          <span className="hidden lg:inline">Event Listings</span>
        </Link>
        <Link to="/entities" className="flex items-center gap-2 hover:underline">
          <HiOfficeBuilding />
          <span className="hidden lg:inline">Entity Listings</span>
        </Link>
        {authService.isAuthenticated() && (
          <Link to="/account" className="flex items-center gap-2 hover:underline">
            <HiUser />
            <span className="hidden lg:inline">My Account</span>
          </Link>
        )}
      </nav>
      <Button onClick={toggleTheme} className="mt-auto flex items-center gap-2">
        {theme === 'light' ? <HiMoon /> : <HiSun />}
        <span className="hidden lg:inline">
          Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
        </span>
      </Button>
    </div>
  );
};

export default MenuBar;
