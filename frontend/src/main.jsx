import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import App from './App'
import './index.css'
import { useAuthStore } from './stores/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Cleanup data pribadi subscription, Profile, dan CAT saat identitas berubah.
// Pergantian session juga mencakup login ulang akun yang sama.
const unsubscribePrivateCache = useAuthStore.subscribe((state, previous) => {
  if (state.sessionId === previous.sessionId) return

  const filters = {
    predicate: (query) =>
      ['user-subscription', 'user-payment', 'user-profile', 'user-tryouts',
        'user-tryout-detail', 'attempt-questions', 'user-attempt-result', 'user'].includes(query.queryKey[0]),
  }
  void queryClient.cancelQueries(filters)
  queryClient.removeQueries(filters)
})

if (import.meta.hot) {
  import.meta.hot.dispose(unsubscribePrivateCache)
}

function SessionApp() {
  const sessionId = useAuthStore((state) => state.sessionId)
  return <App key={sessionId ?? 'anonymous'} />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionApp />
    </QueryClientProvider>
  </React.StrictMode>,
)
