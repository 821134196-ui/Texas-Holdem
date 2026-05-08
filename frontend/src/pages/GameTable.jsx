import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Card from '../components/Card';
import PlayerSeat from '../components/PlayerSeat';
import ActionPanel from '../components/ActionPanel';
import Chat from '../components/Chat';
import { socketActions } from '../services/socket';
import { clearGameState, addChatMessage } from '../store/gameSlice';

const GameTable = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const [joined, setJoined] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useSelector(state => state.auth);
  const { gameState, chatMessages, handResult } = useSelector(state => state.game);
  
  const tableId = parseInt(id);
  const password = location.state?.password;
  const buyIn = location.state?.buyIn || 1000;
  
  useEffect(() => {
    return () => {
      dispatch(clearGameState());
    };
  }, [dispatch]);
  
  const joinTable = useCallback(() => {
    socketActions.joinTable(tableId, password, buyIn, (response) => {
      if (response.success) {
        setJoined(true);
        setError('');
      } else {
        setError(response.error || '加入牌桌失败');
      }
    });
  }, [tableId, password, buyIn]);
  
  useEffect(() => {
    joinTable();
  }, [joinTable]);
  
  const handleLeaveTable = () => {
    socketActions.leaveTable(() => {
      dispatch(clearGameState());
      navigate('/lobby');
    });
  };
  
  const handleStartGame = () => {
    socketActions.startGame((response) => {
      if (response.success) {
        setGameStarted(true);
      }
    });
  };
  
  const handleAction = (action, amount) => {
    socketActions.playerAction(action, amount, (response) => {
      if (!response.success) {
        setError(response.error);
      }
    });
  };
  
  const handleSendMessage = (message) => {
    socketActions.sendMessage(message, (response) => {
      if (!response.success) {
        setError(response.error || '发送消息失败');
      }
    });
  };
  
  const getPhaseText = (phase) => {
    switch (phase) {
      case 'preflop': return '翻牌前';
      case 'flop': return '翻牌';
      case 'turn': return '转牌';
      case 'river': return '河牌';
      case 'showdown': return '摊牌';
      case 'complete': return '结束';
      default: return '';
    }
  };
  
  const myPlayer = gameState?.players?.find(p => p.user_id === user?.id);
  const isSpectator = gameState?.players && !gameState.players.some(p => p.user_id === user?.id);
  const isMyTurn = gameState?.your_turn;

  const MAX_PLAYERS = 9;
  const TABLE_W = 700;
  const TABLE_H = 500;
  const CENTER_X = TABLE_W / 2;
  const CENTER_Y = TABLE_H / 2;
  const RADIUS_X = 280;
  const RADIUS_Y_TOP = 130;
  const RADIUS_Y_BOTTOM = 200;

  const getSeatPositions = () => {
    const players = gameState?.players || [];
    const maxPlayers = Math.max(players.length, 2);
    const mySeat = myPlayer ? myPlayer.seat_position : -1;

    const positions = {};

    players.forEach((player) => {
      let localIndex;
      if (isSpectator || mySeat === -1) {
        localIndex = player.seat_position;
      } else {
        localIndex = (player.seat_position - mySeat + MAX_PLAYERS) % MAX_PLAYERS;
      }

      let angle;
      if (isSpectator || mySeat === -1) {
        angle = (Math.PI * 2 * localIndex) / maxPlayers - Math.PI / 2;
      } else {
        angle = (Math.PI * 2 * localIndex) / maxPlayers + Math.PI / 2;
      }

      const sinA = Math.sin(angle);
      const radiusY = sinA >= 0 ? RADIUS_Y_BOTTOM : RADIUS_Y_TOP;

      positions[player.seat_position] = {
        x: CENTER_X + RADIUS_X * Math.cos(angle),
        y: CENTER_Y + radiusY * sinA,
        seatIndex: player.seat_position,
        localIndex
      };
    });

    return positions;
  };

  const seatPositions = getSeatPositions();

  const renderSelfSeat = (player) => {
    const isCurrentPlayer = player.is_turn;
    const isDealer = gameState?.dealer_position === player.seat_position;
    const isFolded = player.status === 'folded';
    const isAllIn = player.status === 'all-in';

    const getStatusText = () => {
      if (player.status === 'waiting') return '等待中';
      if (isFolded) return '弃牌';
      if (isAllIn) return 'All-in';
      if (player.last_action === 'fold') return '弃牌';
      if (player.last_action === 'check') return '过牌';
      if (player.last_action === 'call') return '跟注';
      if (player.last_action === 'raise') return '加注';
      if (player.last_action === 'all-in') return 'All-in';
      if (player.last_action === 'small_blind') return '小盲';
      if (player.last_action === 'big_blind') return '大盲';
      return '';
    };

    return (
      <div
        key={player.user_id}
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: player.is_turn ? 20 : 15,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0, 40, 30, 0.85)',
          border: isCurrentPlayer ? '2px solid #ffd700' : '2px solid rgba(255,255,255,0.15)',
          borderRadius: '12px',
          padding: '8px 16px',
          width: '280px',
          boxShadow: isCurrentPlayer ? '0 0 20px rgba(255, 215, 0, 0.5)' : '0 4px 12px rgba(0,0,0,0.5)'
        }}
      >
        {isDealer && (
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '-10px',
            width: '24px',
            height: '24px',
            background: 'white',
            color: '#000',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            zIndex: 10
          }}>
            D
          </div>
        )}

        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #007bff, #0056b3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          flexShrink: 0,
          boxShadow: isCurrentPlayer ? '0 0 15px rgba(255, 215, 0, 0.8)' : '0 2px 8px rgba(0,0,0,0.5)',
          border: isCurrentPlayer ? '3px solid #ffd700' : '2px solid rgba(255,255,255,0.3)',
          transform: 'scale(1.15)'
        }}>
          {player.avatar || player.username.charAt(0).toUpperCase()}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          minWidth: 0,
          flex: '0 0 auto'
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '80px'
          }}>
            {player.username}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#ffd700'
          }}>
            💰 {player.chips?.toLocaleString() || 0}
          </div>
          {getStatusText() && (
            <div style={{
              fontSize: '10px',
              color: isFolded ? '#666' : isAllIn ? '#ff6b6b' : '#fff',
              fontStyle: isFolded ? 'italic' : 'normal',
              opacity: isFolded ? 0.6 : 1
            }}>
              {getStatusText()}
            </div>
          )}
        </div>

        {player.hole_cards && player.hole_cards.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '4px',
            marginLeft: 'auto',
            flexShrink: 0
          }}>
            {player.hole_cards.map((card, idx) => (
              <div key={idx} style={{ transform: `rotate(${idx === 0 ? -3 : 3}deg)` }}>
                <Card card={card} large />
              </div>
            ))}
          </div>
        )}

        {player.bet > 0 && (
          <div style={{
            position: 'absolute',
            top: '-22px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '2px 10px',
            background: 'rgba(255, 215, 0, 0.2)',
            borderRadius: '10px',
            fontSize: '11px',
            color: '#ffd700',
            whiteSpace: 'nowrap'
          }}>
            {player.bet?.toLocaleString() || 0}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f4c3a, #0a2e21)',
      padding: '1rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div>
          <button
            onClick={handleLeaveTable}
            style={{
              padding: '0.5rem 1rem',
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← 离开牌桌
          </button>
          {gameState?.phase && (
            <span style={{ marginLeft: '1rem', color: '#ffd700' }}>
              当前阶段: {getPhaseText(gameState.phase)}
            </span>
          )}
        </div>
        
        {gameState && gameState.players?.length >= 2 && !gameStarted && gameState.phase === 'preflop' && gameState.community_cards?.length === 0 && (
          <button
            onClick={handleStartGame}
            style={{
              padding: '0.75rem 2rem',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              cursor: 'pointer'
            }}
          >
            🎮 开始游戏
          </button>
        )}
      </div>
      
      {error && (
        <div style={{
          background: 'rgba(220, 53, 69, 0.2)',
          border: '1px solid #dc3545',
          color: '#ff6b6b',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}
      
      {!joined && (
        <div style={{
          textAlign: 'center',
          padding: '4rem',
          color: '#aaa'
        }}>
          正在加入牌桌...
        </div>
      )}
      
      {joined && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 300px',
          gap: '1rem'
        }}>
          <div style={{
            position: 'relative',
            width: `${TABLE_W}px`,
            height: `${TABLE_H}px`,
            margin: '0 auto'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '560px',
              height: '320px',
              background: 'linear-gradient(145deg, #0f4c3a, #0a3d2e, #064d36)',
              borderRadius: '50%',
              border: '15px solid #5d4037',
              boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <div style={{
                position: 'absolute',
                top: '38%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {gameState?.community_cards?.map((card, idx) => (
                    <Card key={idx} card={card} animate />
                  ))}
                  {gameState?.community_cards?.length === 0 && (
                    <>
                      <Card />
                      <Card />
                      <Card />
                      <Card />
                      <Card />
                    </>
                  )}
                </div>
                
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#ffd700',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                  💰 奖池: {gameState?.pot?.toLocaleString() || 0}
                </div>
              </div>
            </div>
            
            {!isSpectator && myPlayer && renderSelfSeat(myPlayer)}

            {gameState?.players?.filter(p => p.user_id !== user?.id || isSpectator).map((player) => {
              const pos = seatPositions[player.seat_position];
              if (!pos) return null;

              const isCurrentPlayer = player.is_turn;
              const isPlayerMyTurn = player.user_id === user?.id && player.is_turn;
              const isMyself = player.user_id === user?.id;

              return (
                <div
                  key={player.user_id}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: player.is_turn ? 20 : 10
                  }}
                >
                  <PlayerSeat
                    player={player}
                    isCurrentPlayer={isCurrentPlayer}
                    isDealer={gameState?.dealer_position === player.seat_position}
                    isMyTurn={isPlayerMyTurn}
                    isMyself={isMyself}
                  />
                </div>
              );
            })}
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {isMyTurn && (
              <ActionPanel
                gameState={gameState}
                myPlayer={myPlayer}
                onAction={handleAction}
                disabled={!isMyTurn}
              />
            )}
            
            {!isMyTurn && gameState && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.8)',
                borderRadius: '12px',
                padding: '1.5rem',
                textAlign: 'center',
                color: '#aaa'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
                <div>等待其他玩家行动...</div>
                <div style={{
                  marginTop: '0.5rem',
                  color: '#ffd700',
                  fontSize: '0.9rem'
                }}>
                  奖池: {gameState.pot?.toLocaleString() || 0} | 
                  你的筹码: {myPlayer?.chips?.toLocaleString() || 0}
                </div>
              </div>
            )}
            
            <div style={{ flex: 1, minHeight: '200px' }}>
              <Chat
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                disabled={false}
              />
            </div>
          </div>
        </div>
      )}
      
      {handResult && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1a2e',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#ffd700' }}>
              🏆 本局结束
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '0.5rem', color: '#aaa' }}>公共牌:</h3>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {handResult.community_cards?.map((card, idx) => (
                  <Card key={idx} card={card} />
                ))}
              </div>
            </div>
            
            <div style={{
              fontSize: '1.2rem',
              textAlign: 'center',
              marginBottom: '1.5rem',
              color: '#ffd700'
            }}>
              总奖池: 💰 {handResult.pot?.toLocaleString() || 0}
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#aaa' }}>胜负结果:</h3>
              {handResult.players?.map((player) => {
                const myWinnings = handResult.winnings?.[player.user_id] || 0;
                const isWinner = myWinnings > 0;
                
                return (
                  <div
                    key={player.user_id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem',
                      background: isWinner ? 'rgba(40, 167, 69, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      border: isWinner ? '1px solid #28a745' : 'none'
                    }}
                  >
                    <span style={{ fontWeight: 'bold', flex: 1 }}>
                      {player.username}
                      {isWinner && ' 🏆'}
                    </span>
                    
                    {player.hole_cards?.length > 0 && (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {player.hole_cards.map((card, idx) => (
                          <Card key={idx} card={card} small />
                        ))}
                      </div>
                    )}
                    
                    <span style={{
                      color: myWinnings > 0 ? '#28a745' : myWinnings < 0 ? '#dc3545' : '#666',
                      fontWeight: 'bold'
                    }}>
                      {myWinnings > 0 ? '+' : ''}{myWinnings.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <button
              onClick={() => dispatch({ type: 'game/setHandResult', payload: null })}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameTable;
