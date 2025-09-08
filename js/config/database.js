const { Sequelize } = require('sequelize');
const path = require('path');

// 创建 SQLite 数据库连接
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/database.sqlite'),
  logging: false // 设置为 true 可以查看 SQL 查询日志
});

module.exports = sequelize;