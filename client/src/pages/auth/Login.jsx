import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hospital, Mail, Lock, Eye, EyeOff, ShieldCheck, CalendarCheck, Stethoscope, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on edit
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError('');

    try {
      const response = await login(formData.email, formData.password);
      if (response && response.user) {
        const role = response.user.role;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'doctor') navigate('/doctor/dashboard');
        else navigate('/patient/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setApiError(msg);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="auth-container">
      {/* Left Branding Side */}
      <div className="auth-brand-side">
        <div className="brand-header">
          <div className="brand-icon">
            <Hospital size={26} color="#ffffff" />
          </div>
          <span className="brand-name">CarePulse Hospital</span>
        </div>

        <div className="brand-hero">
          <h1>Modern Healthcare Appointment Portal</h1>
          <p>
            Experience seamless medical appointments, certified specialists, real-time doctor availability,
            and complete healthcare record tracking designed for patients, doctors, and staff.
          </p>

          <div className="brand-features">
            <div className="brand-feature-item">
              <CalendarCheck size={20} color="#ffffff" />
              <span>Instant slot booking & automated schedule management</span>
            </div>
            <div className="brand-feature-item">
              <Stethoscope size={20} color="#ffffff" />
              <span>Access to certified doctors across multi-specialty departments</span>
            </div>
            <div className="brand-feature-item">
              <ShieldCheck size={20} color="#ffffff" />
              <span>Role-secured access for Patients, Doctors, and Administrators</span>
            </div>
          </div>
        </div>

        <div className="brand-footer">
          &copy; {new Date().getFullYear()} CarePulse Hospital Management System. All rights reserved.
        </div>
      </div>

      {/* Right Login Form Side */}
      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>Welcome Back</h2>
            <p>Please enter your account details to sign in</p>
          </div>

          {apiError && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <div className="password-input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>

            <div className="auth-extra-links">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact hospital administration at admin@hospital.com to reset credentials.'); }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="auth-footer-prompt">
              Don't have an account yet?
              <Link to="/register">Register as Patient</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
