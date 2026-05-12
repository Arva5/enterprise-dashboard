import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    position: '',
    salary: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'employee',
      department: '',
      position: '',
      salary: '',
      phoneNumber: '',
      address: ''
    });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
      position: user.position || '',
      salary: user.salary || '',
      phoneNumber: user.phoneNumber || '',
      address: user.address || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Update
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        
        await api.put(`/users/${editingUser.id}`, updateData);
        alert('User updated successfully');
      } else {
        // Create
        await api.post('/auth/register', formData);
        alert('User created successfully');
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;

    try {
      await api.delete(`/users/${userId}`);
      alert('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="users-page">
        <div className="page-header">
          <div>
            <h1>Users Management</h1>
            <p>Manage employees and their permissions</p>
          </div>
          {currentUser.role === 'admin' && (
            <button className="btn btn-primary" onClick={handleCreateUser}>
              + Add User
            </button>
          )}
        </div>

        <div className="filters-bar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All ({users.length})
            </button>
            <button 
              className={filter === 'admin' ? 'active' : ''}
              onClick={() => setFilter('admin')}
            >
              Admin ({users.filter(u => u.role === 'admin').length})
            </button>
            <button 
              className={filter === 'hr' ? 'active' : ''}
              onClick={() => setFilter('hr')}
            >
              HR ({users.filter(u => u.role === 'hr').length})
            </button>
            <button 
              className={filter === 'employee' ? 'active' : ''}
              onClick={() => setFilter('employee')}
            >
              Employee ({users.filter(u => u.role === 'employee').length})
            </button>
          </div>
        </div>

        <div className="users-grid">
          {filteredUsers.map(user => (
            <div key={user.id} className="user-card">
              <div className="user-card-header">
                <div className="user-avatar">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div className="user-info">
                  <h3>{user.firstName} {user.lastName}</h3>
                  <p>{user.email}</p>
                </div>
                <span className={`role-badge role-${user.role}`}>
                  {user.role}
                </span>
              </div>

              <div className="user-details">
                {user.department && (
                  <div className="detail-item">
                    <span className="detail-label">Department:</span>
                    <span className="detail-value">{user.department}</span>
                  </div>
                )}
                {user.position && (
                  <div className="detail-item">
                    <span className="detail-label">Position:</span>
                    <span className="detail-value">{user.position}</span>
                  </div>
                )}
                {user.salary && currentUser.role === 'admin' && (
                  <div className="detail-item">
                    <span className="detail-label">Salary:</span>
                    <span className="detail-value">${parseFloat(user.salary).toLocaleString()}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="user-actions">
                <button className="btn-edit" onClick={() => handleEditUser(user)}>
                  Edit
                </button>
                {currentUser.role === 'admin' && user.id !== currentUser.id && (
                  <button className="btn-delete" onClick={() => handleDeleteUser(user.id)}>
                    Deactivate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>No users found</p>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled={editingUser}
                  />
                </div>

                <div className="form-group">
                  <label>Password {!editingUser && '*'}</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave blank to keep current' : ''}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Role *</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      disabled={currentUser.role !== 'admin'}
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      placeholder="Engineering"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Position</label>
                    <input
                      type="text"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="form-group">
                    <label>Salary</label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({...formData, salary: e.target.value})}
                      placeholder="50000"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    rows="3"
                    placeholder="123 Main St, City, State, ZIP"
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingUser ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Users;