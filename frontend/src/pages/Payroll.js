import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';
import './Payroll.css';

function Payroll() {
  const [payrolls, setPayrolls] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const [formData, setFormData] = useState({
    userId: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    basicSalary: '',
    allowances: 0,
    deductions: 0,
    netSalary: 0
  });

  useEffect(() => {
    fetchPayrolls();
    if (currentUser.role === 'admin' || currentUser.role === 'hr') {
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    calculateNetSalary();
  }, [formData.basicSalary, formData.allowances, formData.deductions]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payroll');
      setPayrolls(response.data.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to fetch payroll');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const calculateNetSalary = () => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const allow = parseFloat(formData.allowances) || 0;
    const deduct = parseFloat(formData.deductions) || 0;
    const net = basic + allow - deduct;
    setFormData(prev => ({ ...prev, netSalary: net.toFixed(2) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payroll', formData);
      alert('Payroll record created successfully');
      setShowModal(false);
      setFormData({
        userId: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        basicSalary: '',
        allowances: 0,
        deductions: 0,
        netSalary: 0
      });
      fetchPayrolls();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create payroll');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'processed': return 'status-processed';
      case 'paid': return 'status-paid';
      default: return '';
    }
  };

  const groupByYear = () => {
    const grouped = {};
    payrolls.forEach(payroll => {
      if (!grouped[payroll.year]) {
        grouped[payroll.year] = [];
      }
      grouped[payroll.year].push(payroll);
    });
    return grouped;
  };

  const groupedPayrolls = groupByYear();

  if (loading) return <Layout><div className="loading">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="payroll-page">
        <div className="page-header">
          <div>
            <h1>Payroll Management</h1>
            <p>View and manage employee salaries</p>
          </div>
          {(currentUser.role === 'admin' || currentUser.role === 'hr') && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              + Generate Payroll
            </button>
          )}
        </div>

        {Object.keys(groupedPayrolls).sort((a, b) => b - a).map(year => (
          <div key={year} className="year-section">
            <h2 className="year-title">{year}</h2>
            <div className="payroll-grid">
              {groupedPayrolls[year].map(payroll => (
                <div key={payroll.id} className="payroll-card">
                  <div className="payroll-header">
                    <div>
                      <h3>{payroll.employee?.firstName} {payroll.employee?.lastName}</h3>
                      <p className="payroll-month">{payroll.month} {payroll.year}</p>
                    </div>
                    <span className={`status-badge ${getStatusColor(payroll.status)}`}>
                      {payroll.status}
                    </span>
                  </div>

                  <div className="payroll-details">
                    <div className="salary-row">
                      <span className="label">Basic Salary:</span>
                      <span className="value">${parseFloat(payroll.basicSalary).toLocaleString()}</span>
                    </div>
                    <div className="salary-row positive">
                      <span className="label">+ Allowances:</span>
                      <span className="value">${parseFloat(payroll.allowances).toLocaleString()}</span>
                    </div>
                    <div className="salary-row negative">
                      <span className="label">- Deductions:</span>
                      <span className="value">${parseFloat(payroll.deductions).toLocaleString()}</span>
                    </div>
                    <div className="salary-row total">
                      <span className="label">Net Salary:</span>
                      <span className="value">${parseFloat(payroll.netSalary).toLocaleString()}</span>
                    </div>
                  </div>

                  {payroll.paymentDate && (
                    <div className="payment-date">
                      💳 Paid on: {new Date(payroll.paymentDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {payrolls.length === 0 && (
          <div className="empty-state">
            <p>No payroll records found</p>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Generate Payroll</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Employee *</label>
                  <select
                    value={formData.userId}
                    onChange={(e) => {
                      const selectedUser = users.find(u => u.id === e.target.value);
                      setFormData({
                        ...formData,
                        userId: e.target.value,
                        basicSalary: selectedUser?.salary || ''
                      });
                    }}
                    required
                  >
                    <option value="">Select Employee</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} - {user.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Month *</label>
                    <select
                      value={formData.month}
                      onChange={(e) => setFormData({...formData, month: e.target.value})}
                      required
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Year *</label>
                    <input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({...formData, year: e.target.value})}
                      required
                      min="2020"
                      max="2030"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Basic Salary *</label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({...formData, basicSalary: e.target.value})}
                    required
                    min="0"
                    step="0.01"
                    placeholder="50000"
                  />
                </div>

                <div className="form-group">
                  <label>Allowances</label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({...formData, allowances: e.target.value})}
                    min="0"
                    step="0.01"
                    placeholder="5000"
                  />
                </div>

                <div className="form-group">
                  <label>Deductions</label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({...formData, deductions: e.target.value})}
                    min="0"
                    step="0.01"
                    placeholder="3000"
                  />
                </div>

                <div className="net-salary-preview">
                  <span>Net Salary:</span>
                  <span className="net-amount">${parseFloat(formData.netSalary).toLocaleString()}</span>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Generate Payroll
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

export default Payroll;