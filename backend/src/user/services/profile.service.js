import {
  findProfileByUserId
} from '../repositories/profile.repository.js';

import {
  AppError
} from '../../utils/app-error.js';

const mapProfile = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  isActive: row.is_active,
  emailVerifiedAt: row.email_verified_at,
  lastLoginAt: row.last_login_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const getProfileByUserId = async (userId) => {
  const profile = await findProfileByUserId(userId);

  if (!profile) {
    throw new AppError(
      'User profile not found',
      404,
      'USER_PROFILE_NOT_FOUND'
    );
  }

  return mapProfile(profile);
};