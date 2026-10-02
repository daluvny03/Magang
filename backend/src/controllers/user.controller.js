import {
  getUsers,
  getUserById
} from '../services/user.service.js';

export const getAll = async (
  req,
  res,
  next
) => {
  try {
    const result = await getUsers(
      req.validatedQuery
    );

    return res.status(200).json({
      success: true,
      message:
        'Users retrieved successfully',
      data: result.data,
      meta: result.meta
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (
  req,
  res,
  next
) => {
  try {
    const user = await getUserById(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        'User retrieved successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};