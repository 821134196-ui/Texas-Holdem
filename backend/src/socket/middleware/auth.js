const jwt = require('jsonwebtoken');
const config = require('../../config');

const authenticateSocket = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    const err = new Error('需要身份认证');
    err.data = { type: 'auth_error' };
    return next(err);
  }
  
  try {
    const user = jwt.verify(token, config.jwt.secret);
    socket.user = user;
    next();
  } catch (err) {
    const authErr = new Error('令牌无效或已过期');
    authErr.data = { type: 'auth_error' };
    return next(authErr);
  }
};

module.exports = {
  authenticateSocket
};
