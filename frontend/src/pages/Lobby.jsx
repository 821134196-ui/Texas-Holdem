import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTables, createTable, clearError } from '../store/gameSlice';
import { getLeaderboard } from '../store/authSlice';
import { socketActions } from '../services/socket';
import DailyQuestPanel from '../components/DailyQuestPanel';

const Lobby = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestPanel, setShowQuestPanel] = useState(false);
  const [newTable, setNewTable] = useState({
    name: '',
    small_blind: 10,
    big_blind: 20,
    max_players: 9,
    min_buy_in: 200,
    max_buy_in: 2000,
    is_private: false,
    password: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tables, loading, error } = useSelector(state => state.game);
  const { leaderboard, user } = useSelector(state => state.auth);
  const { todayBoard } = useSelector(state => state.quest);
  
  useEffect(() => {
    dispatch(fetchTables());
    dispatch(getLeaderboard('today'));
    socketActions.joinLobby();
    
    return () => {
      socketActions.leaveLobby();
    };
  }, [dispatch]);
  
  const handleCreateTable = (e) => {
    e.preventDefault();
    
    if (!newTable.name.trim()) {
      return;
    }
    
    const tableData = {
      ...newTable,
      name: newTable.name.trim(),
      password: newTable.is_private ? newTable.password : null
    };
    
    socketActions.createTable(tableData, (response) => {
      if (response.success) {
        setShowCreateModal(false);
        setNewTable({
          name: '',
          small_blind: 10,
          big_blind: 20,
          max_players: 9,
          min_buy_in: 200,
          max_buy_in: 2000,
          is_private: false,
          password: ''
        });
        dispatch(fetchTables());
      }
    });
  };
  
  const handleJoinTable = (table) => {
    const isOwner = table.owner_id === user?.id;
    
    if (table.is_private && !isOwner) {
      const password = prompt('请输入房间密码:');
      if (password === null) return;
      navigate(`/table/${table.id}`, { state: { password, buyIn: table.min_buy_in } });
    } else {
      navigate(`/table/${table.id}`, { state: { buyIn: table.min_buy_in } });
    }
  };
  
  const getBlindLevel = (small, big) => {
    return `${small}/${big}`;
  };

  const hasUnclaimedReward = () => {
    if (!todayBoard) return false;
    if (!todayBoard.checkin.is_checked_in) return true;
    return todayBoard.quests?.some(q => q.can_claim) || false;
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          padding: '1rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.8rem',
              background: 'linear-gradient(90deg, #ffd700 0%, #ffb700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              德州扑克
            </h1>
            {user && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                background: 'rgba(255, 215, 0, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 215, 0, 0.2)'
              }}>
                <span style={{ color: '#aaa', fontSize: '0.9rem' }}>筹码:</span>
                <span style={{ 
                  color: '#ffd700', 
                  fontWeight: 'bold', 
                  fontSize: '1.1rem' 
                }}>
                  {user.chips?.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={() => setShowQuestPanel(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(90deg, #ff6b6b 0%, #ee5a5a 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: hasUnclaimedReward() ? '0 0 15px rgba(255, 107, 107, 0.5)' : 'none',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = hasUnclaimedReward() ? '0 0 15px rgba(255, 107, 107, 0.5)' : 'none';
              }}
            >
              <span>📋</span>
              每日任务
              {hasUnclaimedReward() && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '12px',
                  height: '12px',
                  background: '#ff4444',
                  borderRadius: '50%',
                  animation: 'pulse 1.5s infinite'
                }} />
              )}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(90deg, #28a745 0%, #218838 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '500',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <span>+</span>
              创建新牌桌
            </button>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
          <div>
            <h2 style={{ 
              marginBottom: '1.5rem',
              fontSize: '1.3rem',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ color: '#ffd700' }}>🎰</span>
              可用牌桌
            </h2>
            
            {loading && tables.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem',
                color: '#666',
                fontSize: '1.1rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎲</div>
                加载中...
              </div>
            )}
            
            {!loading && tables.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🃏</div>
                <div style={{ color: '#aaa', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  暂无可用牌桌
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>
                  点击上方"创建新牌桌"开始游戏吧！
                </div>
              </div>
            )}
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              {tables.map(table => (
                <div
                  key={table.id}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      marginBottom: '0.75rem',
                      fontSize: '1.15rem',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      {table.is_private && <span>🔒</span>}
                      {table.name}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      gap: '1.5rem', 
                      fontSize: '0.9rem', 
                      flexWrap: 'wrap'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.25rem 0.75rem',
                        background: 'rgba(255, 215, 0, 0.1)',
                        borderRadius: '4px'
                      }}>
                        <span style={{ color: '#aaa' }}>盲注:</span>
                        <span style={{ color: '#ffd700', fontWeight: '600' }}>
                          {getBlindLevel(table.small_blind, table.big_blind)}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
                        <span style={{ color: '#aaa' }}>人数:</span>
                        <span style={{ 
                          color: table.player_count >= table.max_players ? '#dc3545' : '#28a745',
                          fontWeight: '500'
                        }}>
                          {table.player_count || 0}/{table.max_players}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
                        <span style={{ color: '#aaa' }}>买入:</span>
                        <span style={{ color: '#fff' }}>
                          {table.min_buy_in}-{table.max_buy_in}
                        </span>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem'
                      }}>
                        <span style={{ color: '#aaa' }}>房主:</span>
                        <span style={{ color: '#aaa' }}>
                          {table.owner_name}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleJoinTable(table)}
                    disabled={table.player_count >= table.max_players}
                    style={{
                      padding: '0.75rem 2rem',
                      background: table.player_count >= table.max_players 
                        ? '#444' 
                        : 'linear-gradient(90deg, #007bff 0%, #0056b3 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      cursor: table.player_count >= table.max_players ? 'not-allowed' : 'pointer',
                      fontWeight: '500',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      marginLeft: '1.5rem'
                    }}
                    onMouseEnter={(e) => {
                      if (table.player_count < table.max_players) {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    {table.player_count >= table.max_players ? '已满' : '加入'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 style={{ 
              marginBottom: '1.5rem',
              fontSize: '1.3rem',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ color: '#ffd700' }}>🏆</span>
              今日排行榜
            </h2>
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              {leaderboard?.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderBottom: index < leaderboard.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                    background: player.id === user?.id 
                      ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)' 
                      : 'transparent',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (player.id !== user?.id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = player.id === user?.id 
                      ? 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)' 
                      : 'transparent';
                  }}
                >
                  <span style={{
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: index < 3 ? '50%' : '6px',
                    background: index === 0 
                      ? 'linear-gradient(135deg, #ffd700 0%, #ffb700 100%)' 
                      : index === 1 
                        ? 'linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%)' 
                        : index === 2 
                          ? 'linear-gradient(135deg, #cd7f32 0%, #a06022 100%)' 
                          : 'rgba(255, 255, 255, 0.05)',
                    color: index < 3 ? '#000' : '#666',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    boxShadow: index < 3 ? '0 2px 8px rgba(0, 0, 0, 0.3)' : 'none'
                  }}>
                    {index + 1}
                  </span>
                  <span style={{ 
                    flex: 1, 
                    color: player.id === user?.id ? '#ffd700' : '#ddd',
                    fontWeight: player.id === user?.id ? '600' : '400'
                  }}>
                    {player.username}
                  </span>
                  <span style={{ 
                    color: player.net_chips >= 0 ? '#28a745' : '#dc3545',
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    {player.net_chips >= 0 ? '+' : ''}{player.net_chips?.toLocaleString() || 0}
                  </span>
                </div>
              ))}
              {(!leaderboard || leaderboard.length === 0) && (
                <div style={{ 
                  padding: '3rem 2rem', 
                  textAlign: 'center', 
                  color: '#666'
                }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎯</div>
                  暂无排行榜数据
                  <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#555' }}>
                    开始游戏来登上排行榜吧！
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
            padding: '2rem',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
            animation: 'scaleIn 0.2s ease-out'
          }}>
            <h2 style={{ 
              marginBottom: '1.5rem',
              color: '#ffd700',
              fontSize: '1.4rem'
            }}>创建新牌桌</h2>
            
            <form onSubmit={handleCreateTable}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd' }}>牌桌名称</label>
                <input
                  type="text"
                  value={newTable.name}
                  onChange={(e) => setNewTable({ ...newTable, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#fff',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  placeholder="输入牌桌名称"
                  required
                  onFocus={(e) => {
                    e.target.style.borderColor = 'rgba(255, 215, 0, 0.5)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd' }}>小盲注</label>
                  <input
                    type="number"
                    value={newTable.small_blind}
                    onChange={(e) => setNewTable({ ...newTable, small_blind: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd' }}>大盲注</label>
                  <input
                    type="number"
                    value={newTable.big_blind}
                    onChange={(e) => setNewTable({ ...newTable, big_blind: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd' }}>最大人数</label>
                  <select
                    value={newTable.max_players}
                    onChange={(e) => setNewTable({ ...newTable, max_players: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  >
                    {[2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <option key={n} value={n}>{n} 人</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd' }}>最低买入</label>
                  <input
                    type="number"
                    value={newTable.min_buy_in}
                    onChange={(e) => setNewTable({ ...newTable, min_buy_in: parseInt(e.target.value) || 0 })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ddd', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newTable.is_private}
                    onChange={(e) => setNewTable({ ...newTable, is_private: e.target.checked })}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#ffd700'
                    }}
                  />
                  设为私密房间
                </label>
              </div>
              
              {newTable.is_private && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ddd' }}>房间密码</label>
                  <input
                    type="password"
                    value={newTable.password}
                    onChange={(e) => setNewTable({ ...newTable, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                    placeholder="输入房间密码"
                  />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#ddd',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: 'linear-gradient(90deg, #28a745 0%, #218838 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.02)';
                    e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DailyQuestPanel 
        isOpen={showQuestPanel} 
        onClose={() => setShowQuestPanel(false)} 
      />

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.2);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default Lobby;
