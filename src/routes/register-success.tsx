import { createRoute, Link, useSearch } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Button } from '../components/ui/button';

interface SuccessSearch {
  name?: string;
  email?: string;
}

const RegisterSuccess = () => {
  const { name, email } = useSearch({ from: '/register/success' }) as SuccessSearch;

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">Registration Successful</h2>
      {name && (
        <p>
          <strong>Name:</strong> {name}
        </p>
      )}
      {email && (
        <p>
          <strong>Email:</strong> {email}
        </p>
      )}
      <p>Please check your email for a message to activate your account.</p>
      <p>
        Once activated, log in to start adding and following events, entities, series and more.
      </p>
      <Button asChild variant="link" className="w-full">
        <Link to="/login">Log In</Link>
      </Button>

    </div>
  );
};

export const RegisterSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register/success',
  component: RegisterSuccess,
});
