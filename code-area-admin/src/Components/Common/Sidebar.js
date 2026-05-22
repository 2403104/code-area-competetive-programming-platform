import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const navItems = [
  { icon: '🏠', label: 'Dashboard', path: '/' },
  { icon: '🏆', label: 'Contests', path: '/contests' },
  { icon: '📋', label: 'Problems', path: '/problems' },
];

const Sidebar = () => {
  const { adminUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>⚡ CodeArea</h2>
        <p>Admin Portal</p>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {adminUser?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="user-info">
            <div className="name">{adminUser?.username || 'Admin'}</div>
            <div className="role">Administrator</div>
          </div>
        </div>
        <button
          className="btn btn-secondary w-full mt-8"
          style={{ justifyContent: 'center', marginTop: '10px' }}
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
