import React from 'react';

const SUIT_COLORS = {
  '♠': '#000',
  '♣': '#000',
  '♥': '#dc3545',
  '♦': '#dc3545'
};

const Card = ({ card, faceDown = false, small = false, animate = false }) => {
  if (!card) {
    return (
      <div style={{
        width: small ? '30px' : '60px',
        height: small ? '40px' : '84px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: small ? '3px' : '6px',
        border: '1px dashed rgba(255, 255, 255, 0.2)'
      }} />
    );
  }
  
  if (faceDown) {
    return (
      <div style={{
        width: small ? '30px' : '60px',
        height: small ? '40px' : '84px',
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        borderRadius: small ? '3px' : '6px',
        border: '2px solid #444',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: animate ? 'transform 0.3s ease' : 'none'
      }}>
        <div style={{
          width: '70%',
          height: '80%',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: small ? '2px' : '4px',
          background: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255, 215, 0, 0.05) 5px, rgba(255, 215, 0, 0.05) 10px)'
        }} />
      </div>
    );
  }
  
  const isRed = card.suit === '♥' || card.suit === '♦';
  
  return (
    <div style={{
      width: small ? '30px' : '60px',
      height: small ? '40px' : '84px',
      background: '#fff',
      borderRadius: small ? '3px' : '6px',
      border: small ? '1px solid #ddd' : '2px solid #ccc',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: small ? '2px' : '4px',
      color: isRed ? '#dc3545' : '#000',
      fontFamily: 'Arial, sans-serif',
      transition: animate ? 'transform 0.3s ease' : 'none'
    }}>
      <div style={{
        fontSize: small ? '10px' : '14px',
        fontWeight: 'bold',
        lineHeight: 1
      }}>
        {card.value}
        <div style={{ fontSize: small ? '8px' : '10px' }}>{card.suit}</div>
      </div>
      <div style={{
        fontSize: small ? '16px' : '24px',
        textAlign: 'center'
      }}>
        {card.suit}
      </div>
      <div style={{
        fontSize: small ? '10px' : '14px',
        fontWeight: 'bold',
        lineHeight: 1,
        transform: 'rotate(180deg)',
        alignSelf: 'flex-end'
      }}>
        {card.value}
        <div style={{ fontSize: small ? '8px' : '10px' }}>{card.suit}</div>
      </div>
    </div>
  );
};

export default Card;
