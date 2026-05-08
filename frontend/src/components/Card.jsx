import React from 'react';

const SUIT_COLORS = {
  '♠': '#000',
  '♣': '#000',
  '♥': '#dc3545',
  '♦': '#dc3545'
};

const Card = ({ card, faceDown = false, small = false, large = false, animate = false }) => {
  const getCardSize = () => {
    if (large) return { w: '80px', h: '112px', r: '8px' };
    if (small) return { w: '30px', h: '40px', r: '3px' };
    return { w: '60px', h: '84px', r: '6px' };
  };
  const sz = getCardSize();

  if (!card) {
    return (
      <div style={{
        width: sz.w,
        height: sz.h,
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: sz.r,
        border: '1px dashed rgba(255, 255, 255, 0.2)'
      }} />
    );
  }

  if (faceDown) {
    return (
      <div style={{
        width: sz.w,
        height: sz.h,
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        borderRadius: sz.r,
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
  const pad = large ? '6px' : small ? '2px' : '4px';
  const valFs = large ? '18px' : small ? '10px' : '14px';
  const suitFs = large ? '12px' : small ? '8px' : '10px';
  const bigSuitFs = large ? '32px' : small ? '16px' : '24px';
  const bdr = small ? '1px solid #ddd' : '2px solid #ccc';

  return (
    <div style={{
      width: sz.w,
      height: sz.h,
      background: '#fff',
      borderRadius: sz.r,
      border: bdr,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: pad,
      color: isRed ? '#dc3545' : '#000',
      fontFamily: 'Arial, sans-serif',
      transition: animate ? 'transform 0.3s ease' : 'none'
    }}>
      <div style={{
        fontSize: valFs,
        fontWeight: 'bold',
        lineHeight: 1
      }}>
        {card.value}
        <div style={{ fontSize: suitFs }}>{card.suit}</div>
      </div>
      <div style={{
        fontSize: bigSuitFs,
        textAlign: 'center'
      }}>
        {card.suit}
      </div>
      <div style={{
        fontSize: valFs,
        fontWeight: 'bold',
        lineHeight: 1,
        transform: 'rotate(180deg)',
        alignSelf: 'flex-end'
      }}>
        {card.value}
        <div style={{ fontSize: suitFs }}>{card.suit}</div>
      </div>
    </div>
  );
};

export default Card;
