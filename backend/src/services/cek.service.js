export const getHealthStatus = () => {
  return {
    service: 'cat-cpns-backend',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };
};