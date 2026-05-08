import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/authSlice';
import { initSocket } from '../services/socket';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, token } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (isAuthenticated && token) {
      initSocket(token);
      navigate('/lobby');
    }
  }, [isAuthenticated, token, navigate]);
  
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      return;
    }
    
    const resultAction = await dispatch(login({ username, password }));
    
    if (login.fulfilled.match(resultAction)) {
      initSocket(resultAction.payload.token);
      navigate('/lobby');
    }
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(180deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
        padding: '2.5rem',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 215, 0, 0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '0.5rem',
          background: 'linear-gradient(90deg, #ffd700 0%, #ffb700 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontSize: '1.8rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '2rem' }}>♠</span>
          Texas Hold'em Poker
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          德州扑克在线游戏
        </p>
        
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '1.5rem', 
          color: '#ddd',
          fontSize: '1.3rem',
          fontWeight: '500'
        }}>
          登录
        </h2>
        
        {error && (
          <div style={{
            background: 'rgba(220, 53, 69, 0.15)',
            border: '1px solid rgba(220, 53, 69, 0.4)',
            color: '#ff6b6b',
            padding: '0.875rem 1rem',
            borderRadius: '8px',
            marginBottom: '1.25rem',
            textAlign: 'center',
            fontSize: '0.95rem'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: '#ddd',
              fontWeight: '500'
            }}>
              用户名 / 邮箱
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              placeholder="输入用户名或邮箱"
              required
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255, 215, 0, 0.4)';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem',
              color: '#ddd',
              fontWeight: '500'
            }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s'
              }}
              placeholder="输入密码"
              required
              onFocus={(e) => {
                e.target.style.borderColor = 'rgba(255, 215, 0, 0.4)';
                e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.08)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading ? '#555' : 'linear-gradient(90deg, #28a745 0%, #218838 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'scale(1.01)';
                e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        
        <div style={{
          marginTop: '1.75rem',
          padding: '1.25rem',
          background: 'linear-gradient(90deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 215, 0, 0.02) 100%)',
          borderRadius: '8px',
          fontSize: '0.9rem',
          border: '1px solid rgba(255, 215, 0, 0.1)'
        }}>
          <p style={{ color: '#aaa', marginBottom: '0.5rem', fontWeight: '500' }}>测试账号:</p>
          <p style={{ color: '#ffd700', marginBottom: '0.25rem', fontWeight: '500' }}>player1 / player2 / player3</p>
          <p style={{ color: '#888' }}>密码: 123456</p>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
          <span style={{ color: '#888' }}>还没有账号? </span>
          <Link to="/register" style={{ 
            color: '#ffd700', 
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => { e.target.style.opacity = '0.8'; }}
          onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
          >
            立即注册 →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
