import {
  findUsers,
  findUserById,
  findUserSubscriptionDistribution
} from '../repositories/user.repository.js';

import {
  AppError
} from '../utils/app-error.js';

export const getUsers = async ({
  page,
  limit,
  search,
  tierId,
  startDate,
  endDate
}) => {
  const [result, subscriptionDistribution] = await Promise.all([
    findUsers({
      page,
      limit,
      search,
      role: 'user',
      tierId,
      startDate,
      endDate
    }),

    findUserSubscriptionDistribution({
      startDate,
      endDate
    })
  ]);

  return {
    data: result.rows,

    meta: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(
        result.total / result.limit
      )
    },

    subscriptionDistribution
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
export const getUserSubscriptionDistribution = async ({
  startDate,
  endDate
}) => {
  return findUserSubscriptionDistribution({
    startDate,
    endDate
  });
};