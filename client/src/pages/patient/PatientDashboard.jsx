import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  CheckCircle,
  XCircle,
  CalendarPlus,
  Search,
  Calendar,
  AlertCircle,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import DoctorCard from '../../components/DoctorCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import appointmentService from '../../services/appointmentService';
import doctorService from '../../services/doctorService';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  });
  const [nextUpcoming, setNextUpcoming] = useState(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch live appointment stats and next upcoming
        const apptData = await appointmentService.getMyAppointments();
        if (apptData?.success) {
          setStats(apptData.stats || { total: 0, upcoming: 0, completed: 0, cancelled: 0 });
          setNextUpcoming(apptData.nextUpcoming || null);
        }

        // Fetch doctors for recommended section
        const docsData = await doctorService.getDoctors();
        if (docsData?.success) {
          // Take top 3-4 doctors as recommended
          setRecommendedDoctors(docsData.data.slice(0, 4));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar
          title="Patient Dashboard"
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="page-container">
          <div className="page-header">
            <div>
              <h1>Welcome back, {user?.name || 'Patient'}!</h1>
              <p>Manage your health checkups, appointments, and medical specialists in one place.</p>
            </div>
            <Link to="/patient/doctors" className="btn btn-primary">
              <CalendarPlus size={18} />
              <span>Book New Appointment</span>
            </Link>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <LoadingSpinner fullPage message="Loading your health portal..." />
          ) : (
            <>
              {/* Stat Cards Grid */}
              <div className="stat-cards-grid">
                <StatCard
                  title="Total Appointments"
                  value={stats.total}
                  icon={<CalendarCheck size={24} />}
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
                  title="Cancelled"
                  value={stats.cancelled}
                  icon={<XCircle size={24} />}
                  color="red"
                />
              </div>

              {/* Quick Actions Strip */}
              <div className="quick-actions-bar">
                <Link to="/patient/doctors" className="btn btn-outline">
                  <CalendarPlus size={16} />
                  <span>Book Appointment</span>
                </Link>
                <Link to="/patient/doctors" className="btn btn-outline">
                  <Search size={16} />
                  <span>Find Doctor</span>
                </Link>
                <Link to="/patient/appointments" className="btn btn-outline">
                  <CalendarCheck size={16} />
                  <span>View Appointments</span>
                </Link>
              </div>

              {/* Upcoming Appointment Highlight */}
              {nextUpcoming ? (
                <div className="highlight-card">
                  <div className="highlight-left">
                    <span
                      style={{
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '1px',
                        background: 'rgba(255,255,255,0.2)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                      }}
                    >
                      Next Scheduled Visit
                    </span>
                    <h3 style={{ marginTop: '10px' }}>
                      {nextUpcoming.doctorId?.name || 'Dr. Specialist'}
                    </h3>
                    <p>
                      {nextUpcoming.doctorProfile?.specialization} &bull;{' '}
                      {nextUpcoming.doctorProfile?.department} Department
                    </p>

                    <div className="highlight-meta">
                      <div className="highlight-meta-item">
                        <Calendar size={16} />
                        <span>Date: {nextUpcoming.appointmentDate}</span>
                      </div>
                      <div className="highlight-meta-item">
                        <Clock size={16} />
                        <span>Time: {nextUpcoming.timeSlot}</span>
                      </div>
                      <div className="highlight-meta-item">
                        <span style={{ textTransform: 'capitalize' }}>
                          Status: {nextUpcoming.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Link
                      to="/patient/appointments"
                      className="btn btn-light"
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#0d6efd',
                        fontWeight: 600,
                      }}
                    >
                      <span>Manage Visit</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  className="card"
                  style={{
                    marginBottom: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '50%',
                        backgroundColor: '#e7f1ff',
                        color: '#0d6efd',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <h4 style={{ color: '#212529', marginBottom: '2px' }}>
                        No Upcoming Appointments
                      </h4>
                      <p style={{ color: '#6c757d', fontSize: '0.88rem' }}>
                        You currently do not have any pending or confirmed appointments scheduled.
                      </p>
                    </div>
                  </div>
                  <Link to="/patient/doctors" className="btn btn-primary btn-sm">
                    Find a Doctor
                  </Link>
                </div>
              )}

              {/* Recommended Doctors Section */}
              <div style={{ marginTop: '36px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#212529' }}>
                      Recommended Specialists
                    </h2>
                    <p style={{ color: '#6c757d', fontSize: '0.88rem' }}>
                      Top-rated hospital physicians ready for consultation
                    </p>
                  </div>
                  <Link to="/patient/doctors" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    View All Doctors &rarr;
                  </Link>
                </div>

                <div className="doctors-grid">
                  {recommendedDoctors.map((doc) => (
                    <DoctorCard key={doc.doctorId || doc._id} doctor={doc} />
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
