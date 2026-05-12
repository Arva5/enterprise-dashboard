const PERMISSIONS = {
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    leaves: ['create', 'read', 'update', 'delete', 'approve', 'reject'],
    payroll: ['create', 'read', 'update', 'delete'],
    audit: ['read'],
    departments: ['create', 'read', 'update', 'delete']
  },
  hr: {
    users: ['read', 'update'],
    leaves: ['read', 'approve', 'reject'],
    payroll: ['create', 'read', 'update'],
    departments: ['read']
  },
  employee: {
    users: ['read:own'],
    leaves: ['create', 'read:own'],
    payroll: ['read:own']
  }
};

const hasPermission = (role, resource, action) => {
  const rolePermissions = PERMISSIONS[role];
  if (!rolePermissions || !rolePermissions[resource]) return false;
  
  return rolePermissions[resource].includes(action) || 
         rolePermissions[resource].includes(action.split(':')[0]);
};

const canAccessResource = (role, resource, action, userId, resourceOwnerId) => {
  const permission = PERMISSIONS[role]?.[resource]?.find(p => 
    p === action || p.startsWith(action.split(':')[0])
  );
  
  if (!permission) return false;
  
  if (permission.includes(':own')) {
    return userId === resourceOwnerId;
  }
  
  return true;
};

module.exports = { PERMISSIONS, hasPermission, canAccessResource };