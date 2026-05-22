import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './Components/Common/Layout';
import Login from './Components/Auth/Login';
import Register from './Components/Auth/Register';
import Dashboard from './Components/Admin/Dashboard';
import Contests from './Components/Contest/Contests';
import ManageContest from './Components/Contest/ManageContest';
import Problems from './Components/Problem/Problems';

const ProtectedRoute = ({ children }) => {
  const { adminUser, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <span className="spinner" style={{ width: '36px', height: '36px', borderWidth: '3px' }} />
    </div>
  );
  if (!adminUser) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  const { adminUser } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={adminUser ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={adminUser ? <Navigate to="/" replace /> : <Register />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/contests" element={<ProtectedRoute><Contests /></ProtectedRoute>} />
      <Route path="/contests/:id" element={<ProtectedRoute><ManageContest /></ProtectedRoute>} />
      <Route path="/problems" element={<ProtectedRoute><Problems /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;
