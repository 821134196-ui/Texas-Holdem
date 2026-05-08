import React from 'react';
import Card from './Card';

const PlayerSeat = ({ player, isCurrentPlayer, isDealer, isMyTurn, isMyself, isSelfSeat = false, avatarScale = 1 }) => {
  const isFolded = player.status === 'folded';
  const isAllIn = player.status === 'all-in';
  const isWaiting = player.status === 'waiting';
  
  const getStatusText = () => {
    if (isWaiting) return '等待中';
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
  
  const getStatusColor = () => {
    if (isFolded) return '#666';
    if (isAllIn) return '#ff6b6b';
    if (isMyTurn) return '#ffd700';
    return '#fff';
  };
  
  const avatarSize = Math.round(50 * avatarScale);
  
  if (isSelfSeat) {
    return (
      <div style={{
        position: 'relative',
        width: '280px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        background: 'rgba(0, 123, 255, 0.2)',
        borderRadius: '12px',
        border: '2px solid rgba(0, 123, 255, 0.5)',
        boxShadow: isCurrentPlayer ? '0 0 15px rgba(255, 215, 0, 0.6)' : 'none'
      }}>
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
          width: `${avatarSize}px`,
          height: `${avatarSize}px`,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #007bff, #0056b3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${Math.round(20 * avatarScale)}px`,
          boxShadow: isCurrentPlayer ? '0 0 15px rgba(255, 215, 0, 0.8)' : '0 2px 8px rgba(0,0,0,0.5)',
          border: isCurrentPlayer ? '3px solid #ffd700' : '2px solid rgba(255,255,255,0.2)',
          flexShrink: 0
        }}>
          {player.avatar || player.username.charAt(0).toUpperCase()}
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          flex: 1,
          minWidth: 0
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 'bold',
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {player.username}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#ffd700'
          }}>
            💰 {player.chips?.toLocaleString() || 0}
          </div>
          {player.bet > 0 && (
            <div style={{
              padding: '2px 6px',
              background: 'rgba(255, 215, 0, 0.2)',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#ffd700',
              alignSelf: 'flex-start'
            }}>
              下注: {player.bet?.toLocaleString() || 0}
            </div>
          )}
          {getStatusText() && (
            <div style={{
              fontSize: '11px',
              color: getStatusColor(),
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
            flexShrink: 0
          }}>
            {player.hole_cards.map((card, idx) => (
              <div key={idx} style={{ transform: `rotate(${idx === 0 ? -3 : 3}deg)` }}>
                <Card card={card} large />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div style={{
      position: 'relative',
      width: '120px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
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
      
      {isCurrentPlayer && (
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          color: '#ffd700',
          animation: 'pulse 1s infinite'
        }}>
          思考中...
        </div>
      )}
      
      <div style={{
        width: `${avatarSize}px`,
        height: `${avatarSize}px`,
        borderRadius: '50%',
        background: isMyself ? 'linear-gradient(135deg, #007bff, #0056b3)' : 'linear-gradient(135deg, #666, #444)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${Math.round(20 * avatarScale)}px`,
        boxShadow: isCurrentPlayer ? '0 0 15px rgba(255, 215, 0, 0.8)' : '0 2px 8px rgba(0,0,0,0.5)',
        border: isCurrentPlayer ? '3px solid #ffd700' : '2px solid rgba(255,255,255,0.2)'
      }}>
        {player.avatar || player.username.charAt(0).toUpperCase()}
      </div>
      
      <div style={{
        marginTop: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        textAlign: 'center',
        maxWidth: '100px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {player.username}
      </div>
      
      <div style={{
        fontSize: '11px',
        color: '#ffd700',
        marginTop: '2px'
      }}>
        💰 {player.chips?.toLocaleString() || 0}
      </div>
      
      {player.bet > 0 && (
        <div style={{
          marginTop: '4px',
          padding: '2px 8px',
          background: 'rgba(255, 215, 0, 0.2)',
          borderRadius: '10px',
          fontSize: '11px',
          color: '#ffd700'
        }}>
          {player.bet?.toLocaleString() || 0}
        </div>
      )}
      
      {getStatusText() && (
        <div style={{
          marginTop: '2px',
          fontSize: '10px',
          color: getStatusColor(),
          fontStyle: isFolded ? 'italic' : 'normal',
          opacity: isFolded ? 0.6 : 1
        }}>
          {getStatusText()}
        </div>
      )}
      
      {player.hole_cards && player.hole_cards.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '4px',
          marginTop: '4px'
        }}>
          {player.hole_cards.map((card, idx) => (
            <Card key={idx} card={card} small />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerSeat;
