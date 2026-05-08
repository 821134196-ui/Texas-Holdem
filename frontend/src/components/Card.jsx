import React from 'react';

const SUIT_COLORS = {
  '♠': '#000',
  '♣': '#000',
  '♥': '#dc3545',
  '♦': '#dc3545'
};

const Card = ({ card, faceDown = false, small = false, large = false, animate = false }) => {
  const getSize = () => {
    if (small) return { width: '30px', height: '40px', borderRadius: '3px', borderSmall: true };
    if (large) return { width: '80px', height: '112px', borderRadius: '8px', borderSmall: false };
    return { width: '60px', height: '84px', borderRadius: '6px', borderSmall: false };
  };
  
  const getFontSize = () => {
    if (small) return { value: '10px', suit: '8px', center: '16px' };
    if (large) return { value: '18px', suit: '14px', center: '32px' };
    return { value: '14px', suit: '10px', center: '24px' };
  };
  
  const size = getSize();
  const fontSize = getFontSize();
  
  if (!card) {
    return (
      <div style={{
        width: size.width,
        height: size.height,
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: size.borderRadius,
        border: '1px dashed rgba(255, 255, 255, 0.2)'
      }} />
    );
  }
  
  if (faceDown) {
    return (
      <div style={{
        width: size.width,
        height: size.height,
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        borderRadius: size.borderRadius,
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
      width: size.width,
      height: size.height,
      background: '#fff',
      borderRadius: size.borderRadius,
      border: size.borderSmall ? '1px solid #ddd' : '2px solid #ccc',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: small ? '2px' : (large ? '6px' : '4px'),
      color: isRed ? '#dc3545' : '#000',
      fontFamily: 'Arial, sans-serif',
      transition: animate ? 'transform 0.3s ease' : 'none'
    }}>
      <div style={{
        fontSize: fontSize.value,
        fontWeight: 'bold',
        lineHeight: 1
      }}>
        {card.value}
        <div style={{ fontSize: fontSize.suit }}>{card.suit}</div>
      </div>
      <div style={{
        fontSize: fontSize.center,
        textAlign: 'center'
      }}>
        {card.suit}
      </div>
      <div style={{
        fontSize: fontSize.value,
        fontWeight: 'bold',
        lineHeight: 1,
        transform: 'rotate(180deg)',
        alignSelf: 'flex-end'
      }}>
        {card.value}
        <div style={{ fontSize: fontSize.suit }}>{card.suit}</div>
      </div>
    </div>
  );
};

export default Card;
