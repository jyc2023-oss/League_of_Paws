// middleware/index.js - 中间件配置

const cors = require('cors');
const express = require('express');
const { verifyToken } = require('../utils/jwt');

/**
 * 配置应用中间件
 * @param {Express} app - Express 应用实例
 */
function setupMiddleware(app) {
  // 允许所有跨域请求
  app.use(cors());
  
  // 解析 JSON 请求体
  app.use(express.json());
  
  // 健康检查端点
  app.get('/health', (req, res) => res.json({ ok: true }));
}

/**
 * JWT 认证中间件
 * 验证请求头中的 Authorization token
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: '需要身份验证，请先登录' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // 将用户信息附加到请求对象
    next();
  } catch (error) {
    return res.status(403).json({ message: '无效或过期的token' });
  }
}

module.exports = {
  setupMiddleware,
  authenticateToken
};

