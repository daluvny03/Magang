import {
  registerUser,
  loginUser
} from '../services/auth.service.js';

export const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Authenticated user retrieved successfully',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    next(error);
  }
};