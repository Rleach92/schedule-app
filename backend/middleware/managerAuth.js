// backend/middleware/managerAuth.js
const auth = require('./auth'); // We'll re-use our existing auth middleware

// This is a "wrapper" middleware.
// It first checks if the user is logged in (using 'auth').
// Then, it checks if their role is 'manager'.
const managerAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ msg: 'Access denied: Managers only' });
    }
    next();
  });
};

module.exports = managerAuth;