const handlePlayerAction = async (socket, ctx, { action, amount }, callback) => {
  const { user, services, broadcaster } = ctx;
  const userId = user.id;
  const tableId = socket.tableId;
  
  if (!tableId) {
    return callback?.({ success: false, error: '未在牌桌中' });
  }
  
  const game = services.gameService.getGame(tableId);
  if (!game) {
    return callback?.({ success: false, error: '游戏不存在' });
  }
  
  const player = game.getPlayer(userId);
  if (!player || !player.is_turn) {
    return callback?.({ success: false, error: '还没轮到你' });
  }
  
  let result = false;
  
  try {
    switch (action) {
      case 'fold':
        result = game.fold(userId);
        break;
      case 'check':
        result = game.check(userId);
        break;
      case 'call':
        result = game.call(userId);
        break;
      case 'raise':
        if (amount === undefined) {
          return callback?.({ success: false, error: '加注需要指定金额' });
        }
        result = game.raise(userId, amount);
        break;
      case 'all-in':
        result = game.allIn(userId);
        break;
      default:
        return callback?.({ success: false, error: '无效操作' });
    }
    
    if (!result) {
      return callback?.({ success: false, error: '无效操作' });
    }
    
    broadcaster.emitToTable(tableId, 'action_performed', {
      user_id: userId,
      action,
      amount,
      bet: player.bet,
      chips: player.chips
    });
    
    if (game.phase === 'complete') {
      const endResult = game.endHand();
      await services.gameService.saveGameHistory(game, endResult.results, endResult.winnings);
      
      const allPlayerIds = game.players.map(p => p.user_id);
      await services.questService.bumpProgressForMultipleUsers(allPlayerIds, 'PLAY_3_HANDS', 1);
      
      const winningPlayerIds = Object.entries(endResult.winnings)
        .filter(([_, winAmount]) => winAmount > 0)
        .map(([winnerId, _]) => parseInt(winnerId));
      if (winningPlayerIds.length > 0) {
        await services.questService.bumpProgressForMultipleUsers(winningPlayerIds, 'WIN_1_HAND', 1);
      }
      
      broadcaster.emitToTable(tableId, 'hand_ended', {
        community_cards: endResult.communityCards,
        pot: endResult.pot,
        results: endResult.results,
        winnings: endResult.winnings,
        players: game.players.map(p => ({
          user_id: p.user_id,
          username: p.username,
          hole_cards: p.status !== 'folded' ? p.hole_cards : [],
          chips: p.chips,
          status: p.status
        }))
      });
      
      await broadcaster.forEachClientInTable(tableId, (clientSocket) => {
        clientSocket.emit('game_state', game.getGameState(clientSocket.user.id));
      });
    } else {
      await broadcaster.forEachClientInTable(tableId, (clientSocket) => {
        clientSocket.emit('game_state', game.getGameState(clientSocket.user.id));
      });
    }
    
    callback?.({ success: true });
    
  } catch (err) {
    console.error('操作错误:', err);
    callback?.({ success: false, error: err.message || '操作失败' });
  }
};

module.exports = {
  handlePlayerAction
};
