const {
  authHandler,
  lobbyHandler,
  tableHandler,
  gameHandler,
  chatHandler
} = require('./handlers');

const registerHandlers = (socket, ctx) => {
  socket.on('join_lobby', () => {
    lobbyHandler.handleJoinLobby(socket, ctx);
  });
  
  socket.on('leave_lobby', () => {
    lobbyHandler.handleLeaveLobby(socket, ctx);
  });
  
  socket.on('create_table', (options, callback) => {
    lobbyHandler.handleCreateTable(socket, ctx, options, callback);
  });
  
  socket.on('join_table', ({ tableId, password, buyIn }, callback) => {
    tableHandler.handleJoinTable(socket, ctx, { tableId, password, buyIn }, callback);
  });
  
  socket.on('leave_table', async (callback) => {
    await tableHandler.handleLeaveTable(socket, ctx, callback);
  });
  
  socket.on('start_game', async (callback) => {
    await tableHandler.handleStartGame(socket, ctx, callback);
  });
  
  socket.on('player_action', async ({ action, amount }, callback) => {
    await gameHandler.handlePlayerAction(socket, ctx, { action, amount }, callback);
  });
  
  socket.on('send_message', async ({ message }, callback) => {
    await chatHandler.handleSendMessage(socket, ctx, { message }, callback);
  });
  
  socket.on('disconnect', async () => {
    await authHandler.handleDisconnect(socket, ctx);
    await authHandler.handleTableCleanup(socket, ctx);
  });
};

module.exports = {
  registerHandlers
};
