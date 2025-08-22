import { Analytics } from '@vercel/analytics/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { router } from './router';

const queryClient = new QueryClient();
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleReCaptchaProvider reCaptchaKey={recaptchaSiteKey}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
        <Analytics />
      </GoogleReCaptchaProvider>
    </QueryClientProvider>
  );
}

export default App;