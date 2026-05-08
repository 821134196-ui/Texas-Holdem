const { authenticateSocket } = require('./middleware/auth');
const { registerHandlers } = require('./router');
const { Broadcaster } = require('./broadcaster');

const gameService = require('../services/gameService');
const questService = require('../services/questService');
const db = require('../database');

const setupSocket = (server, io) => {
  io.use(authenticateSocket);
  
  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`用户 ${userId} 已连接`);
    
    const broadcaster = new Broadcaster(io, socket);
    
    const ctx = {
      user: socket.user,
      services: {
        gameService,
        questService,
        db
      },
      broadcaster
    };
    
    registerHandlers(socket, ctx);
  });
};

module.exports = { setupSocket };
