import React from 'react';
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from './root';

const Register: React.FC = () => {
  return (
    <div className="max-w-md mx-auto p-4">
      Registration page coming soon.
    </div>
  );
};

export const RegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});
