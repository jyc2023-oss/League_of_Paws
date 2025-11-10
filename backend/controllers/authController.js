// controllers/authController.js - 认证控制器

const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { generateToken } = require('../utils/jwt');

/**
 * 用户注册
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    // 1. 验证输入 (符合 API 文档的 400 错误)
    if (!name || !email || !password) {
      return res.status(400).json({ message: '请填写所有必填项' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'password 必须至少为6个字符' });
    }

    // 2. 检查邮箱是否已存在 (符合 API 文档的 409 错误)
    const [duplicateRows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (duplicateRows.length > 0) {
      return res.status(409).json({ message: '该邮箱已注册，请改用登录' });
    }

    // 3. 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. 存储新用户
    const [insertResult] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email.toLowerCase(), hashedPassword]
    );

    // 5. 获取刚插入的用户信息
    const newUserId = insertResult.insertId;
    const [newRows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [newUserId]
    );
    const user = newRows[0];
    
    // 6. 创建 JWT (Token)
    const token = generateToken({ id: user.id });

    // 7. 返回成功响应 (符合 API 文档的 201 响应)
    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
      token: token,
    });

  } catch (error) {
    console.error('注册失败:', error);
    // (符合 API 文档的 500 错误)
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

/**
 * 用户登录
 * POST /api/auth/login
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1. 验证输入
    if (!email || !password) {
      return res.status(400).json({ message: '请填写邮箱和密码' });
    }

    // 2. 查找用户
    const [userRows] = await pool.query(
      'SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (userRows.length === 0) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    const user = userRows[0];

    // 3. 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    // 4. 创建 JWT Token
    const token = generateToken({ id: user.id });

    // 5. 返回成功响应
    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at,
      },
      token: token,
    });

  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ message: '服务器内部错误，请稍后重试' });
  }
}

module.exports = {
  register,
  login
};

