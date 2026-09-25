export const getUserDashboard = (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'User dashboard access granted',
    data: {
      user: req.user
    }
  });
};