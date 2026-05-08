const jwt = require('jsonwebtoken');
const config = require('../config');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : null;
  
  if (!token) {
    return res.status(401).json({ error: '需要登录令牌' });
  }
  
  try {
    const user = jwt.verify(token, config.jwt.secret);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: '令牌无效或已过期' });
  }
};

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('需要身份认证'));
  }
  
  try {
    const user = jwt.verify(token, config.jwt.secret);
    socket.user = user;
    next();
  } catch (err) {
    return next(new Error('令牌无效或已过期'));
  }
};

module.exports = {
  authenticateToken,
  authenticateSocket
};
