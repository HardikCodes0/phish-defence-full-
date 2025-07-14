const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  console.log('🔒 Auth middleware called for:', req.method, req.path);
  console.log('🔒 Headers:', req.headers);
  
  const authHeader = req.headers.authorization;
  console.log('🔒 Auth header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No valid auth header found');
    return res.status(401).json({ message: 'No token, not authorized' });
  }

  const token = authHeader.split(' ')[1];
  console.log('🔒 Token extracted:', token ? `${token.substring(0, 20)}...` : 'null');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token verified, user:', decoded);
    req.user = decoded; // you can now access req.user in your routes
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = protect;
