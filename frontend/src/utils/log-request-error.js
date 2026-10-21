export const logRequestError = (operation, error) => {
  if (error?.code === 'ERR_CANCELED') return
  const status = error?.response?.status
  const requestId = error?.response?.headers?.['x-request-id']
  console.error(operation, {
    status: Number.isInteger(status) ? status : null,
    requestId: typeof requestId === 'string' && /^[0-9a-f-]{36}$/i.test(requestId)
      ? requestId : null,
  })
}
