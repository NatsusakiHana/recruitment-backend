const jwt = require('jsonwebtoken');

// JWT密钥（生产环境应该从环境变量读取）
const JWT_SECRET = process.env.JWT_SECRET || 'recruitment-system-secret-key-2024';

// 生成Token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// 验证Token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 管理员认证中间件
function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).send({
        code: -1,
        message: '未授权，请先登录',
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).send({
        code: -1,
        message: 'Token无效或已过期',
      });
    }

    // 将管理员信息附加到请求对象
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('认证失败：', error);
    res.status(401).send({
      code: -1,
      message: '认证失败',
      error: error.message,
    });
  }
}

// 超级管理员权限检查
function superAdminAuth(req, res, next) {
  if (req.admin.role !== 'super_admin') {
    return res.status(403).send({
      code: -1,
      message: '权限不足，需要超级管理员权限',
    });
  }
  next();
}

module.exports = {
  generateToken,
  verifyToken,
  adminAuth,
  superAdminAuth,
  JWT_SECRET,
};
