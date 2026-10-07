import {
  getProfileByUserId
} from '../services/profile.service.js';

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profile = await getProfileByUserId(userId);

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};