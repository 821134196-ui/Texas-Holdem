const express = require('express');
const questService = require('../services/questService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/today', authenticateToken, async (req, res) => {
  try {
    const board = await questService.getTodayBoard(req.user.id);
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const result = await questService.claimCheckin(req.user.id);
    res.json(result);
  } catch (err) {
    if (err.message === '今日已签到') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

router.post('/:code/claim', authenticateToken, async (req, res) => {
  try {
    const result = await questService.claimQuest(req.user.id, req.params.code);
    res.json(result);
  } catch (err) {
    if (err.message === '任务不存在' || err.message === '任务进度不存在') {
      res.status(404).json({ error: err.message });
    } else if (err.message === '任务未完成' || err.message === '任务已领取') {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

module.exports = router;
