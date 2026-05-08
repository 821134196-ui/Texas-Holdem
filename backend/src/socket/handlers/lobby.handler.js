const handleJoinLobby = async (socket, ctx) => {
  const { services, broadcaster } = ctx;
  
  socket.join('lobby');
  const tables = await services.gameService.listTables();
  broadcaster.emitToSelf('tables_updated', tables);
};

const handleLeaveLobby = (socket, ctx) => {
  socket.leave('lobby');
};

const handleCreateTable = async (socket, ctx, options, callback) => {
  const { user, services, broadcaster } = ctx;
  const userId = user.id;
  
  try {
    const table = await services.gameService.createTable(userId, options);
    const tables = await services.gameService.listTables();
    broadcaster.emitToLobby('tables_updated', tables);
    callback({ success: true, table });
  } catch (err) {
    callback({ success: false, error: err.message });
  }
};

const broadcastTablesUpdated = async (ctx) => {
  const { services, broadcaster } = ctx;
  const tables = await services.gameService.listTables();
  broadcaster.emitToLobby('tables_updated', tables);
};

module.exports = {
  handleJoinLobby,
  handleLeaveLobby,
  handleCreateTable,
  broadcastTablesUpdated
};
