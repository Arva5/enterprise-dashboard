import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import './Leaves.css';

function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    leaveType: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leaves');
      setLeaves(response.data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', formData);
      alert('Leave request submitted successfully');
      setShowModal(false);
      setFormData({
        leaveType: 'casual',
        startDate: '',
        endDate: '',
        reason: ''
      });
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleUpdateStatus = async (leaveId, status, reviewNote = '') => {
    try {
      await api.put(`/leaves/${leaveId}/status`, { status, reviewNote });
      alert(`Leave request ${status}`);
      fetchLeaves();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update leave status');
    }
  };

  const handleApprove = (leaveId) => {
    const note = prompt('Add approval note (optional):');
    handleUpdateStatus(leaveId, 'approved', note || '');
  };

  const handleReject = (leaveId) => {
    const note = prompt('Reason for rejection:');
    if (note) {
      handleUpdateStatus(leaveId, 'rejected', note);
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    if (filter === 'all') return true;
    return leave.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getLeaveTypeIcon = (type) => {
    switch (type) {
      case 'sick': return '🤒';
      case 'casual': return '🏖️';
      case 'vacation': return '✈️';
      case 'unpaid': return '📅';
      default: return '📋';
    }
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="leaves-page">
        <div className="page-header">
          <div>
            <h1>Leave Management</h1>
            <p>Manage and track leave requests</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Request Leave
          </button>
        </div>

        <div className="filters-bar">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All ({leaves.length})
            </button>
            <button 
              className={filter === 'pending' ? 'active' : ''}
              onClick={() => setFilter('pending')}
            >
              Pending ({leaves.filter(l => l.status === 'pending').length})
            </button>
            <button 
              className={filter === 'approved' ? 'active' : ''}
              onClick={() => setFilter('approved')}
            >
              Approved ({leaves.filter(l => l.status === 'approved').length})
            </button>
            <button 
              className={filter === 'rejected' ? 'active' : ''}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({leaves.filter(l => l.status === 'rejected').length})
            </button>
          </div>
        </div>

        <div className="leaves-list">
          {filteredLeaves.map(leave => (
            <div key={leave.id} className="leave-card">
              <div className="leave-header">
                <div className="leave-type">
                  <span className="leave-icon">{getLeaveTypeIcon(leave.leaveType)}</span>
                  <div>
                    <h3>{leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)} Leave</h3>
                    <p className="leave-employee">
                      {leave.employee?.firstName} {leave.employee?.lastName}
                    </p>
                  </div>
                </div>
                <span className={`status-badge ${getStatusColor(leave.status)}`}>
                  {leave.status}
                </span>
              </div>

              <div className="leave-details">
                <div className="detail-row">
                  <span className="detail-label">📅 Duration:</span>
                  <span className="detail-value">
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                    <span className="days-count"> ({calculateDays(leave.startDate, leave.endDate)} days)</span>
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">📝 Reason:</span>
                  <span className="detail-value">{leave.reason}</span>
                </div>

                {leave.reviewNote && (
                  <div className="detail-row">
                    <span className="detail-label">💬 Review Note:</span>
                    <span className="detail-value">{leave.reviewNote}</span>
                  </div>
                )}

                {leave.reviewer && (
                  <div className="detail-row">
                    <span className="detail-label">👤 Reviewed By:</span>
                    <span className="detail-value">
                      {leave.reviewer.firstName} {leave.reviewer.lastName}
                    </span>
                  </div>
                )}

                <div className="detail-row">
                  <span className="detail-label">🕐 Submitted:</span>
                  <span className="detail-value">
                    {new Date(leave.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {(currentUser.role === 'admin' || currentUser.role === 'hr') && leave.status === 'pending' && (
                <div className="leave-actions">
                  <button className="btn-approve" onClick={() => handleApprove(leave.id)}>
                    ✓ Approve
                  </button>
                  <button className="btn-reject" onClick={() => handleReject(leave.id)}>
                    ✗ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredLeaves.length === 0 && (
          <div className="empty-state">
            <p>No leave requests found</p>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Request Leave</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Leave Type *</label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                    required
                  >
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="vacation">Vacation</option>
                    <option value="unpaid">Unpaid Leave</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      required
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Reason *</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    rows="4"
                    required
                    placeholder="Please provide a reason for your leave request..."
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Request
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

export default Leaves;