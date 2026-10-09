import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import adminService from '../../services/adminService';
import '../../styles/dashboard.css';

const ManagePatients = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // View Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Delete Modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPatients();
      if (res && res.success) {
        setPatients(res.data || []);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to fetch patients list.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleOpenViewModal = (patient) => {
    setSelectedPatient(patient);
    setViewModalOpen(true);
  };

  const handleOpenDeleteModal = (patient) => {
    setPatientToDelete(patient);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;

    try {
      setDeleting(true);
      const res = await adminService.deletePatient(patientToDelete._id);
      if (res && res.success) {
        setMessage({
          type: 'success',
          text: `Patient account for ${patientToDelete.name} was removed.`,
        });
        setDeleteModalOpen(false);
        setPatientToDelete(null);
        await fetchPatients();
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to delete patient account.',
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar title="Manage Patients" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-container">
          <div className="page-header">
            <div>
              <h1>Registered Patients Directory</h1>
              <p>Review registered hospital patients, demographic records, and manage patient accounts.</p>
            </div>
            <span className="badge badge-confirmed" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
              Total Patients: {patients.length}
            </span>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Search Bar */}
          <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="#6c757d" style={{ position: 'absolute', left: '12px' }} />
              <input
                type="text"
                className="form-control"
                placeholder="Search patients by name, email address, or phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          {/* Patients Table */}
          {loading ? (
            <LoadingSpinner fullPage message="Loading patient directory..." />
          ) : (
            <div className="table-responsive">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Patient Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Gender</th>
                    <th>Date Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <tr key={patient._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: '#e7f1ff',
                                color: '#0d6efd',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '0.9rem',
                              }}
                            >
                              {patient.name ? patient.name[0].toUpperCase() : 'P'}
                            </div>
                            <strong>{patient.name}</strong>
                          </div>
                        </td>
                        <td>{patient.email}</td>
                        <td>{patient.phone || 'N/A'}</td>
                        <td>
                          <span style={{ textTransform: 'capitalize' }}>
                            {patient.gender || 'Other'}
                          </span>
                        </td>
                        <td>
                          {patient.createdAt
                            ? new Date(patient.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline"
                              onClick={() => handleOpenViewModal(patient)}
                              title="View Patient Details"
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => handleOpenDeleteModal(patient)}
                              title="Delete Patient Account"
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
                        No patients matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* View Patient Details Modal */}
          {viewModalOpen && selectedPatient && (
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
              onClick={() => setViewModalOpen(false)}
            >
              <div
                className="card"
                style={{ maxWidth: '480px', width: '100%', position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setViewModalOpen(false)}
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

                <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#212529', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserCheck size={20} color="#0d6efd" />
                  <span>Patient Demographics</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#6c757d' }}>Full Name:</span>
                    <strong>{selectedPatient.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#6c757d' }}>Email Address:</span>
                    <strong>{selectedPatient.email}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#6c757d' }}>Phone:</span>
                    <strong>{selectedPatient.phone || 'Not provided'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#6c757d' }}>Gender:</span>
                    <strong style={{ textTransform: 'capitalize' }}>{selectedPatient.gender || 'Other'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#6c757d' }}>Date of Birth:</span>
                    <strong>
                      {selectedPatient.dateOfBirth
                        ? selectedPatient.dateOfBirth.split('T')[0]
                        : 'Not provided'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#6c757d' }}>Residential Address:</span>
                    <strong style={{ textAlign: 'right', maxWidth: '240px' }}>
                      {selectedPatient.address || 'Not provided'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                    <span style={{ color: '#6c757d' }}>Registration Date:</span>
                    <span>
                      {selectedPatient.createdAt
                        ? new Date(selectedPatient.createdAt).toLocaleString()
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setViewModalOpen(false)}
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Patient Confirmation Modal */}
          {deleteModalOpen && patientToDelete && (
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
                  Delete Patient Account?
                </h3>
                <p style={{ color: '#495057', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Are you sure you want to remove <strong>{patientToDelete.name}</strong> ({patientToDelete.email}) from the hospital database?
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
                    {deleting ? 'Removing...' : 'Confirm Delete'}
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

export default ManagePatients;
