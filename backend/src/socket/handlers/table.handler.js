const handleJoinTable = async (socket, ctx, { tableId, password, buyIn }, callback) => {
  const { user, services, broadcaster } = ctx;
  const userId = user.id;
  
  try {
    const table = await services.gameService.getTable(tableId);
    
    if (!table) {
      return callback({ success: false, error: '牌桌不存在' });
    }
    
    if (table.is_private && table.owner_id !== userId) {
      if (!password || !services.gameService.validatePassword(table, password)) {
        return callback({ success: false, error: '密码错误' });
      }
    }
    
    const userResult = await services.db.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return callback({ success: false, error: '用户不存在' });
    }
    
    const userData = userResult.rows[0];
    const actualBuyIn = Math.min(buyIn, userData.chips);
    const minBuyIn = table.min_buy_in;
    
    if (actualBuyIn < minBuyIn) {
      return callback({ success: false, error: `最低买入为 ${minBuyIn} 筹码` });
    }
    
    await services.db.query(
      'UPDATE users SET chips = chips - $1 WHERE id = $2',
      [actualBuyIn, userId]
    );
    
    const roomName = `table:${tableId}`;
    socket.join(roomName);
    socket.tableId = tableId;
    
    let game = services.gameService.getGame(tableId);
    
    if (!game) {
      game = await services.gameService.startGame(tableId);
    }
    
    const availableSeats = game.getAvailableSeats();
    
    if (availableSeats.length === 0) {
      socket.leave(roomName);
      await services.db.query(
        'UPDATE users SET chips = chips + $1 WHERE id = $2',
        [actualBuyIn, userId]
      );
      return callback({ success: false, error: '牌桌已满' });
    }
    
    const seatIndex = availableSeats[0];
    const player = game.addPlayer(userData, seatIndex, actualBuyIn);
    
    const gameState = game.getGameState(userId);
    broadcaster.emitToSelf('game_state', gameState);
    
    broadcaster.emitToTable(tableId, 'player_joined', {
      user_id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      seat_position: seatIndex,
      chips: actualBuyIn
    }, false);
    
    for (const p of game.players) {
      if (p.user_id !== userId && p.hole_cards.length > 0) {
        broadcaster.emitToUserId(p.user_id, 'private_cards', {
          user_id: p.user_id,
          hole_cards: p.hole_cards
        });
      }
    }
    
    if (player.hole_cards.length > 0) {
      broadcaster.emitToSelf('private_cards', {
        user_id: userId,
        hole_cards: player.hole_cards
      });
    }
    
    await services.questService.bumpProgress(userId, 'JOIN_1_TABLE', 1);
    
    callback({ success: true, seatIndex });
    
  } catch (err) {
    console.error('加入牌桌错误:', err);
    callback({ success: false, error: err.message || '加入牌桌失败' });
  }
};

const handleLeaveTable = async (socket, ctx, callback) => {
  const { user, services, broadcaster } = ctx;
  const userId = user.id;
  const tableId = socket.tableId;
  
  if (!tableId) {
    callback?.({ success: true });
    return;
  }
  
  const roomName = `table:${tableId}`;
  const game = services.gameService.getGame(tableId);
  
  if (game) {
    const player = game.getPlayer(userId);
    if (player) {
      if (player.status !== 'waiting' && player.status !== 'folded') {
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
    
    if (game.players.length === 0) {
      services.gameService.endGame(tableId);
    }
  }
  
  socket.leave(roomName);
  delete socket.tableId;
  
  callback?.({ success: true });
};

const handleStartGame = async (socket, ctx, callback) => {
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
  
  if (game.phase !== 'preflop' || game.communityCards.length > 0) {
    return callback?.({ success: false, error: '游戏已在进行中' });
  }
  
  if (!game.canStartGame()) {
    return callback?.({ success: false, error: '至少需要2名玩家才能开始' });
  }
  
  const started = game.startNewHand();
  
  if (!started) {
    return callback?.({ success: false, error: '开始游戏失败' });
  }
  
  await broadcaster.forEachClientInTable(tableId, (clientSocket) => {
    const player = game.getPlayer(clientSocket.user.id);
    if (player) {
      clientSocket.emit('private_cards', {
        user_id: clientSocket.user.id,
        hole_cards: player.hole_cards
      });
      clientSocket.emit('game_state', game.getGameState(clientSocket.user.id));
    }
  });
  
  broadcaster.emitToTable(tableId, 'game_started', {
    phase: game.phase,
    dealer_position: game.dealerPosition
  });
  
  callback?.({ success: true });
};

module.exports = {
  handleJoinTable,
  handleLeaveTable,
  handleStartGame
};
