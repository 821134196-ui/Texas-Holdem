import React, { useState, useEffect } from 'react';

const ActionPanel = ({
  gameState,
  myPlayer,
  onAction,
  disabled
}) => {
  const [raiseAmount, setRaiseAmount] = useState(0);
  
  const callAmount = gameState?.call_amount || 0;
  const minRaise = gameState?.min_raise_amount || gameState?.current_bet + 20;
  const maxRaise = myPlayer?.chips || 0;
  const currentBet = gameState?.current_bet || 0;
  const pot = gameState?.pot || 0;
  
  useEffect(() => {
    if (gameState) {
      setRaiseAmount(Math.min(minRaise, maxRaise));
    }
  }, [gameState, minRaise, maxRaise]);
  
  const handleFold = () => {
    onAction('fold');
  };
  
  const handleCheck = () => {
    onAction('check');
  };
  
  const handleCall = () => {
    onAction('call');
  };
  
  const handleRaise = () => {
    onAction('raise', raiseAmount);
  };
  
  const handleAllIn = () => {
    onAction('all-in');
  };
  
  const handleSetRaise = (amount) => {
    setRaiseAmount(Math.max(minRaise, Math.min(amount, maxRaise + callAmount)));
  };
  
  const canCheck = callAmount === 0;
  const canCall = callAmount > 0 && myPlayer?.chips > 0;
  const canRaise = myPlayer?.chips > callAmount;
  const canAllIn = myPlayer?.chips > 0;
  
  const halfPot = currentBet + Math.floor(pot / 2);
  const fullPot = currentBet + pot;
  
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '12px',
      padding: '1.5rem',
      maxWidth: '500px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <div>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>奖池: </span>
          <span style={{ color: '#ffd700', fontSize: '1.2rem', fontWeight: 'bold' }}>
            💰 {pot?.toLocaleString() || 0}
          </span>
        </div>
        <div>
          <span style={{ color: '#aaa', fontSize: '0.9rem' }}>你的筹码: </span>
          <span style={{ color: '#28a745', fontSize: '1.2rem', fontWeight: 'bold' }}>
            {myPlayer?.chips?.toLocaleString() || 0}
          </span>
        </div>
      </div>
      
      {canRaise && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '0.9rem', color: '#aaa' }}>加注金额:</span>
            <input
              type="number"
              value={raiseAmount}
              onChange={(e) => handleSetRaise(parseInt(e.target.value) || 0)}
              style={{
                width: '100px',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #444',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '1rem',
                textAlign: 'center'
              }}
              min={minRaise}
              max={maxRaise + callAmount}
            />
          </div>
          
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => handleSetRaise(minRaise)}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.8rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              最小
            </button>
            <button
              onClick={() => handleSetRaise(Math.max(minRaise, currentBet + Math.floor(pot / 2)))}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.8rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              1/2 池
            </button>
            <button
              onClick={() => handleSetRaise(Math.max(minRaise, currentBet + pot))}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.8rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Pot
            </button>
            <button
              onClick={handleAllIn}
              style={{
                padding: '0.25rem 0.75rem',
                fontSize: '0.8rem',
                background: 'rgba(255, 107, 107, 0.2)',
                color: '#ff6b6b',
                border: '1px solid #ff6b6b',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              All-in
            </button>
          </div>
          
          <input
            type="range"
            min={minRaise}
            max={maxRaise + callAmount}
            value={raiseAmount}
            onChange={(e) => handleSetRaise(parseInt(e.target.value))}
            style={{
              width: '100%',
              marginTop: '0.5rem'
            }}
          />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#666',
            marginTop: '0.25rem'
          }}>
            <span>最小: {minRaise}</span>
            <span>最大: {maxRaise + callAmount}</span>
          </div>
        </div>
      )}
      
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleFold}
          disabled={disabled}
          style={{
            flex: 1,
            minWidth: '80px',
            padding: '0.75rem',
            background: '#dc3545',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1
          }}
        >
          弃牌
        </button>
        
        {canCheck ? (
          <button
            onClick={handleCheck}
            disabled={disabled}
            style={{
              flex: 1,
              minWidth: '80px',
              padding: '0.75rem',
              background: '#17a2b8',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1
            }}
          >
            过牌
          </button>
        ) : (
          <button
            onClick={handleCall}
            disabled={disabled || !canCall}
            style={{
              flex: 1,
              minWidth: '80px',
              padding: '0.75rem',
              background: canCall ? '#ffc107' : '#666',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: (disabled || !canCall) ? 'not-allowed' : 'pointer',
              opacity: (disabled || !canCall) ? 0.5 : 1
            }}
          >
            跟注 {callAmount > 0 ? `(${callAmount})` : ''}
          </button>
        )}
        
        {canRaise && (
          <button
            onClick={handleRaise}
            disabled={disabled}
            style={{
              flex: 1,
              minWidth: '80px',
              padding: '0.75rem',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1
            }}
          >
            加注 ({raiseAmount})
          </button>
        )}
      </div>
    </div>
  );
};

export default ActionPanel;
