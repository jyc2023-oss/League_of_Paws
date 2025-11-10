// config/database.js - 数据库连接配置

const mysql = require('mysql2/promise');

// 数据库连接池配置
let pool;

try {
  pool = mysql.createPool({
    host: 'localhost',           // 您的 MySQL 主机地址 (通常是 'localhost')
    user: 'root',                 // 您的 MySQL 用户名 (例如 'root')
    password: 'Chenjianyi666+',   // 您的 MySQL 密码
    database: 'my_app_db',        // 数据库名称
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('✅ 成功连接到 MySQL 数据库');
} catch (error) {
  console.error('❌ 数据库连接失败:', error);
  process.exit(1); // 启动失败时退出
}

module.exports = pool;

