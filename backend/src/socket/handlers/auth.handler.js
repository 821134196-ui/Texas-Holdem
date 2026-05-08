const handleDisconnect = async (socket, ctx) => {
  const { user, services, broadcaster } = ctx;
  const userId = user.id;
  
  console.log(`用户 ${userId} 已断开连接`);
  
  if (socket.tableId) {
    const tableId = socket.tableId;
    const game = services.gameService.getGame(tableId);
    
    if (game) {
      const player = game.getPlayer(userId);
      if (player) {
        if (player.is_turn) {
          game.fold(userId);
        }
        
        const remainingChips = player.chips;
        if (remainingChips > 0) {
          await services.db.query(
            'UPDATE users SET chips = chips + $1 WHERE id = $2',
            [remainingChips, userId]
          );
        }
        
        game.removePlayer(userId);
        
        broadcaster.emitToTable(tableId, 'player_left', {
          user_id: userId,
          seat_position: player.seat_position
        });
      }
    }
  }
};

const handleTableCleanup = async (socket, ctx) => {
  const { services, broadcaster } = ctx;
  
  if (socket.tableId) {
    const tableId = socket.tableId;
    const room = `table:${tableId}`;
    const clients = await broadcaster.getRoomClients(room);
    
    if (clients.size === 0) {
      services.gameService.endGame(tableId);
    }
  }
};

module.exports = {
  handleDisconnect,
  handleTableCleanup
};
