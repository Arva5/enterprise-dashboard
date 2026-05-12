import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard', roles: ['admin', 'hr', 'employee'] },
    { path: '/users', icon: '👥', label: 'Users', roles: ['admin', 'hr'] },
    { path: '/leaves', icon: '📅', label: 'Leaves', roles: ['admin', 'hr', 'employee'] },
    { path: '/payroll', icon: '💰', label: 'Payroll', roles: ['admin', 'hr', 'employee'] },
    { path: '/profile', icon: '👤', label: 'Profile', roles: ['admin', 'hr', 'employee'] }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="layout">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>🏢 Enterprise</h2>
        </div>

        <nav className="sidebar-nav">
          {filteredMenu.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.firstName?.[0]}{user.lastName?.[0]}</div>
            <div className="user-details">
              <p className="user-name">{user.firstName} {user.lastName}</p>
              <p className="user-role">{user.role}</p>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <button 
          className="sidebar-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          ☰
        </button>
        {children}
      </main>
    </div>
  );
}

export default Layout;