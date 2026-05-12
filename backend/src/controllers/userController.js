const User = require('../models/User');
const { Op } = require('sequelize');

exports.getAllUsers = async (req, res) => {
  try {
    const { role, department, search } = req.query;
    
    let whereClause = {};
    
    if (role) whereClause.role = role;
    if (department) whereClause.department = department;
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({ where: whereClause });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.user.role === 'employee' && req.user.id !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.user.role === 'employee' && req.user.id !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }

    if (req.body.role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can change roles'
      });
    }

    if (req.body.salary && req.user.role === 'employee') {
      return res.status(403).json({
        success: false,
        message: 'You cannot change your own salary'
      });
    }

    await user.update(req.body);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ isActive: false });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};