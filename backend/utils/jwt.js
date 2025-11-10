// utils/jwt.js - JWT 工具函数

const jwt = require('jsonwebtoken');

// JWT 密钥（请替换成您自己的随机密钥）
const JWT_SECRET = 'MY_SUPER_SECRET_JWT_KEY_REPLACE_THIS';

/**
 * 生成 JWT Token
 * @param {Object} payload - Token 负载数据
 * @param {number} expiresIn - 过期时间（秒），默认 7 天
 * @returns {string} JWT Token
 */
function generateToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * 验证 JWT Token
 * @param {string} token - JWT Token
 * @returns {Object} 解码后的 Token 数据
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET
};

