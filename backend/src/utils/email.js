// Match PostgreSQL normalize_user_email: ECMAScript trim whitespace + lowercase.
// Do not apply provider-specific dot or plus-address transformations.
export const normalizeEmail = (email) => email.trim().toLowerCase();

export const isUserEmailConflict = (error) => error?.code === '23505' &&
  ['users_email_key', 'users_email_normalized_key'].includes(error.constraint);
