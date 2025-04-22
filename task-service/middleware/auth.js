const axios = require('axios');

// Middleware to validate JWT by checking with auth service
module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Validate token with auth service
    const response = await axios.post(`${process.env.AUTH_SERVICE_URL}/api/auth/validate`, { token });
    
    // If token is valid, add user ID to request
    if (response.data && response.data.valid) {
      req.userId = response.data.userId;
      next();
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};