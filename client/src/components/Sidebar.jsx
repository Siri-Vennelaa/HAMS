import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Hospital,
  LayoutDashboard,
  Search,
  CalendarCheck,
  User,
  Clock,
  Users,
  LogOut,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'patient';

  const getNavLinks = () => {
    if (role === 'patient') {
      return [
        { to: '/patient/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
        { to: '/patient/doctors', label: 'Find Doctors', icon: <Search size={19} /> },
        { to: '/patient/appointments', label: 'My Appointments', icon: <CalendarCheck size={19} /> },
        { to: '/patient/profile', label: 'Profile', icon: <User size={19} /> },
      ];
    } else if (role === 'doctor') {
      return [
        { to: '/doctor/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
        { to: '/doctor/appointments', label: 'Appointments', icon: <CalendarCheck size={19} /> },
        { to: '/doctor/schedule', label: 'Availability', icon: <Clock size={19} /> },
        { to: '/doctor/profile', label: 'Profile', icon: <User size={19} /> },
      ];
    } else if (role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={19} /> },
        { to: '/admin/doctors', label: 'Manage Doctors', icon: <Stethoscope size={19} /> },
        { to: '/admin/patients', label: 'Manage Patients', icon: <Users size={19} /> },
        { to: '/admin/appointments', label: 'Appointments', icon: <CalendarCheck size={19} /> },
      ];
    }
    return [];
  };

  const links = getNavLinks();

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <Hospital size={22} />
          </div>
          <div>
            <div className="sidebar-logo-text">CarePulse</div>
            <span className="sidebar-role-badge">{role} Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 95,
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
