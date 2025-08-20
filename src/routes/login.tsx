import React, { useState } from 'react';
import { createRoute, useNavigate, Link } from '@tanstack/react-router';
import { rootRoute } from './root';
import { authService } from '../services/auth.service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.login({ username, password });
      navigate({ to: '/account' });
    } catch {
      setError('Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 bg-white dark:bg-black">
      <h2 className="text-xl font-bold">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full">Login</Button>
      </form>
      <Button asChild variant="link" className="w-full">
        <Link to="/register">Need an account? Register</Link>
      </Button>
      <Button asChild variant="link" className="w-full">
        <Link to="/password-recovery">Forgot your password? Recover it</Link>
      </Button>
    </div>
  );
};

export const LoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});
