require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'poker',
    password: process.env.DB_PASSWORD || 'poker123',
    database: process.env.DB_NAME || 'poker'
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10)
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  game: {
    initialChips: parseInt(process.env.INITIAL_CHIPS || '10000', 10),
    actionTimeout: parseInt(process.env.ACTION_TIMEOUT || '30', 10)
  }
};
