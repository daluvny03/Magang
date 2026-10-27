import { findAdminDashboard } from '../repositories/admin-dashboard.repository.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const dashboard = await findAdminDashboard();
    return res.status(200).json({
      success: true,
      message: 'Admin dashboard retrieved successfully',
      data: { ...dashboard, user: req.user }
    });
  } catch (error) {
    next(error);
  }
};
