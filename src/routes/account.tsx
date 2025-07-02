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
      <h2 className="text-xl font-bold">Account</h2>
      <div className="grid grid-cols-[100px_1fr] gap-2">
        <span className="font-semibold text-gray-600">Name:</span>
        <span>{user.name}</span>

        <span className="font-semibold text-gray-600">Email:</span>
        <span>{user.email}</span>

        <span className="font-semibold text-gray-600">Status:</span>
        <span>{user.status.name}</span>
      </div>

    </div>
  );
};

export default Account;
