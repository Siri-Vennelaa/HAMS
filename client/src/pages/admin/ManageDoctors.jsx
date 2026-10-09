import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  X,
  DollarSign,
  Award,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import adminService from '../../services/adminService';
import '../../styles/dashboard.css';

const initialDoctorForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  specialization: '',
  department: '',
  qualification: '',
  experience: 5,
  consultationFee: 120,
  bio: '',
  profileImage: '',
};

const ManageDoctors = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [formData, setFormData] = useState(initialDoctorForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDoctors();
      if (res && res.success) {
        setDoctors(res.data || []);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to load doctors list.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingDoctorId(null);
    setFormData(initialDoctorForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleOpenEditModal = (doctor) => {
    setIsEditing(true);
    setEditingDoctorId(doctor.doctorId || doctor._id);
    setFormData({
      name: doctor.name || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      password: '', // Leave blank if not updating
      specialization: doctor.specialization || '',
      department: doctor.department || '',
      qualification: doctor.qualification || '',
      experience: doctor.experience || 0,
      consultationFee: doctor.consultationFee || 0,
      bio: doctor.bio || '',
      profileImage: doctor.profileImage || '',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) errors.name = 'Doctor name is required';
    if (!isEditing) {
      if (!formData.email.trim()) errors.email = 'Email address is required';
      else if (!emailRegex.test(formData.email)) errors.email = 'Please enter a valid email address';

      if (!formData.password) errors.password = 'Initial login password is required';
      else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.specialization.trim()) errors.specialization = 'Specialization is required';
    if (!formData.department.trim()) errors.department = 'Department is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitDoctor = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      if (isEditing) {
        const res = await adminService.updateDoctor(editingDoctorId, formData);
        if (res && res.success) {
          setMessage({ type: 'success', text: `Doctor ${formData.name} updated successfully.` });
          setModalOpen(false);
          await fetchDoctors();
        }
      } else {
        const res = await adminService.createDoctor(formData);
        if (res && res.success) {
          setMessage({
            type: 'success',
            text: `Doctor account created successfully for ${formData.name}.`,
          });
          setModalOpen(false);
          await fetchDoctors();
        }
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to save doctor record.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (doctor) => {
    setDoctorToDelete(doctor);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;

    try {
      setDeleting(true);
      const res = await adminService.deleteDoctor(doctorToDelete.doctorId || doctorToDelete._id);
      if (res && res.success) {
        setMessage({
          type: 'success',
          text: `Doctor ${doctorToDelete.name} was successfully removed from the system.`,
        });
        setDeleteModalOpen(false);
        setDoctorToDelete(null);
        await fetchDoctors();
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to delete doctor.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const q = search.toLowerCase();
    return (
      doc.name?.toLowerCase().includes(q) ||
      doc.specialization?.toLowerCase().includes(q) ||
      doc.department?.toLowerCase().includes(q) ||
      doc.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar title="Manage Doctors" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-container">
          <div className="page-header">
            <div>
              <h1>Hospital Medical Staff</h1>
              <p>Add new doctors, update specialty appointments, or deactivate hospital practitioners.</p>
            </div>
            <button type="button" className="btn btn-primary" onClick={handleOpenAddModal}>
              <UserPlus size={16} />
              <span>Add New Doctor</span>
            </button>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Search bar */}
          <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="#6c757d" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search by doctor name, email, department, or specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          {/* Doctors Table */}
          {loading ? (
            <LoadingSpinner fullPage message="Loading doctor directory..." />
          ) : (
            <div className="table-responsive">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Doctor Profile</th>
                    <th>Department</th>
                    <th>Specialization</th>
                    <th>Experience</th>
                    <th>Fee</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => (
                      <tr key={doc.doctorId || doc._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={
                                doc.profileImage ||
                                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300'
                              }
                              alt={doc.name}
                              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <strong>{doc.name}</strong>
                              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>{doc.email}</div>
                              {doc.phone && (
                                <div style={{ fontSize: '0.78rem', color: '#6c757d' }}>{doc.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{doc.department}</td>
                        <td>
                          <span className="badge badge-confirmed">{doc.specialization}</span>
                        </td>
                        <td>{doc.experience || 0} Years</td>
                        <td>
                          <strong style={{ color: '#198754' }}>₹{doc.consultationFee || 0}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              onClick={() => handleOpenEditModal(doc)}
                              title="Edit Doctor Details"
                            >
                              <Edit2 size={14} />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleOpenDeleteModal(doc)}
                              title="Delete Doctor"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                        No doctors matching your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Add / Edit Doctor Modal */}
          {modalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
              }}
              onClick={() => setModalOpen(false)}
            >
              <div
                className="card"
                style={{
                  maxWidth: '700px',
                  width: '100%',
                  maxHeight: '90vh',
                  overflowY: 'auto',
                  position: 'relative',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6c757d',
                  }}
                >
                  <X size={20} />
                </button>

                <h3 style={{ fontSize: '1.3rem', marginBottom: '6px', color: '#212529' }}>
                  {isEditing ? `Edit Doctor: ${formData.name}` : 'Add New Hospital Doctor'}
                </h3>
                <p style={{ color: '#6c757d', fontSize: '0.88rem', marginBottom: '20px' }}>
                  {isEditing
                    ? 'Update clinical credentials and consultation rates.'
                    : 'Creates both the login user account and official medical profile.'}
                </p>

                <form onSubmit={handleSubmitDoctor}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label">Doctor Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                        placeholder="e.g. Dr. Alex Morgan"
                        value={formData.name}
                        onChange={handleFormChange}
                      />
                      {formErrors.name && <div className="invalid-feedback">{formErrors.name}</div>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        disabled={isEditing}
                        className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                        placeholder="alex.morgan@hospital.com"
                        value={formData.email}
                        onChange={handleFormChange}
                      />
                      {formErrors.email && <div className="invalid-feedback">{formErrors.email}</div>}
                    </div>

                    {!isEditing && (
                      <div className="form-group">
                        <label className="form-label">Initial Password *</label>
                        <input
                          type="password"
                          name="password"
                          className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                          placeholder="Min. 6 characters"
                          value={formData.password}
                          onChange={handleFormChange}
                        />
                        {formErrors.password && (
                          <div className="invalid-feedback">{formErrors.password}</div>
                        )}
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="+1-555-0199"
                        value={formData.phone}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Specialization *</label>
                      <input
                        type="text"
                        name="specialization"
                        className={`form-control ${formErrors.specialization ? 'is-invalid' : ''}`}
                        placeholder="e.g. Oncologist, Cardiologist"
                        value={formData.specialization}
                        onChange={handleFormChange}
                      />
                      {formErrors.specialization && (
                        <div className="invalid-feedback">{formErrors.specialization}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Department *</label>
                      <input
                        type="text"
                        name="department"
                        className={`form-control ${formErrors.department ? 'is-invalid' : ''}`}
                        placeholder="e.g. Oncology, Cardiology"
                        value={formData.department}
                        onChange={handleFormChange}
                      />
                      {formErrors.department && (
                        <div className="invalid-feedback">{formErrors.department}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Qualifications</label>
                      <input
                        type="text"
                        name="qualification"
                        className="form-control"
                        placeholder="e.g. MD, FACS, Johns Hopkins"
                        value={formData.qualification}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Years of Experience</label>
                      <input
                        type="number"
                        name="experience"
                        min={0}
                        className="form-control"
                        value={formData.experience}
                        onChange={handleFormChange}
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
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Profile Image URL</label>
                      <input
                        type="url"
                        name="profileImage"
                        className="form-control"
                        placeholder="https://..."
                        value={formData.profileImage}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Biography</label>
                      <textarea
                        name="bio"
                        rows={3}
                        className="form-control"
                        placeholder="Specialist description and clinical interests..."
                        value={formData.bio}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setModalOpen(false)}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Doctor'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Doctor Confirmation Modal */}
          {deleteModalOpen && doctorToDelete && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
              }}
              onClick={() => setDeleteModalOpen(false)}
            >
              <div
                className="card"
                style={{ maxWidth: '440px', width: '100%', position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 style={{ fontSize: '1.2rem', color: '#dc3545', marginBottom: '10px' }}>
                  Delete Doctor Account?
                </h3>
                <p style={{ color: '#495057', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Are you sure you want to permanently delete <strong>{doctorToDelete.name}</strong>? This will remove their user login, doctor profile, and future availability schedule.
                </p>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setDeleteModalOpen(false)}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManageDoctors;
