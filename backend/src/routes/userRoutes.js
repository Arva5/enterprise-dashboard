const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize, authorizeOwnership } = require('../middleware/rbacMiddleware');
const { auditLog } = require('../middleware/auditMiddleware');

router.use(protect);

router.get('/', authorize('users', 'read'), userController.getAllUsers);
router.get('/:id', authorizeOwnership('users'), userController.getUser);
router.put('/:id', auditLog('UPDATE', 'users'), userController.updateUser);
router.delete('/:id', authorize('users', 'delete'), auditLog('DELETE', 'users'), userController.deleteUser);

module.exports = router;