import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.data);
      setFormData({
        firstName: response.data.data.firstName,
        lastName: response.data.data.lastName,
        email: response.data.data.email,
        phoneNumber: response.data.data.phoneNumber || '',
        address: response.data.data.address || ''
      });
    } catch (error) {
      alert('Failed to fetch profile');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${user.id}`, formData);
      alert('Profile updated successfully');
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!user) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="profile-page">
        <div className="page-header">
          <h1>My Profile</h1>
          <button 
            className="btn btn-primary" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <h2>{user.firstName} {user.lastName}</h2>
              <span className={`role-badge role-${user.role}`}>
                {user.role.toUpperCase()}
              </span>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                  />
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
                    placeholder="Your address"
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-group">
                  <label>Email</label>
                  <p>{user.email}</p>
                </div>

                <div className="info-group">
                  <label>Department</label>
                  <p>{user.department || 'Not assigned'}</p>
                </div>

                <div className="info-group">
                  <label>Position</label>
                  <p>{user.position || 'Not assigned'}</p>
                </div>

                <div className="info-group">
                  <label>Phone Number</label>
                  <p>{user.phoneNumber || 'Not provided'}</p>
                </div>

                <div className="info-group">
                  <label>Address</label>
                  <p>{user.address || 'Not provided'}</p>
                </div>

                <div className="info-group">
                  <label>Join Date</label>
                  <p>{new Date(user.joinDate).toLocaleDateString()}</p>
                </div>

                <div className="info-group">
                  <label>Account Status</label>
                  <p>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Profile;