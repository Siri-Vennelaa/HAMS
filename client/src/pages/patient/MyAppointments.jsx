import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  CalendarPlus,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import AppointmentTable from '../../components/AppointmentTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import appointmentService from '../../services/appointmentService';
import '../../styles/dashboard.css';

const MyAppointments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'upcoming' | 'completed' | 'cancelled'
  const [message, setMessage] = useState({ type: '', text: '' });

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedApptId, setSelectedApptId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getMyAppointments();
      if (res && res.success) {
        setAppointments(res.data);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to load appointments.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Filter based on selected tab
  const getFilteredAppointments = () => {
    const today = new Date().toISOString().split('T')[0];

    if (activeTab === 'upcoming') {
      return appointments.filter(
        (a) => (a.status === 'pending' || a.status === 'confirmed') && a.appointmentDate >= today
      );
    }
    if (activeTab === 'completed') {
      return appointments.filter((a) => a.status === 'completed');
    }
    if (activeTab === 'cancelled') {
      return appointments.filter((a) => a.status === 'cancelled' || a.status === 'rejected');
    }
    return appointments;
  };

  const handleOpenCancelModal = (appointmentId) => {
    setSelectedApptId(appointmentId);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!selectedApptId) return;

    try {
      setCancelling(true);
      const res = await appointmentService.cancelAppointment(selectedApptId, cancelReason);
      if (res && res.success) {
        setMessage({
          type: 'success',
          text: 'Appointment was cancelled successfully and the doctor slot has been freed.',
        });
        setCancelModalOpen(false);
        await fetchAppointments();
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to cancel appointment.',
      });
    } finally {
      setCancelling(false);
    }
  };

  const filteredList = getFilteredAppointments();

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar title="My Appointments" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-container">
          <div className="page-header">
            <div>
              <h1>Appointment History & Schedule</h1>
              <p>View your scheduled medical consultations, track statuses, or manage cancellations.</p>
            </div>
            <Link to="/patient/doctors" className="btn btn-primary">
              <CalendarPlus size={18} />
              <span>Book New Appointment</span>
            </Link>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: '24px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { id: 'all', label: `All (${appointments.length})` },
              {
                id: 'upcoming',
                label: `Upcoming (${
                  appointments.filter(
                    (a) =>
                      (a.status === 'pending' || a.status === 'confirmed') &&
                      a.appointmentDate >= new Date().toISOString().split('T')[0]
                  ).length
                })`,
              },
              {
                id: 'completed',
                label: `Completed (${
                  appointments.filter((a) => a.status === 'completed').length
                })`,
              },
              {
                id: 'cancelled',
                label: `Cancelled (${
                  appointments.filter(
                    (a) => a.status === 'cancelled' || a.status === 'rejected'
                  ).length
                })`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="btn"
                style={{
                  backgroundColor: 'transparent',
                  color: activeTab === tab.id ? 'var(--primary-color)' : '#6c757d',
                  borderBottom: activeTab === tab.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                  borderRadius: 0,
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  padding: '10px 16px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Appointments Table */}
          {loading ? (
            <LoadingSpinner fullPage message="Loading your appointments..." />
          ) : (
            <AppointmentTable
              appointments={filteredList}
              role="patient"
              onCancel={handleOpenCancelModal}
            />
          )}

          {/* Cancellation Confirmation Modal */}
          {cancelModalOpen && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px',
              }}
              onClick={() => setCancelModalOpen(false)}
            >
              <div
                className="card"
                style={{ maxWidth: '460px', width: '100%', position: 'relative' }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
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

                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#dc3545', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={20} />
                  <span>Cancel Appointment?</span>
                </h3>
                <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '16px' }}>
                  Are you sure you want to cancel this visit? Once cancelled, your reserved time slot will be opened back up for other patients.
                </p>

                <form onSubmit={handleConfirmCancel}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cancelReason">
                      Reason for Cancellation (Optional)
                    </label>
                    <textarea
                      id="cancelReason"
                      rows={2}
                      className="form-control"
                      placeholder="e.g. Schedule conflict, feeling better..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setCancelModalOpen(false)}
                      disabled={cancelling}
                    >
                      Keep Appointment
                    </button>
                    <button
                      type="submit"
                      className="btn btn-danger btn-sm"
                      disabled={cancelling}
                    >
                      {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyAppointments;
