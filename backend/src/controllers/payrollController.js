const Payroll = require('../models/Payroll');
const User = require('../models/User');

exports.createPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Payroll created',
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPayrolls = async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.role === 'employee') {
      whereClause.userId = req.user.id;
    } else if (req.query.userId) {
      whereClause.userId = req.query.userId;
    }

    const payrolls = await Payroll.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['year', 'DESC'], ['month', 'DESC']]
    });

    res.json({
      success: true,
      count: payrolls.length,
      data: payrolls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};