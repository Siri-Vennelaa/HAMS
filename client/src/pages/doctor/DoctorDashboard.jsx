import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Clock3,
  CalendarCheck,
  User,
  ArrowRight,
  CalendarPlus,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import AppointmentTable from '../../components/AppointmentTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import appointmentService from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [stats, setStats] = useState({
    today: 0,
    upcoming: 0,
    completed: 0,
    pending: 0,
  });

  const [todayAppointments, setTodayAppointments] = useState([]);

  const fetchDoctorDashboard = async () => {
    try {
      setLoading(true);
      const res = await appointmentService.getDoctorAppointments({ filter: 'today' });
      if (res && res.success) {
        setTodayAppointments(res.data || []);
        if (res.stats) {
          setStats(res.stats);
        }
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to load doctor dashboard.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorDashboard();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const res = await appointmentService.updateAppointmentStatus(appointmentId, status);
      if (res && res.success) {
        setMessage({
          type: 'success',
          text: `Appointment successfully marked as ${status}.`,
        });
        await fetchDoctorDashboard();
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || `Failed to update appointment to ${status}.`,
      });
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar title="Doctor Dashboard" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-container">
          <div className="page-header">
            <div>
              <h1>Welcome, {user?.name || 'Doctor'}!</h1>
              <p>Here is your daily medical clinic schedule, patient visits, and consultation requests.</p>
            </div>
            <Link to="/doctor/schedule" className="btn btn-primary">
              <Clock size={16} />
              <span>Update Availability</span>
            </Link>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          {loading ? (
            <LoadingSpinner fullPage message="Loading doctor dashboard..." />
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="stat-cards-grid">
                <StatCard
                  title="Today's Appointments"
                  value={stats.today}
                  icon={<Calendar size={24} />}
                  color="blue"
                />
                <StatCard
                  title="Upcoming"
                  value={stats.upcoming}
                  icon={<Clock size={24} />}
                  color="yellow"
                />
                <StatCard
                  title="Completed"
                  value={stats.completed}
                  icon={<CheckCircle size={24} />}
                  color="green"
                />
                <StatCard
                  title="Pending Requests"
                  value={stats.pending}
                  icon={<Clock3 size={24} />}
                  color="red"
                />
              </div>

              {/* Quick Actions Strip */}
              <div className="quick-actions-bar">
                <Link to="/doctor/appointments" className="btn btn-outline">
                  <CalendarCheck size={16} />
                  <span>All Appointments</span>
                </Link>
                <Link to="/doctor/schedule" className="btn btn-outline">
                  <Clock size={16} />
                  <span>Manage Schedule Slots</span>
                </Link>
                <Link to="/doctor/profile" className="btn btn-outline">
                  <User size={16} />
                  <span>Edit Professional Profile</span>
                </Link>
              </div>

              {/* Today's Appointments Section */}
              <div style={{ marginTop: '20px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#212529' }}>
                      Today's Consultations ({todayAppointments.length})
                    </h2>
                    <p style={{ color: '#6c757d', fontSize: '0.88rem' }}>
                      Patients scheduled for medical examination today
                    </p>
                  </div>
                  <Link to="/doctor/appointments" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    View Full Schedule &rarr;
                  </Link>
                </div>

                <AppointmentTable
                  appointments={todayAppointments}
                  role="doctor"
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;
