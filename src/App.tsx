import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import { MediaPlayerProvider } from './context/MediaPlayerContext'
import { ErrorBoundary } from './components/ErrorBoundary'

const queryClient = new QueryClient()

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <MediaPlayerProvider>
          <RouterProvider router={router} />
          <ReactQueryDevtools initialIsOpen={false} />
        </MediaPlayerProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App