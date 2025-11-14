import { createRoute, Link } from '@tanstack/react-router';
import { rootRoute } from './root';

const NotFound = () => (
  <div className="min-h-[calc(100vh-4rem)] xl:min-h-screen w-full bg-white dark:bg-black transition-colors">
    <div className="max-w-3xl mx-auto p-6 xl:p-8 space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">404 - Page Not Found</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">
        Sorry, the page you're looking for doesn't exist.
      </p>
      <div className="space-y-4">
        <p>
          The page you requested could not be found. This might be because:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li>The URL was typed incorrectly</li>
          <li>The page has been moved or deleted</li>
          <li>The link you followed is outdated</li>
        </ul>
      </div>
      <div className="pt-4">
        <Link 
          to="/" 
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  </div>
);

export const NotFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$',
  component: NotFound,
});
