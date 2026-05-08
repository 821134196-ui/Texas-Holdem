import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { disconnectSocket } from '../services/socket';

const Layout = ({ children }) => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    dispatch(logout());
    disconnectSocket();
    navigate('/login');
  };
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
    }}>
      <header style={{
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(10px)',
        padding: '0.875rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 215, 0, 0.1)'
      }}>
        <Link to="/lobby" style={{ 
          textDecoration: 'none', 
          fontSize: '1.4rem',
          fontWeight: 'bold',
          background: 'linear-gradient(90deg, #ffd700 0%, #ffb700 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.6rem' }}>♠</span>
          Texas Hold'em Poker
        </Link>
        
        {isAuthenticated && (
          <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/lobby" style={{ 
              textDecoration: 'none', 
              color: '#ddd',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 215, 0, 0.1)';
              e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)';
              e.target.style.color = '#ffd700';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.target.style.color = '#ddd';
            }}
            >
              游戏大厅
            </Link>
            <Link to="/profile" style={{ 
              textDecoration: 'none', 
              color: '#ddd',
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              transition: 'all 0.2s',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255, 215, 0, 0.1)';
              e.target.style.borderColor = 'rgba(255, 215, 0, 0.2)';
              e.target.style.color = '#ffd700';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.05)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.target.style.color = '#ddd';
            }}
            >
              个人中心
            </Link>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1rem',
              background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 215, 0, 0.2)'
            }}>
              <span style={{ fontSize: '1.1rem' }}>💰</span>
              <span style={{ 
                color: '#ffd700', 
                fontWeight: 'bold',
                fontSize: '1.05rem'
              }}>
                {user?.chips?.toLocaleString() || 0}
              </span>
            </div>
            <div style={{
              padding: '0.5rem 0.75rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '6px',
              color: '#ddd',
              fontWeight: '500'
            }}>
              {user?.username}
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(90deg, #dc3545 0%, #c82333 100%)',
                color: '#fff',
                border: 'none',
                padding: '0.625rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.02)';
                e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }}
            >
              退出
            </button>
          </nav>
        )}
      </header>
      
      <main style={{ 
        flex: 1, 
        padding: '0',
        background: 'transparent'
      }}>
        {children}
      </main>
      
      <footer style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '1rem',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.4)',
        fontSize: '0.85rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        Texas Hold'em Poker © 2024 | 德州扑克在线游戏
      </footer>
    </div>
  );
};

export default Layout;
