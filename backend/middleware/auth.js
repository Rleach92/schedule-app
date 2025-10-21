// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// --- Use variable from .env (loaded by server.js) ---
const JWT_SECRET = process.env.JWT_SECRET;
// -----------------------------------------------------

module.exports = function(req, res, next) {
  // 1. Get token from the request header
  const token = req.header('x-auth-token');

  // 2. Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // 3. Verify token
  try {
    // Verification happens here using the secret from .env
    const decoded = jwt.verify(token, JWT_SECRET);

    // 4. Add user from payload to the request object
    req.user = decoded.user;
    next(); // Move to the next function
  } catch (err) {
    // If JWT_SECRET doesn't match, or token is expired/invalid, you'll get this error
    console.error("Token verification failed:", err.message); // Log the specific error
    res.status(401).json({ msg: 'Token is not valid' });
  }
};