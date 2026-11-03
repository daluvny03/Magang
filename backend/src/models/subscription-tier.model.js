export const createSubscriptionTierModel = ({
  id,
  name,
  slug,
  description,
  price,
  durationDays,
  level,
  isActive,
  features = [],
  createdAt,
  updatedAt
}) => ({
  id,
  name,
  slug,
  description,
  price,
  durationDays,
  level,
  isActive,
  features,
  createdAt,
  updatedAt
});