const { hasPermission, canAccessResource } = require('../config/permissions');
const AuditLog = require('../models/AuditLog');

exports.authorize = (resource, action) => {
  return async (req, res, next) => {
    const userRole = req.user.role;
    
    if (!hasPermission(userRole, resource, action)) {
      await AuditLog.create({
        userId: req.user.id,
        action: 'ACCESS_DENIED',
        resource,
        resourceId: req.params.id,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${userRole}' cannot '${action}' on '${resource}'`
      });
    }

    next();
  };
};

exports.authorizeOwnership = (resource) => {
  return async (req, res, next) => {
    const userRole = req.user.role;
    const userId = req.user.id;
    const resourceOwnerId = req.params.id || req.body.userId;

    if (userRole === 'admin') {
      return next();
    }

    if (!canAccessResource(userRole, resource, 'read:own', userId, resourceOwnerId)) {
      await AuditLog.create({
        userId: req.user.id,
        action: 'UNAUTHORIZED_ACCESS',
        resource,
        resourceId: resourceOwnerId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      return res.status(403).json({
        success: false,
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};