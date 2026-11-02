export function getPostLoginPath(role, fromPath) {
  const base = role === 'admin' ? '/admin' : '/user'

  const canReturn =
    typeof fromPath === 'string' &&
    (fromPath === base || fromPath.startsWith(`${base}/`))

  return canReturn ? fromPath : `${base}/dashboard`
}