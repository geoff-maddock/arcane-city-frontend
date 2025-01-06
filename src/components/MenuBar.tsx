import React from 'react';
import { Link } from '@tanstack/react-router';
import { authService } from '../services/auth.service';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from './ui/button';

const MenuBar: React.FC = () => {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'light');
  };

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-white flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-4">Arcane City</h1>
      <nav className="flex flex-col gap-2">
        <Link to="/events" className="hover:underline">Event Index</Link>
        <Link to="/entities" className="hover:underline">Entity Index</Link>
        {authService.isAuthenticated() && (
          <Link to="/account" className="hover:underline">My Account</Link>
        )}
      </nav>
      <Button onClick={toggleTheme} className="mt-auto">
        Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
      </Button>
    </div>
  );
};

export default MenuBar;
