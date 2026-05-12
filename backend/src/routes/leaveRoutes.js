const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { auditLog } = require('../middleware/auditMiddleware');

router.use(protect);

router.post('/', authorize('leaves', 'create'), auditLog('CREATE', 'leaves'), leaveController.createLeaveRequest);
router.get('/', authorize('leaves', 'read'), leaveController.getLeaveRequests);
router.put('/:id/status', authorize('leaves', 'approve'), auditLog('UPDATE', 'leaves'), leaveController.updateLeaveStatus);

module.exports = router;