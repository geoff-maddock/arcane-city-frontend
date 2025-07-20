import React, { useState } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './root';
import { userService } from '../services/user.service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    try {
      await userService.createUser({ name, email, password });
      navigate({ to: '/login' });
    } catch {
      setError('Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Button type="submit" className="w-full">Register</Button>
      </form>
    </div>
  );
};

export const RegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});
