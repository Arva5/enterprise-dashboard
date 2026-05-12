const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const { auditLog } = require('../middleware/auditMiddleware');

router.use(protect);

router.post('/', authorize('payroll', 'create'), auditLog('CREATE', 'payroll'), payrollController.createPayroll);
router.get('/', authorize('payroll', 'read'), payrollController.getPayrolls);

module.exports = router;