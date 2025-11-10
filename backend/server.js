// server.js - 主入口文件

const express = require('express');
const { setupMiddleware } = require('./middleware');
const authRoutes = require('./routes/auth');
const petRoutes = require('./routes/pets');

// 初始化数据库连接（这会触发数据库连接）
require('./config/database');

const app = express();

// 配置中间件
setupMiddleware(app);

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);

// 启动服务器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ 后端服务器正在 http://localhost:${PORT} 运行`);
});
