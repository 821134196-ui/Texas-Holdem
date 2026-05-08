const db = require('../database');

const QUESTS = [
  {
    code: 'PLAY_3_HANDS',
    name: '完成3手牌',
    description: '今日完成3手牌（参与到摊牌或弃牌都算）',
    target: 3,
    reward: 500
  },
  {
    code: 'WIN_1_HAND',
    name: '赢得1手牌',
    description: '今日赢下任意1手',
    target: 1,
    reward: 1000
  },
  {
    code: 'JOIN_1_TABLE',
    name: '加入牌桌',
    description: '今日加入任意牌桌1次',
    target: 1,
    reward: 200
  }
];

const dayKey = () => {
  const now = new Date();
  const utc8Time = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const year = utc8Time.getUTCFullYear();
  const month = String(utc8Time.getUTCMonth() + 1).padStart(2, '0');
  const day = String(utc8Time.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayBoard = async (userId) => {
  const today = dayKey();
  
  const checkinResult = await db.query(`
    SELECT * FROM daily_checkin 
    WHERE user_id = $1 AND date = $2
  `, [userId, today]);
  
  const isCheckedIn = checkinResult.rows.length > 0;
  const checkinReward = checkinResult.rows[0]?.reward_chips || 0;
  
  const streakResult = await db.query(`
    SELECT date FROM daily_checkin 
    WHERE user_id = $1 
    ORDER BY date DESC 
    LIMIT 10
  `, [userId]);
  
  let streak = 0;
  const dates = streakResult.rows.map(r => r.date);
  
  if (dates.length > 0) {
    const todayDate = new Date(today);
    for (let i = 0; i < dates.length; i++) {
      const checkDate = new Date(dates[i]);
      const diffDays = Math.floor((todayDate - checkDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === i || (i === 0 && diffDays === 1)) {
        streak++;
      } else {
        break;
      }
    }
    
    if (isCheckedIn && streak > 0) {
      streak = streak;
    } else if (!isCheckedIn && streak > 0) {
      const lastDate = new Date(dates[0]);
      const diffToday = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      if (diffToday > 1) {
        streak = 0;
      }
    }
  }
  
  const progressResult = await db.query(`
    SELECT * FROM daily_quest_progress 
    WHERE user_id = $1 AND date = $2
  `, [userId, today]);
  
  const progressMap = {};
  progressResult.rows.forEach(p => {
    progressMap[p.quest_code] = p;
  });
  
  const quests = QUESTS.map(quest => {
    const progress = progressMap[quest.code];
    return {
      code: quest.code,
      name: quest.name,
      description: quest.description,
      target: quest.target,
      reward: quest.reward,
      progress: progress?.progress || 0,
      claimed: progress?.claimed || false,
      can_claim: (progress?.progress || 0) >= quest.target && !(progress?.claimed || false)
    };
  });
  
  const nextCheckinReward = Math.min(100 + streak * 50, 500);
  
  return {
    date: today,
    checkin: {
      is_checked_in: isCheckedIn,
      reward: checkinReward,
      streak: streak,
      next_reward: nextCheckinReward
    },
    quests
  };
};

const claimCheckin = async (userId) => {
  const today = dayKey();
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const existingResult = await client.query(`
      SELECT * FROM daily_checkin WHERE user_id = $1 AND date = $2 FOR UPDATE
    `, [userId, today]);
    
    if (existingResult.rows.length > 0) {
      await client.query('ROLLBACK');
      throw new Error('今日已签到');
    }
    
    const streakResult = await client.query(`
      SELECT date FROM daily_checkin 
      WHERE user_id = $1 
      ORDER BY date DESC 
      LIMIT 10
    `, [userId]);
    
    let streak = 0;
    const dates = streakResult.rows.map(r => r.date);
    const todayDate = new Date(today);
    
    if (dates.length > 0) {
      const lastDate = new Date(dates[0]);
      const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak = 1;
        for (let i = 1; i < dates.length; i++) {
          const prevDate = new Date(dates[i - 1]);
          const currDate = new Date(dates[i]);
          const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
          if (diff === 1) {
            streak++;
          } else {
            break;
          }
        }
      }
    }
    
    const reward = Math.min(100 + streak * 50, 500);
    
    await client.query(`
      INSERT INTO daily_checkin (user_id, date, reward_chips)
      VALUES ($1, $2, $3)
    `, [userId, today, reward]);
    
    await client.query(`
      UPDATE users SET chips = chips + $1, updated_at = NOW() WHERE id = $2
    `, [reward, userId]);
    
    const userResult = await client.query(`
      SELECT chips FROM users WHERE id = $1
    `, [userId]);
    
    await client.query('COMMIT');
    
    return {
      success: true,
      reward,
      streak: streak + 1,
      chips: userResult.rows[0].chips
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const claimQuest = async (userId, code) => {
  const today = dayKey();
  const quest = QUESTS.find(q => q.code === code);
  
  if (!quest) {
    throw new Error('任务不存在');
  }
  
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const progressResult = await client.query(`
      SELECT * FROM daily_quest_progress 
      WHERE user_id = $1 AND date = $2 AND quest_code = $3
      FOR UPDATE
    `, [userId, today, code]);
    
    if (progressResult.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new Error('任务进度不存在');
    }
    
    const progress = progressResult.rows[0];
    
    if (progress.progress < quest.target) {
      await client.query('ROLLBACK');
      throw new Error('任务未完成');
    }
    
    if (progress.claimed) {
      await client.query('ROLLBACK');
      throw new Error('任务已领取');
    }
    
    await client.query(`
      UPDATE daily_quest_progress 
      SET claimed = TRUE, updated_at = NOW()
      WHERE user_id = $1 AND date = $2 AND quest_code = $3
    `, [userId, today, code]);
    
    await client.query(`
      UPDATE users SET chips = chips + $1, updated_at = NOW() WHERE id = $2
    `, [quest.reward, userId]);
    
    const userResult = await client.query(`
      SELECT chips FROM users WHERE id = $1
    `, [userId]);
    
    await client.query('COMMIT');
    
    return {
      success: true,
      code: quest.code,
      reward: quest.reward,
      chips: userResult.rows[0].chips
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const bumpProgress = async (userId, code, increment = 1) => {
  const today = dayKey();
  const quest = QUESTS.find(q => q.code === code);
  
  if (!quest) {
    return;
  }
  
  try {
    await db.query(`
      INSERT INTO daily_quest_progress (user_id, date, quest_code, progress, target)
      VALUES ($1, $2, $3, LEAST($4, $5), $5)
      ON CONFLICT (user_id, date, quest_code) 
      DO UPDATE SET 
        progress = LEAST(daily_quest_progress.progress + $4, daily_quest_progress.target),
        updated_at = NOW()
    `, [userId, today, code, increment, quest.target]);
  } catch (err) {
    console.error('bumpProgress error:', err.message);
  }
};

const bumpProgressForMultipleUsers = async (userIds, code, increment = 1) => {
  for (const userId of userIds) {
    await bumpProgress(userId, code, increment);
  }
};

module.exports = {
  QUESTS,
  dayKey,
  getTodayBoard,
  claimCheckin,
  claimQuest,
  bumpProgress,
  bumpProgressForMultipleUsers
};
