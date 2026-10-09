import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, CheckCircle, AlertCircle, Save, Shield } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import patientService from '../../services/patientService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const PatientProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'other',
    dateOfBirth: '',
    address: '',
    role: 'patient',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await patientService.getProfile();
        if (res && res.success && res.data) {
          const u = res.data;
          setFormData({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            gender: u.gender || 'other',
            dateOfBirth: u.dateOfBirth ? u.dateOfBirth.split('T')[0] : '',
            address: u.address || '',
            role: u.role || 'patient',
          });
        }
      } catch (err) {
        setMessage({
          type: 'danger',
          text: err.response?.data?.message || 'Failed to load profile details.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setMessage({ type: 'danger', text: 'Full name cannot be empty.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      const res = await patientService.updateProfile({
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
      });

      if (res && res.success) {
        setMessage({ type: 'success', text: 'Your profile has been updated successfully.' });
        updateUserProfile(res.data);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to save changes.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar title="My Profile" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-container">
          <div className="page-header">
            <div>
              <h1>Patient Account Profile</h1>
              <p>Manage your contact details, personal demographics, and healthcare preferences.</p>
            </div>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {loading ? (
            <LoadingSpinner fullPage message="Loading profile..." />
          ) : (
            <div className="card" style={{ maxWidth: '800px' }}>
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '18px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid #e2e8f0',
                    marginBottom: '24px',
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      fontWeight: 700,
                    }}
                  >
                    {formData.name ? formData.name[0].toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: '#212529', marginBottom: '4px' }}>
                      {formData.name || 'Patient'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-confirmed">
                        <Shield size={12} style={{ marginRight: '4px' }} />
                        {formData.role}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>{formData.email}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      Email Address (Locked)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      disabled
                      style={{ backgroundColor: '#f8fafc', color: '#6c757d', cursor: 'not-allowed' }}
                    />
                    <small style={{ color: '#6c757d', fontSize: '0.78rem', marginTop: '4px' }}>
                      Contact administration to change registered primary email.
                    </small>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      className="form-control"
                      placeholder="+1-555-0100"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="gender">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="form-control"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="dateOfBirth">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      className="form-control"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="address">
                      Residential Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      className="form-control"
                      placeholder="Street, City, State, ZIP"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    <Save size={16} />
                    <span>{submitting ? 'Saving Profile...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientProfile;
