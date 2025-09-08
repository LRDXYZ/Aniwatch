const sequelize = require('./database');
const User = require('../models/User');

async function syncDatabase() {
  try {
    // 同步数据库模型
    await sequelize.sync({ alter: true });
    console.log('数据库同步成功');
  } catch (error) {
    console.error('数据库同步失败:', error);
  }
}

// 如果直接运行此文件，则执行同步
if (require.main === module) {
  syncDatabase();
}

module.exports = syncDatabase;