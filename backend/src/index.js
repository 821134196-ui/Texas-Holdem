const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const config = require('./config');
const { createTables } = require('./database/init');
const { setupSocket } = require('./socket');
const authRoutes = require('./routes/auth');
const tablesRoutes = require('./routes/tables');
const questsRoutes = require('./routes/quests');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tables', tablesRoutes);
app.use('/api/quests', questsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

setupSocket(server, io);

const startServer = async () => {
  try {
    console.log('Initializing database...');
    await createTables();
    
    server.listen(config.port, () => {
      console.log(`Poker backend server running on port ${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
