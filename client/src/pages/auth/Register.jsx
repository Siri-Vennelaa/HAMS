import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hospital, User, Mail, Phone, Lock, Eye, EyeOff, Calendar, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: 'other',
    dateOfBirth: '',
    address: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirming your password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError('');
    setSuccessMessage('');

    try {
      await register(formData);
      setSuccessMessage('Registration successful! Redirecting you to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setApiError(msg);
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
          <h1>Join Our Healthcare Community</h1>
          <p>
            Create your patient portal account in less than a minute. Gain instant access to our online appointment
            booking system, top specialist doctors, and personal medical visit history.
          </p>
        </div>

        <div className="brand-footer">
          &copy; {new Date().getFullYear()} CarePulse Hospital Management System. All rights reserved.
        </div>
      </div>

      {/* Right Registration Form Side */}
      <div className="auth-form-side">
        <div className="auth-card auth-card-wide">
          <div className="auth-card-header">
            <h2>Patient Registration</h2>
            <p>Register as a patient to schedule appointments with our medical specialists</p>
          </div>

          {apiError && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={18} />
              <span>{apiError}</span>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success" role="alert">
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  placeholder="+1-555-0199"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isLoading}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="dateOfBirth">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  className="form-control"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">
                  Residential Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="form-control"
                  placeholder="Street, City, Zip"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password *
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password *
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '10px' }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Patient Account...' : 'Complete Registration'}
            </button>

            <div className="auth-footer-prompt">
              Already have an account?
              <Link to="/login">Sign In</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
