/**
 * Middleware factory to restrict endpoint access by User role(s)
 * Must be executed after the 'protect' middleware which attaches req.user
 * @param  {...string} roles - Permitted user roles ('patient', 'doctor', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User authentication required before checking roles.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
};

// Convenient role-specific aliases
const isPatient = authorize('patient');
const isDoctor = authorize('doctor');
const isAdmin = authorize('admin');

module.exports = {
  authorize,
  isPatient,
  isDoctor,
  isAdmin,
};
