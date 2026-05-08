const bcrypt = require('bcryptjs');
const { pool } = require('./index');
const config = require('../config');

const createTables = async () => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        chips INTEGER NOT NULL DEFAULT 10000,
        avatar VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        owner_id INTEGER REFERENCES users(id),
        small_blind INTEGER NOT NULL DEFAULT 10,
        big_blind INTEGER NOT NULL DEFAULT 20,
        max_players INTEGER NOT NULL DEFAULT 9,
        min_buy_in INTEGER NOT NULL DEFAULT 200,
        max_buy_in INTEGER NOT NULL DEFAULT 2000,
        is_private BOOLEAN NOT NULL DEFAULT FALSE,
        password VARCHAR(255),
        status VARCHAR(20) NOT NULL DEFAULT 'waiting',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        table_id INTEGER REFERENCES tables(id),
        status VARCHAR(20) NOT NULL DEFAULT 'preflop',
        dealer_position INTEGER NOT NULL DEFAULT 0,
        current_player INTEGER NOT NULL DEFAULT 0,
        pot_total INTEGER NOT NULL DEFAULT 0,
        community_cards JSONB DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_players (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id),
        user_id INTEGER REFERENCES users(id),
        seat_position INTEGER NOT NULL,
        chips INTEGER NOT NULL,
        bet INTEGER NOT NULL DEFAULT 0,
        total_bet INTEGER NOT NULL DEFAULT 0,
        hole_cards JSONB DEFAULT '[]',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        is_turn BOOLEAN NOT NULL DEFAULT FALSE,
        last_action VARCHAR(20),
        action_ends_at TIMESTAMP WITH TIME ZONE
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS pots (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id),
        amount INTEGER NOT NULL DEFAULT 0,
        is_main BOOLEAN NOT NULL DEFAULT FALSE,
        eligible_players INTEGER[] NOT NULL DEFAULT '{}'
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS game_history (
        id SERIAL PRIMARY KEY,
        game_id INTEGER REFERENCES games(id),
        user_id INTEGER REFERENCES users(id),
        hole_cards JSONB NOT NULL,
        final_hand JSONB,
        chips_before INTEGER NOT NULL,
        chips_after INTEGER NOT NULL,
        net_chips INTEGER NOT NULL,
        pot_won INTEGER DEFAULT 0,
        showdown_rank INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        table_id INTEGER REFERENCES tables(id),
        user_id INTEGER REFERENCES users(id),
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_checkin (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        date DATE NOT NULL,
        reward_chips INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date)
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_quest_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) NOT NULL,
        date DATE NOT NULL,
        quest_code VARCHAR(50) NOT NULL,
        progress INTEGER NOT NULL DEFAULT 0,
        target INTEGER NOT NULL DEFAULT 1,
        claimed BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, date, quest_code)
      )
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_games_table_id ON games(table_id);
      CREATE INDEX IF NOT EXISTS idx_game_players_game_id ON game_players(game_id);
      CREATE INDEX IF NOT EXISTS idx_game_history_user_id ON game_history(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_daily_checkin_user_date ON daily_checkin(user_id, date);
      CREATE INDEX IF NOT EXISTS idx_daily_quest_progress_user_date ON daily_quest_progress(user_id, date);
    `);
    
    const testUsers = [
      { username: 'player1', email: 'player1@poker.local', password: '123456', chips: config.game.initialChips },
      { username: 'player2', email: 'player2@poker.local', password: '123456', chips: config.game.initialChips },
      { username: 'player3', email: 'player3@poker.local', password: '123456', chips: config.game.initialChips }
    ];
    
    for (const user of testUsers) {
      const passwordHash = await bcrypt.hash(user.password, 10);
      await client.query(`
        INSERT INTO users (username, email, password_hash, chips)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (username) DO NOTHING
      `, [user.username, user.email, passwordHash, user.chips]);
    }
    
    await client.query('COMMIT');
    console.log('Database initialized successfully with test users: player1, player2, player3 (password: 123456)');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { createTables };
