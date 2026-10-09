import React from 'react';

const StatCard = ({ title, value, icon, color = 'blue' }) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon-wrapper stat-icon-${color}`}>{icon}</div>
      <div className="stat-info">
        <span className="stat-value">{value ?? 0}</span>
        <span className="stat-label">{title}</span>
      </div>
    </div>
  );
};

export default StatCard;
