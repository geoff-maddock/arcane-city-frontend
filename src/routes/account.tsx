import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authService } from '../services/auth.service';

const Account: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate({ to: '/login' });
    }
  }, [navigate]);

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to load user data.</div>;
  if (!user) return null;

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-bold">Welcome, {user.username}</h2>
      <div>Email: {user.email}</div>
      {/* Personalized content could go here */}
    </div>
  );
};

export default Account;
