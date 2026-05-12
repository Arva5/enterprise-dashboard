const User = require('../models/User');
const { connectDB } = require('../config/database');

const createAdminUser = async () => {
  await connectDB();

  const admin = await User.create({
    email: 'admin@company.com',
    password: 'Admin@123',
    firstName: 'Super',
    lastName: 'Admin',
    role: 'admin',
    department: 'Management',
    position: 'Administrator'
  });

  console.log('✅ Admin created:', admin.email);
  process.exit(0);
};

createAdminUser();