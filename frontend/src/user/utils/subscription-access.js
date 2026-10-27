
export const isSubscriptionRequiredError = (error) => {
  return (
    error?.response?.status === 403 &&
    error?.response?.data?.code ===
      'SUBSCRIPTION_REQUIRED'
  )
}
