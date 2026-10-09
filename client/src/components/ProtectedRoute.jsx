import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute guards routes based on authentication and authorized roles
 * @param {Array<string>} allowedRoles - Optional list of permitted roles (e.g. ['patient'])
 * @param {React.ReactNode} children - Optional direct child component
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner fullPage message="Verifying authentication session..." />;
  }

  // Not logged in -> redirect to login preserving intent
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles required and user does not match -> redirect to user's assigned dashboard
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    let target = '/patient/dashboard';
    if (user.role === 'admin') target = '/admin/dashboard';
    else if (user.role === 'doctor') target = '/doctor/dashboard';

    return <Navigate to={target} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
