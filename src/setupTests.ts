import '@testing-library/jest-dom';
import { QueryClient } from '@tanstack/react-query';

// Mock your Vite env variables
Object.defineProperty(window, 'import.meta', {
  value: {
    env: {
      VITE_API_URL: 'http://test.api',
      VITE_API_USERNAME: 'test-user',
      VITE_API_PASSWORD: 'test-pass'
    }
  }
});

// Create a test QueryClient for React Query
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

// Create a basic document structure for tests
document.documentElement.innerHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta property="og:url" content="https://arcane.city">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Arcane City - Event Guide">
  <meta property="og:image" content="/apple-icon-180x180.png">
  <meta property="og:description" content="A calender of events, concerts, club nights, weekly and monthly events series, promoters, artists, producers, djs, venues and other entities.">
  <meta name="description" content="A calender of events, concerts, club nights, weekly and monthly events series, promoters, artists, producers, djs, venues and other entities.">
  <title>Arcane City - Event Guide</title>
  <link rel="icon" href="/apple-icon-180x180.png" type="image/x-icon">
  <link rel="manifest" href="/manifest.json">
  <link rel="apple-touch-icon" href="/apple-icon-180x180.png">
  <link rel="alternate" type="application/rss+xml" href="https://arcane.city" title="RSS Feed - Arcane City">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`