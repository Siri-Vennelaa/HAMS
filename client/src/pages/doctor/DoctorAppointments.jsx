import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import AppointmentTable from '../../components/AppointmentTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import appointmentService from '../../services/appointmentService';
import '../../styles/dashboard.css';

const DoctorAppointments = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'today' | 'upcoming' | 'completed' | 'pending'
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getDoctorAppointments();
      if (res && res.success) {
        setAppointments(res.data || []);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to fetch doctor appointments.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const res = await appointmentService.updateAppointmentStatus(appointmentId, status);
      if (res && res.success) {
        setMessage({
          type: 'success',
          text: `Appointment has been marked as ${status}.`,
        });
        await fetchAppointments();
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || `Failed to update status to ${status}.`,
      });
    }
  };

  const getFilteredAppointments = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    if (filter === 'today') {
      return appointments.filter((a) => a.appointmentDate === todayStr);
    }
    if (filter === 'upcoming') {
      return appointments.filter(
        (a) => a.appointmentDate >= todayStr && (a.status === 'pending' || a.status === 'confirmed')
      );
    }
    if (filter === 'completed') {
      return appointments.filter((a) => a.status === 'completed');
    }
    if (filter === 'pending') {
      return appointments.filter((a) => a.status === 'pending');
    }
    return appointments;
  };

  const filteredList = getFilteredAppointments();

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar title="Doctor Appointments" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-container">
          <div className="page-header">
            <div>
              <h1>All Patient Appointments</h1>
              <p>Manage consultation requests, confirm upcoming visits, and update visit completion records.</p>
            </div>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Filter Tabs */}
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
                id: 'today',
                label: `Today (${
                  appointments.filter((a) => a.appointmentDate === new Date().toISOString().split('T')[0]).length
                })`,
              },
              {
                id: 'upcoming',
                label: `Upcoming (${
                  appointments.filter(
                    (a) =>
                      a.appointmentDate >= new Date().toISOString().split('T')[0] &&
                      (a.status === 'pending' || a.status === 'confirmed')
                  ).length
                })`,
              },
              {
                id: 'completed',
                label: `Completed (${appointments.filter((a) => a.status === 'completed').length})`,
              },
              {
                id: 'pending',
                label: `Pending Requests (${appointments.filter((a) => a.status === 'pending').length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className="btn"
                style={{
                  backgroundColor: 'transparent',
                  color: filter === tab.id ? 'var(--primary-color)' : '#6c757d',
                  borderBottom: filter === tab.id ? '3px solid var(--primary-color)' : '3px solid transparent',
                  borderRadius: 0,
                  fontWeight: filter === tab.id ? 700 : 500,
                  padding: '10px 16px',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner fullPage message="Loading doctor appointment records..." />
          ) : (
            <AppointmentTable
              appointments={filteredList}
              role="doctor"
              onUpdateStatus={handleUpdateStatus}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorAppointments;
