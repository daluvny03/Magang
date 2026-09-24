import { getHealthStatus } from '../services/cek.service.js';

export const getHealth = (req, res) => {
  const health = getHealthStatus();

  return res.status(200).json({
    status: 'success',
    message: 'Backend API is running',
    data: health,
    error: null
  });
};