export const getAdminDashboard = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin dashboard access granted',
    data: {
      user: req.user
    }
  });
};