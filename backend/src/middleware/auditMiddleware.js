const AuditLog = require('../models/AuditLog');

exports.auditLog = (action, resource) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = async function(data) {
      if (data.success !== false) {
        await AuditLog.create({
          userId: req.user?.id,
          action,
          resource,
          resourceId: req.params.id || data.data?.id,
          changes: req.body,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        });
      }

      originalJson.call(this, data);
    };

    next();
  };
};