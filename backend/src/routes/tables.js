const express = require('express');
const gameService = require('../services/gameService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const tables = await gameService.listTables();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      small_blind,
      big_blind,
      max_players,
      min_buy_in,
      max_buy_in,
      is_private,
      password
    } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Table name is required' });
    }
    
    const table = await gameService.createTable(req.user.id, {
      name,
      small_blind,
      big_blind,
      max_players,
      min_buy_in,
      max_buy_in,
      is_private,
      password
    });
    
    res.status(201).json(table);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const table = await gameService.getTable(parseInt(req.params.id));
    
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }
    
    res.json(table);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
