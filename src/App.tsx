import { Analytics } from '@vercel/analytics/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import MenuBar from './components/MenuBar';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router}>
        <div className="flex">
          <MenuBar />
          <div className="flex-1">
            {/* Other components that need routing */}
          </div>
        </div>
        <ReactQueryDevtools initialIsOpen={false} />
        <Analytics />
      </RouterProvider>
    </QueryClientProvider>
  );
}

export default App;