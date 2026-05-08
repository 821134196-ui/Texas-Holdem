const db = require('../database');
const { GameState, GAME_PHASES } = require('../game/gameState');

const activeGames = new Map();

const createTable = async (userId, options) => {
  const {
    name,
    small_blind = 10,
    big_blind = 20,
    max_players = 9,
    min_buy_in = 200,
    max_buy_in = 2000,
    is_private = false,
    password = null
  } = options;
  
  if (max_players < 2 || max_players > 9) {
    throw new Error('最大玩家数必须在2到9之间');
  }
  
  const passwordHash = password ? require('bcryptjs').hashSync(password, 10) : null;
  
  const result = await db.query(`
    INSERT INTO tables 
    (name, owner_id, small_blind, big_blind, max_players, min_buy_in, max_buy_in, is_private, password)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [name, userId, small_blind, big_blind, max_players, min_buy_in, max_buy_in, is_private, passwordHash]);
  
  const table = result.rows[0];
  return table;
};

const listTables = async () => {
  const result = await db.query(`
    SELECT 
      t.*,
      u.username as owner_name,
      (SELECT COUNT(*) FROM game_players gp 
       JOIN games g ON gp.game_id = g.id 
       WHERE g.table_id = t.id AND gp.status NOT IN ('folded', 'waiting')) as player_count
    FROM tables t
    JOIN users u ON t.owner_id = u.id
    WHERE t.status = 'waiting'
    ORDER BY t.created_at DESC
  `);
  
  return result.rows;
};

const getTable = async (tableId) => {
  const result = await db.query(`
    SELECT * FROM tables WHERE id = $1
  `, [tableId]);
  
  return result.rows[0] || null;
};

const startGame = async (tableId) => {
  const table = await getTable(tableId);
  if (!table) {
    throw new Error('牌桌不存在');
  }
  
  if (activeGames.has(tableId)) {
    return activeGames.get(tableId);
  }
  
  const game = new GameState(table);
  activeGames.set(tableId, game);
  
  await db.query(`
    INSERT INTO games (table_id, status, dealer_position, current_player, pot_total)
    VALUES ($1, $2, $3, $4, $5)
  `, [tableId, 'preflop', game.dealerPosition, game.currentPlayerIndex, 0]);
  
  return game;
};

const getGame = (tableId) => {
  return activeGames.get(tableId) || null;
};

const saveGameHistory = async (game, results, winnings) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const gameResult = await client.query(`
      UPDATE games 
      SET status = $1, pot_total = $2, community_cards = $3, ended_at = NOW()
      WHERE table_id = $4 AND ended_at IS NULL
      RETURNING id
    `, ['complete', game.potManager.getTotalPot(), JSON.stringify(game.communityCards), game.id]);
    
    const gameDbId = gameResult.rows[0]?.id;
    
    for (const player of game.players) {
      const winAmount = winnings[player.user_id] || 0;
      const netChips = winAmount - player.total_bet;
      
      await client.query(`
        INSERT INTO game_history 
        (game_id, user_id, hole_cards, final_hand, chips_before, chips_after, net_chips, pot_won)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        gameDbId,
        player.user_id,
        JSON.stringify(player.hole_cards),
        player.status !== 'folded' ? JSON.stringify(player.hole_cards) : null,
        player.chips + player.total_bet - winAmount,
        player.chips,
        netChips,
        winAmount
      ]);
      
      await client.query(`
        UPDATE users SET chips = $1, updated_at = NOW() WHERE id = $2
      `, [player.chips, player.user_id]);
    }
    
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const endGame = (tableId) => {
  activeGames.delete(tableId);
};

const validatePassword = (table, password) => {
  if (!table.is_private) return true;
  if (!table.password) return true;
  return require('bcryptjs').compareSync(password, table.password);
};

module.exports = {
  activeGames,
  createTable,
  listTables,
  getTable,
  startGame,
  getGame,
  saveGameHistory,
  endGame,
  validatePassword
};
