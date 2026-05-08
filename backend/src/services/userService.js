const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const config = require('../config');

const register = async (username, email, password) => {
  const existingUser = await db.query(
    'SELECT id FROM users WHERE username = $1 OR email = $2',
    [username, email]
  );
  
  if (existingUser.rows.length > 0) {
    throw new Error('用户名或邮箱已存在');
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await db.query(
    `INSERT INTO users (username, email, password_hash, chips)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, chips, avatar, created_at`,
    [username, email, passwordHash, config.game.initialChips]
  );
  
  const user = result.rows[0];
  const token = generateToken(user);
  
  return { user, token };
};

const login = async (username, password) => {
  const result = await db.query(
    'SELECT * FROM users WHERE username = $1 OR email = $2',
    [username, username]
  );
  
  if (result.rows.length === 0) {
    throw new Error('用户名或密码错误');
  }
  
  const user = result.rows[0];
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  
  if (!isValidPassword) {
    throw new Error('用户名或密码错误');
  }
  
  const token = generateToken(user);
  
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      chips: user.chips,
      avatar: user.avatar
    },
    token
  };
};

const getProfile = async (userId) => {
  const result = await db.query(
    'SELECT id, username, email, chips, avatar, created_at FROM users WHERE id = $1',
    [userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }
  
  const user = result.rows[0];
  
  const historyResult = await db.query(`
    SELECT 
      COUNT(*) as total_games,
      SUM(CASE WHEN net_chips > 0 THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN net_chips < 0 THEN 1 ELSE 0 END) as losses,
      SUM(net_chips) as total_net_chips
    FROM game_history 
    WHERE user_id = $1
  `, [userId]);
  
  const stats = historyResult.rows[0];
  
  return {
    ...user,
    stats: {
      total_games: parseInt(stats.total_games) || 0,
      wins: parseInt(stats.wins) || 0,
      losses: parseInt(stats.losses) || 0,
      total_net_chips: parseInt(stats.total_net_chips) || 0
    }
  };
};

const updateChips = async (userId, amount) => {
  const result = await db.query(
    'UPDATE users SET chips = chips + $1, updated_at = NOW() WHERE id = $2 RETURNING chips',
    [amount, userId]
  );
  
  if (result.rows.length === 0) {
    throw new Error('用户不存在');
  }
  
  return result.rows[0].chips;
};

const getRecentGames = async (userId, limit = 50) => {
  const result = await db.query(`
    SELECT 
      gh.id,
      gh.game_id,
      gh.hole_cards,
      gh.final_hand,
      gh.chips_before,
      gh.chips_after,
      gh.net_chips,
      gh.pot_won,
      gh.showdown_rank,
      gh.created_at,
      g.community_cards
    FROM game_history gh
    LEFT JOIN games g ON gh.game_id = g.id
    WHERE gh.user_id = $1
    ORDER BY gh.created_at DESC
    LIMIT $2
  `, [userId, limit]);
  
  return result.rows;
};

const getLeaderboard = async (period = 'all') => {
  let dateCondition = '';
  const params = [];
  
  if (period === 'today') {
    dateCondition = 'AND gh.created_at >= CURRENT_DATE';
  } else if (period === 'week') {
    dateCondition = 'AND gh.created_at >= CURRENT_DATE - INTERVAL \'7 days\'';
  }
  
  const result = await db.query(`
    SELECT 
      u.id,
      u.username,
      u.avatar,
      u.chips as current_chips,
      SUM(gh.net_chips) as net_chips,
      COUNT(gh.id) as games_played
    FROM users u
    LEFT JOIN game_history gh ON u.id = gh.user_id ${dateCondition}
    GROUP BY u.id, u.username, u.avatar, u.chips
    ORDER BY net_chips DESC NULLS LAST
    LIMIT 10
  `, params);
  
  return result.rows;
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

module.exports = {
  register,
  login,
  getProfile,
  updateChips,
  getRecentGames,
  getLeaderboard
};
