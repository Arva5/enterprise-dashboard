const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');

exports.createLeaveRequest = async (req, res) => {
  try {
    const leaveRequest = await LeaveRequest.create({
      ...req.body,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted',
      data: leaveRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getLeaveRequests = async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.role === 'employee') {
      whereClause.userId = req.user.id;
    }

    if (req.query.status) {
      whereClause.status = req.query.status;
    }

    const leaveRequests = await LeaveRequest.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'reviewer', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: leaveRequests.length,
      data: leaveRequests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    const leaveRequest = await LeaveRequest.findByPk(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    await leaveRequest.update({
      status,
      reviewNote,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    });

    res.json({
      success: true,
      message: `Leave request ${status}`,
      data: leaveRequest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};