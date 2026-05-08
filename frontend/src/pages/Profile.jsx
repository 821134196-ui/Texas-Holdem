import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getRecentGames, getLeaderboard } from '../store/authSlice';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, games, leaderboard, loading } = useSelector(state => state.auth);
  const [period, setPeriod] = useState('today');
  
  useEffect(() => {
    dispatch(getRecentGames(50));
    dispatch(getLeaderboard(period));
  }, [dispatch, period]);
  
  const generateChartData = () => {
    if (!games || games.length === 0) return [];
    
    let cumulative = 0;
    return games.slice().reverse().map((game, index) => {
      cumulative += game.net_chips || 0;
      return {
        name: `局 ${index + 1}`,
        chips: cumulative,
        profit: game.net_chips || 0
      };
    });
  };
  
  const chartData = generateChartData();
  
  const getResultColor = (netChips) => {
    if (netChips > 0) return '#28a745';
    if (netChips < 0) return '#dc3545';
    return '#666';
  };
  
  const formatCards = (cards) => {
    if (!cards || cards.length === 0) return '未摊牌';
    return cards.map(c => `${c.value}${c.suit}`).join(' ');
  };
  
  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>个人中心</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '12px',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #007bff, #0056b3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            margin: '0 auto 1rem'
          }}>
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>{user?.username}</h2>
          <p style={{ color: '#aaa', marginBottom: '1rem' }}>{user?.email}</p>
          
          <div style={{
            fontSize: '2rem',
            color: '#ffd700',
            fontWeight: 'bold',
            marginBottom: '1.5rem'
          }}>
            💰 {user?.chips?.toLocaleString() || 0}
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1rem',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa' }}>总局数</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                {user?.stats?.total_games || 0}
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1rem',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa' }}>胜率</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                {user?.stats?.total_games > 0 
                  ? ((user.stats.wins / user.stats.total_games) * 100).toFixed(1) 
                  : 0}%
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1rem',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa' }}>胜场</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                {user?.stats?.wins || 0}
              </div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '1rem',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa' }}>净盈亏</div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: (user?.stats?.total_net_chips || 0) >= 0 ? '#28a745' : '#dc3545'
              }}>
                {(user?.stats?.total_net_chips || 0) >= 0 ? '+' : ''}
                {(user?.stats?.total_net_chips || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
        
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '12px',
          padding: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>盈亏曲线</h3>
          
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a2e',
                    border: '1px solid #444',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="chips"
                  stroke="#ffd700"
                  strokeWidth={2}
                  dot={{ fill: '#ffd700', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{
              height: '300px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
              暂无游戏数据
            </div>
          )}
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3>排行榜</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setPeriod('today')}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: period === 'today' ? '#007bff' : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                今日
              </button>
              <button
                onClick={() => setPeriod('week')}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: period === 'week' ? '#007bff' : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                本周
              </button>
              <button
                onClick={() => setPeriod('all')}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: period === 'all' ? '#007bff' : 'rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                全部
              </button>
            </div>
          </div>
          
          <div>
            {leaderboard?.map((player, index) => (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: player.id === user?.id ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  border: player.id === user?.id ? '1px solid rgba(255, 215, 0, 0.3)' : 'none'
                }}
              >
                <span style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#666',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: '0.9rem'
                }}>
                  {index + 1}
                </span>
                <span style={{ flex: 1 }}>{player.username}</span>
                <span style={{
                  color: (player.net_chips || 0) >= 0 ? '#28a745' : '#dc3545',
                  fontWeight: 'bold'
                }}>
                  {(player.net_chips || 0) >= 0 ? '+' : ''}
                  {(player.net_chips || 0).toLocaleString()}
                </span>
              </div>
            ))}
            {(!leaderboard || leaderboard.length === 0) && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                暂无排行榜数据
              </div>
            )}
          </div>
        </div>
        
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>最近 50 局</h3>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {games?.map((game, index) => (
              <div
                key={game.id || index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#aaa', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    {new Date(game.created_at).toLocaleString('zh-CN')}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#888' }}>
                    手牌: {formatCards(game.hole_cards)}
                  </div>
                </div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: getResultColor(game.net_chips)
                }}>
                  {game.net_chips >= 0 ? '+' : ''}
                  {game.net_chips?.toLocaleString() || 0}
                </div>
              </div>
            ))}
            {(!games || games.length === 0) && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                暂无游戏记录
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
