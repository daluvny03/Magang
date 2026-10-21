import App from './App'
import { useAuthStore } from './stores/authStore'

export default function SessionApp() {
  const sessionId = useAuthStore((state) => state.sessionId)
  return <App key={sessionId ?? 'anonymous'} />
}
