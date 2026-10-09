import React from 'react';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title = 'Dashboard', onToggleSidebar }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          className="mobile-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={22} />
        </button>
        <h2 className="navbar-title">{title}</h2>
      </div>

      <div className="navbar-user-section">
        <button className="notification-bell" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-dot" />
        </button>

        <div className="user-profile-badge">
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Patient'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
