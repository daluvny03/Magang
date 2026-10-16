import {
  findUsers,
  findUserById
} from '../repositories/user.repository.js';

import {
  AppError
} from '../utils/app-error.js';

export const getUsers = async ({
  page,
  limit,
  search
}) => {
  // User Management monitors subscriptions for user accounts only.
  const result = await findUsers({
    page,
    limit,
    search,
    role: 'user'
  });

  return {
    data: result.rows,
    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(
        result.total / result.limit
      )
    }
  };
};

export const getUserById = async (
  id
) => {
  const user = await findUserById(id);

  if (!user) {
    throw new AppError(
      'User not found',
      404,
      'USER_NOT_FOUND'
    );
  }

  return user;
};
