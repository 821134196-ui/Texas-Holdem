import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getProfile } from './store/authSlice';
import Login from './pages/Login';
import Register from './pages/Register';
import Lobby from './pages/Lobby';
import GameTable from './pages/GameTable';
import Profile from './pages/Profile';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useSelector(state => state.auth);
  
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(getProfile());
    }
  }, [isAuthenticated, token, dispatch]);
  
  return (
    <div style={{ minHeight: '100vh' }}>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/lobby" replace /> : <Login />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/lobby" replace /> : <Register />
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Navigate to="/lobby" replace />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/lobby" element={
          <ProtectedRoute>
            <Layout>
              <Lobby />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/table/:id" element={
          <ProtectedRoute>
            <GameTable />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

export default App;
