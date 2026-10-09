import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  Calendar,
  Clock,
  RotateCcw,
  AlertCircle,
  X,
  Stethoscope,
  User,
  FileText,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import adminService from '../../services/adminService';
import doctorService from '../../services/doctorService';
import '../../styles/dashboard.css';

const ManageAppointments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDoctorId, setFilterDoctorId] = useState('');

  // View Modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const fetchDoctors = async () => {
    try {
      const res = await doctorService.getDoctors();
      if (res && res.success) {
        setDoctorsList(res.data || []);
      }
    } catch (e) {
      // Non-critical
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;
      if (filterDoctorId) params.doctorId = filterDoctorId;

      const res = await adminService.getAppointments(params);
      if (res && res.success) {
        setAppointments(res.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load appointments log.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [filterDate, filterStatus, filterDoctorId]);

  const handleResetFilters = () => {
    setFilterDate('');
    setFilterStatus('');
    setFilterDoctorId('');
  };

  const handleOpenDetails = (appt) => {
    setSelectedAppt(appt);
    setViewModalOpen(true);
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar title="Manage Appointments" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-container">
          <div className="page-header">
            <div>
              <h1>Hospital Appointments Audit Log</h1>
              <p>Filter, audit, and inspect all medical consultation reservations across the hospital.</p>
            </div>
            <span className="badge badge-confirmed" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
              Showing {appointments.length} Appointments
            </span>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Filter Bar */}
          <div className="card" style={{ marginBottom: '24px', padding: '18px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                alignItems: 'flex-end',
              }}
            >
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Filter by Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Filter by Status</label>
                <select
                  className="form-control"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Filter by Doctor</label>
                <select
                  className="form-control"
                  value={filterDoctorId}
                  onChange={(e) => setFilterDoctorId(e.target.value)}
                >
                  <option value="">All Doctors</option>
                  {doctorsList.map((doc) => (
                    <option key={doc.doctorId || doc._id} value={doc.doctorId || doc._id}>
                      {doc.name} ({doc.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                  onClick={handleResetFilters}
                >
                  <RotateCcw size={16} />
                  <span>Reset Filters</span>
                </button>
              </div>
            </div>
          </div>

          {/* Appointments Table */}
          {loading ? (
            <LoadingSpinner fullPage message="Fetching appointment records..." />
          ) : (
            <div className="table-responsive">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length > 0 ? (
                    appointments.map((appt) => (
                      <tr key={appt._id}>
                        <td>
                          <strong>{appt.patientId?.name || 'Patient'}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                            {appt.patientId?.phone || appt.patientId?.email}
                          </div>
                        </td>
                        <td>
                          <strong>{appt.doctorId?.name || 'Doctor'}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                            {appt.doctorProfile?.specialization || 'Specialist'}
                          </div>
                        </td>
                        <td>{appt.doctorProfile?.department || 'General Medicine'}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Calendar size={14} color="#0d6efd" />
                            <span>{appt.appointmentDate}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#6c757d', marginTop: '2px' }}>
                            <Clock size={14} />
                            <span>{appt.timeSlot}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${appt.status}`}>
                            {appt.status}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline"
                            onClick={() => handleOpenDetails(appt)}
                            title="View Full Appointment Audit Record"
                          >
                            <Eye size={14} />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                        No appointments found matching the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Details Modal */}
          {viewModalOpen && selectedAppt && (
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
                style={{ maxWidth: '540px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}
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
                  <CalendarCheck size={20} color="#0d6efd" />
                  <span>Appointment Details</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.9rem' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 600, color: '#0d6efd', marginBottom: '6px' }}>Patient Information</div>
                    <div><strong>Name:</strong> {selectedAppt.patientId?.name || 'N/A'}</div>
                    <div><strong>Email:</strong> {selectedAppt.patientId?.email || 'N/A'}</div>
                    <div><strong>Phone:</strong> {selectedAppt.patientId?.phone || 'N/A'}</div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 600, color: '#0d6efd', marginBottom: '6px' }}>Doctor Information</div>
                    <div><strong>Doctor:</strong> {selectedAppt.doctorId?.name || 'N/A'}</div>
                    <div><strong>Department:</strong> {selectedAppt.doctorProfile?.department}</div>
                    <div><strong>Specialization:</strong> {selectedAppt.doctorProfile?.specialization}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#6c757d' }}>Scheduled Date:</span>
                    <strong>{selectedAppt.appointmentDate}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#6c757d' }}>Time Slot:</span>
                    <strong>{selectedAppt.timeSlot}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                    <span style={{ color: '#6c757d' }}>Booking Status:</span>
                    <span className={`badge badge-${selectedAppt.status}`}>{selectedAppt.status}</span>
                  </div>

                  <div>
                    <span style={{ color: '#6c757d', display: 'block', marginBottom: '4px' }}>Reason for Visit:</span>
                    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '6px' }}>
                      {selectedAppt.reason}
                    </div>
                  </div>

                  {selectedAppt.notes && (
                    <div>
                      <span style={{ color: '#6c757d', display: 'block', marginBottom: '4px' }}>Clinical / Cancellation Notes:</span>
                      <div style={{ backgroundColor: '#fff3cd', color: '#664d03', padding: '10px', borderRadius: '6px' }}>
                        {selectedAppt.notes}
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.8rem', color: '#6c757d', textAlign: 'right' }}>
                    Logged: {new Date(selectedAppt.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setViewModalOpen(false)}
                  >
                    Close
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

export default ManageAppointments;
