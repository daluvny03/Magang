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

// Cleanup terbatas pada data pribadi yang dipakai alur subscription/Profile.
// Struktur token dan perilaku login tetap ditangani Auth Store existing.
const unsubscribePrivateCache = useAuthStore.subscribe((state, previous) => {
  if (state.user?.id === previous.user?.id) return

  const filters = {
    predicate: (query) =>
      ['user-subscription', 'user-payment', 'user-profile'].includes(query.queryKey[0]) &&
      query.queryKey[1] !== state.user?.id,
  }
  void queryClient.cancelQueries(filters)
  queryClient.removeQueries(filters)
})

if (import.meta.hot) {
  import.meta.hot.dispose(unsubscribePrivateCache)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
