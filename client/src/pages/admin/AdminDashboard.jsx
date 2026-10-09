import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  Users,
  CalendarCheck,
  Clock,
  UserPlus,
  Calendar,
  AlertCircle,
  CheckCircle,
  Shield,
  ArrowRight,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import adminService from '../../services/adminService';
import '../../styles/dashboard.css';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getStats();
      if (res && res.success) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrative statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar title="Administration Portal" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-container">
          <div className="page-header">
            <div>
              <h1>Hospital Overview & System Metrics</h1>
              <p>Real-time analytics across medical staff, registered patients, and appointment logs.</p>
            </div>
            <Link to="/admin/doctors" className="btn btn-primary">
              <UserPlus size={16} />
              <span>Add New Doctor</span>
            </Link>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <LoadingSpinner fullPage message="Fetching hospital administration metrics..." />
          ) : stats ? (
            <>
              {/* Stat Cards Grid */}
              <div className="stat-cards-grid">
                <StatCard
                  title="Total Doctors"
                  value={stats.totalDoctors}
                  icon={<Stethoscope size={24} />}
                  color="blue"
                />
                <StatCard
                  title="Total Patients"
                  value={stats.totalPatients}
                  icon={<Users size={24} />}
                  color="green"
                />
                <StatCard
                  title="Total Appointments"
                  value={stats.totalAppointments}
                  icon={<CalendarCheck size={24} />}
                  color="yellow"
                />
                <StatCard
                  title="Today's Appointments"
                  value={stats.todayAppointments}
                  icon={<Clock size={24} />}
                  color="red"
                />
              </div>

              {/* Status Breakdown Bar */}
              {stats.statusBreakdown && (
                <div
                  className="card"
                  style={{
                    marginBottom: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    padding: '18px 24px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    <Shield size={18} color="#0d6efd" />
                    <span>Appointment Status Breakdown:</span>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                    <span className="badge badge-pending">
                      Pending: {stats.statusBreakdown.pending || 0}
                    </span>
                    <span className="badge badge-confirmed">
                      Confirmed: {stats.statusBreakdown.confirmed || 0}
                    </span>
                    <span className="badge badge-completed">
                      Completed: {stats.statusBreakdown.completed || 0}
                    </span>
                    <span className="badge badge-cancelled">
                      Cancelled: {stats.statusBreakdown.cancelled || 0}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Actions Strip */}
              <div className="quick-actions-bar">
                <Link to="/admin/doctors" className="btn btn-outline">
                  <Stethoscope size={16} />
                  <span>Manage Doctors</span>
                </Link>
                <Link to="/admin/patients" className="btn btn-outline">
                  <Users size={16} />
                  <span>Manage Patients</span>
                </Link>
                <Link to="/admin/appointments" className="btn btn-outline">
                  <CalendarCheck size={16} />
                  <span>Audit Appointments</span>
                </Link>
              </div>

              {/* Recent Activity Table */}
              <div style={{ marginTop: '24px' }}>
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
                      Recent Appointment Activity
                    </h2>
                    <p style={{ color: '#6c757d', fontSize: '0.88rem' }}>
                      Latest patient booking transactions logged into the system
                    </p>
                  </div>
                  <Link to="/admin/appointments" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    View All Activity &rarr;
                  </Link>
                </div>

                <div className="table-responsive">
                  <table className="app-table">
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Doctor Name</th>
                        <th>Scheduled Date</th>
                        <th>Slot</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentAppointments && stats.recentAppointments.length > 0 ? (
                        stats.recentAppointments.map((appt) => (
                          <tr key={appt._id}>
                            <td>
                              <strong>{appt.patientId?.name || 'Patient'}</strong>
                              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                {appt.patientId?.email}
                              </div>
                            </td>
                            <td>
                              <strong>{appt.doctorId?.name || 'Doctor'}</strong>
                              <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                                {appt.doctorId?.email}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Calendar size={14} color="#0d6efd" />
                                <span>{appt.appointmentDate}</span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Clock size={14} />
                                <span>{appt.timeSlot}</span>
                              </div>
                            </td>
                            <td>
                              <span className={`badge badge-${appt.status}`}>
                                {appt.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                            No recent appointments recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
