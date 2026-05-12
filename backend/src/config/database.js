const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use SQLite for simplicity
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database Connected');
    
    await sequelize.sync({ force: true });
    console.log('✅ Database Synced');
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };