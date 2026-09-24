import { useHealth } from '../../hooks/useHealth'

function HealthPage() {
  const { data, isLoading, isError, error } = useHealth()

  if (isLoading) {
    return <div>Checking backend...</div>
  }

  if (isError) {
    return (
      <div>
        Backend connection failed:
        {error.message}
      </div>
    )
  }

  return (
    <div>
      <h1>Backend Connection</h1>

      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

export default HealthPage