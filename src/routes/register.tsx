import React, { useState } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { AxiosError } from 'axios';
import { rootRoute } from './root';
import { userService } from '../services/user.service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { formatApiError } from '../lib/utils';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});

  const validate = (): FieldErrors => {
    const validationErrors: FieldErrors = {};
    if (name.length < 6 || name.length > 60) {
      validationErrors.name = 'Name must be between 6 and 60 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      email.length < 6 ||
      email.length > 60 ||
      !emailRegex.test(email)
    ) {
      validationErrors.email = 'Enter a valid email address';
    }
    if (password.length < 8 || password.length > 60) {
      validationErrors.password = 'Password must be between 8 and 60 characters';
    }
    if (password !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }
    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    try {
      await userService.createUser({ name, email, password });
      navigate({ to: '/register/success', search: { name, email } });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; errors?: FieldErrors }>;
      if (axiosErr.response && axiosErr.response.status >= 400 && axiosErr.response.status < 500) {
        const serverErrors = axiosErr.response.data?.errors;
        if (serverErrors) {
          setErrors(serverErrors);
        } else {
          setErrors({ general: axiosErr.response.data?.message || formatApiError(err) });
        }
        return;
      }
      setErrors({ general: formatApiError(err) });
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm Password</Label>
          <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {errors.confirmPassword && <div className="text-red-500 text-sm">{errors.confirmPassword}</div>}
        </div>
        {errors.general && <div className="text-red-500 text-sm">{errors.general}</div>}
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
