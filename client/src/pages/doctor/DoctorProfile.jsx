import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Stethoscope, Award, DollarSign, Save, CheckCircle, AlertCircle, Shield } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import doctorService from '../../services/doctorService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const DoctorProfile = () => {
  const { user, updateDoctorProfile, updateUserProfile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    department: '',
    qualification: '',
    experience: 0,
    consultationFee: 0,
    bio: '',
    profileImage: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await doctorService.getMyDoctorProfile();
        if (res && res.success && res.data) {
          const u = res.data.user || {};
          const p = res.data.profile || {};
          setFormData({
            name: u.name || '',
            email: u.email || '',
            phone: u.phone || '',
            specialization: p.specialization || '',
            department: p.department || '',
            qualification: p.qualification || '',
            experience: p.experience || 0,
            consultationFee: p.consultationFee || 0,
            bio: p.bio || '',
            profileImage: p.profileImage || '',
          });
        }
      } catch (err) {
        setMessage({
          type: 'danger',
          text: err.response?.data?.message || 'Failed to load doctor profile.',
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
    if (!formData.name.trim() || !formData.specialization.trim() || !formData.department.trim()) {
      setMessage({ type: 'danger', text: 'Name, Specialization, and Department are required.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      const res = await doctorService.updateDoctorProfile({
        name: formData.name,
        phone: formData.phone,
        specialization: formData.specialization,
        department: formData.department,
        qualification: formData.qualification,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
        bio: formData.bio,
        profileImage: formData.profileImage,
      });

      if (res && res.success) {
        setMessage({ type: 'success', text: 'Doctor profile updated successfully.' });
        if (res.data?.user) updateUserProfile(res.data.user);
        if (res.data?.profile) updateDoctorProfile(res.data.profile);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to save doctor profile changes.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar title="Doctor Profile" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-container">
          <div className="page-header">
            <div>
              <h1>Doctor Professional Profile</h1>
              <p>Update your clinical qualifications, department credentials, consultation fees, and public biography.</p>
            </div>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {loading ? (
            <LoadingSpinner fullPage message="Loading doctor profile details..." />
          ) : (
            <div className="card" style={{ maxWidth: '860px' }}>
              <form onSubmit={handleSubmit}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    paddingBottom: '24px',
                    borderBottom: '1px solid #e2e8f0',
                    marginBottom: '24px',
                  }}
                >
                  <img
                    src={formData.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300'}
                    alt="Doctor Avatar"
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #e7f1ff',
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.3rem', color: '#212529', marginBottom: '4px' }}>
                      {formData.name || 'Doctor'}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-confirmed">
                        <Stethoscope size={12} style={{ marginRight: '4px' }} />
                        {formData.specialization || 'Specialist'}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>{formData.email}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Doctor Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address (Locked)</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      value={formData.email}
                      disabled
                      style={{ backgroundColor: '#f8fafc', color: '#6c757d', cursor: 'not-allowed' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Specialization *</label>
                    <input
                      type="text"
                      name="specialization"
                      className="form-control"
                      placeholder="e.g. Cardiologist, Neurologist"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <input
                      type="text"
                      name="department"
                      className="form-control"
                      placeholder="e.g. Cardiology, Pediatrics"
                      value={formData.department}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Qualifications</label>
                    <input
                      type="text"
                      name="qualification"
                      className="form-control"
                      placeholder="e.g. MD, MBBS, FACC"
                      value={formData.qualification}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience (Years)</label>
                    <input
                      type="number"
                      name="experience"
                      min={0}
                      className="form-control"
                      value={formData.experience}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Consultation Fee (₹ INR)</label>
                    <input
                      type="number"
                      name="consultationFee"
                      min={0}
                      className="form-control"
                      value={formData.consultationFee}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Profile Image URL</label>
                    <input
                      type="url"
                      name="profileImage"
                      className="form-control"
                      placeholder="https://..."
                      value={formData.profileImage}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Professional Biography</label>
                    <textarea
                      name="bio"
                      rows={4}
                      className="form-control"
                      placeholder="Describe your medical background, research interests, and clinical practice philosophy..."
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    <Save size={16} />
                    <span>{submitting ? 'Saving Profile...' : 'Save Doctor Profile'}</span>
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

export default DoctorProfile;
