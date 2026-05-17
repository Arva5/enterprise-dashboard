import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingLeaves: 0,
    totalPayroll: 0,
    activeEmployees: 0
  });

  useEffect(() => {
    fetchUserData();
    fetchStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
      localStorage.setItem('user', JSON.stringify(response.data.data));
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch users
      const usersRes = await api.get('/users');
      const users = usersRes.data.data;

      // Fetch leaves
      const leavesRes = await api.get('/leaves');
      const leaves = leavesRes.data.data;
      const pendingLeaves = leaves.filter(l => l.status === 'pending').length;

      setStats({
        totalUsers: users.length,
        pendingLeaves,
        activeEmployees: users.filter(u => u.isActive).length,
        totalPayroll: users.length * 50000 // Mock calculation
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {user.firstName}! 👋</h1>
            <p>Here's what's happening in your company today</p>
          </div>
          <div className="user-badge">
            <span className={`role-badge role-${user.role}`}>
              {user.role.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-blue">
              <i className="icon">👥</i>
            </div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-green">
              <i className="icon">✓</i>
            </div>
            <div className="stat-content">
              <h3>{stats.activeEmployees}</h3>
              <p>Active Employees</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-orange">
              <i className="icon">📋</i>
            </div>
            <div className="stat-content">
              <h3>{stats.pendingLeaves}</h3>
              <p>Pending Leaves</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon bg-purple">
              <i className="icon">💰</i>
            </div>
            <div className="stat-content">
              <h3>${stats.totalPayroll.toLocaleString()}</h3>
              <p>Monthly Payroll</p>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {(user.role === 'admin' || user.role === 'hr') && (
              <button className="action-btn" onClick={() => navigate('/users')}>
                <span className="action-icon">👤</span>
                <span>Manage Users</span>
              </button>
            )}
            
            <button className="action-btn" onClick={() => navigate('/leaves')}>
              <span className="action-icon">📅</span>
              <span>Leave Requests</span>
            </button>

            {(user.role === 'admin' || user.role === 'hr') && (
              <button className="action-btn" onClick={() => navigate('/payroll')}>
                <span className="action-icon">💵</span>
                <span>Payroll</span>
              </button>
            )}

            <button className="action-btn" onClick={() => navigate('/profile')}>
              <span className="action-icon">⚙️</span>
              <span>My Profile</span>
            </button>
          </div>
        </div>

        <div className="role-permissions">
          <h2>Your Permissions</h2>
          <div className="permissions-list">
            {user.role === 'admin' && (
              <>
                <span className="permission-badge">✓ Full System Access</span>
                <span className="permission-badge">✓ User Management</span>
                <span className="permission-badge">✓ Approve/Reject Leaves</span>
                <span className="permission-badge">✓ Payroll Management</span>
                <span className="permission-badge">✓ View Audit Logs</span>
              </>
            )}
            {user.role === 'hr' && (
              <>
                <span className="permission-badge">✓ View Users</span>
                <span className="permission-badge">✓ Update User Info</span>
                <span className="permission-badge">✓ Approve/Reject Leaves</span>
                <span className="permission-badge">✓ Payroll Management</span>
              </>
            )}
            {user.role === 'employee' && (
              <>
                <span className="permission-badge">✓ View Own Profile</span>
                <span className="permission-badge">✓ Submit Leave Requests</span>
                <span className="permission-badge">✓ View Own Payslips</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
