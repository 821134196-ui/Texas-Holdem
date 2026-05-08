import React, { useState, useRef, useEffect } from 'react';

const Chat = ({ messages, onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.8)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '200px'
    }}>
      <div style={{
        padding: '0.75rem 1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        fontWeight: 'bold'
      }}>
        💬 聊天
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.5rem',
        fontSize: '0.85rem'
      }}>
        {messages?.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            color: '#666', 
            padding: '2rem' 
          }}>
            暂无消息
          </div>
        )}
        
        {messages?.map((msg, idx) => (
          <div key={idx} style={{
            marginBottom: '0.5rem',
            padding: '0.25rem 0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                color: '#007bff', 
                fontWeight: 'bold' 
              }}>
                {msg.username || '玩家'}
              </span>
              <span style={{ 
                color: '#666', 
                fontSize: '0.75rem' 
              }}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
            <div style={{ 
              color: '#ccc',
              marginLeft: '0.25rem'
            }}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSend} style={{
        padding: '0.75rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="输入消息..."
          disabled={disabled}
          style={{
            flex: 1,
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #444',
            background: 'rgba(255, 255, 255, 0.05)',
            color: '#fff'
          }}
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          style={{
            padding: '0.5rem 1rem',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: (disabled || !message.trim()) ? 'not-allowed' : 'pointer',
            opacity: (disabled || !message.trim()) ? 0.5 : 1
          }}
        >
          发送
        </button>
      </form>
    </div>
  );
};

export default Chat;
