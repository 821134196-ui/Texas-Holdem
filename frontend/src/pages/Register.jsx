import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/authSlice';
import { initSocket } from '../services/socket';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
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
    setLocalError('');
    
    if (password !== confirmPassword) {
      setLocalError('两次输入的密码不一致');
      return;
    }
    
    if (password.length < 6) {
      setLocalError('密码长度至少为6位');
      return;
    }
    
    const resultAction = await dispatch(register({ username, email, password }));
    
    if (register.fulfilled.match(resultAction)) {
      initSocket(resultAction.payload.token);
      navigate('/lobby');
    }
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '2rem',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          ♠ Texas Hold'em Poker
        </h1>
        
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#aaa' }}>
          注册新账号
        </h2>
        
        {(error || localError) && (
          <div style={{
            background: 'rgba(220, 53, 69, 0.3)',
            border: '1px solid #dc3545',
            color: '#ff6b6b',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error || localError}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #444',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '1rem'
              }}
              placeholder="输入用户名"
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              邮箱
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #444',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '1rem'
              }}
              placeholder="输入邮箱地址"
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #444',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '1rem'
              }}
              placeholder="输入密码 (至少6位)"
              required
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>
              确认密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '4px',
                border: '1px solid #444',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#fff',
                fontSize: '1rem'
              }}
              placeholder="再次输入密码"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '4px',
          fontSize: '0.9rem',
          color: '#aaa'
        }}>
          <p>注册成功将获得初始筹码: <span style={{ color: '#ffd700' }}>10,000</span> 筹码</p>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <span style={{ color: '#aaa' }}>已有账号? </span>
          <Link to="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
