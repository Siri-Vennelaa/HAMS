import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  DollarSign,
  Award,
  CheckCircle,
  AlertCircle,
  CalendarCheck,
  ArrowLeft,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import doctorService from '../../services/doctorService';
import appointmentService from '../../services/appointmentService';
import '../../styles/dashboard.css';

const BookAppointment = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);

  // Booking states
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');

  // Status & feedback
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. Fetch Doctor details on mount
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoadingDoctor(true);
        const res = await doctorService.getDoctorById(doctorId);
        if (res && res.success) {
          setDoctor(res.data);
        }
      } catch (err) {
        setApiError(err.response?.data?.message || 'Could not load doctor details.');
      } finally {
        setLoadingDoctor(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  // 2. Fetch Doctor slots when date changes
  const fetchSlots = async (date) => {
    try {
      setLoadingSlots(true);
      setSelectedSlot('');
      setApiError('');

      const res = await doctorService.getDoctorAvailability(doctorId, date);
      if (res && res.success && res.data) {
        setSlots(res.data.slots || []);
      } else {
        setSlots([]);
      }
    } catch (err) {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (doctorId && selectedDate) {
      fetchSlots(selectedDate);
    }
  }, [doctorId, selectedDate]);

  // Form Validation
  const validate = () => {
    const newErrors = {};
    if (!selectedDate) newErrors.date = 'Please select an appointment date.';
    if (!selectedSlot) newErrors.slot = 'Please select an available time slot.';
    if (!reason.trim()) {
      newErrors.reason = 'Please explain the primary reason for this consultation.';
    } else if (reason.trim().length < 5) {
      newErrors.reason = 'Reason must be at least 5 characters long.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Booking
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      setApiError('');
      setSuccessMessage('');

      const payload = {
        doctorId,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot,
        reason: reason.trim(),
      };

      const res = await appointmentService.bookAppointment(payload);
      if (res && res.success) {
        setSuccessMessage('Appointment booked successfully! Redirecting to your appointments...');
        setTimeout(() => {
          navigate('/patient/appointments');
        }, 1500);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to book appointment.';
      setApiError(msg);
      // Refresh slots in case slot was taken by someone else
      fetchSlots(selectedDate);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar title="Book Consultation" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-container">
          <div style={{ marginBottom: '20px' }}>
            <Link
              to="/patient/doctors"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#6c757d',
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to Doctors</span>
            </Link>
          </div>

          {loadingDoctor ? (
            <LoadingSpinner fullPage message="Loading doctor profile and calendar..." />
          ) : !doctor ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <AlertCircle size={40} color="#dc3545" style={{ marginBottom: '12px' }} />
              <h3>Doctor Not Found</h3>
              <p style={{ color: '#6c757d', margin: '8px 0 20px 0' }}>
                The requested doctor could not be located in our system directory.
              </p>
              <Link to="/patient/doctors" className="btn btn-primary">
                Return to Doctor Directory
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
              {/* Left Column: Doctor Profile Overview */}
              <div className="card" style={{ height: 'fit-content' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                  <img
                    src={doctor.profileImage || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300'}
                    alt={doctor.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid #e7f1ff',
                    }}
                  />
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: '#212529', marginBottom: '4px' }}>
                      {doctor.name}
                    </h3>
                    <div style={{ color: '#0d6efd', fontWeight: 600, fontSize: '0.92rem' }}>
                      {doctor.specialization}
                    </div>
                    <div style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                      {doctor.department} Department
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    fontSize: '0.9rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Clinical Experience:</span>
                    <strong>{doctor.experience || 0} Years</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6c757d' }}>Consultation Fee:</span>
                    <strong style={{ color: '#198754', fontSize: '1.05rem' }}>
                      ₹{doctor.consultationFee || 0}
                    </strong>
                  </div>
                  {doctor.qualification && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#6c757d' }}>Qualifications:</span>
                      <strong style={{ textAlign: 'right', maxWidth: '180px' }}>
                        {doctor.qualification}
                      </strong>
                    </div>
                  )}
                </div>

                {doctor.bio && (
                  <div>
                    <h5 style={{ fontSize: '0.92rem', color: '#212529', marginBottom: '6px' }}>
                      Doctor Bio
                    </h5>
                    <p style={{ color: '#6c757d', fontSize: '0.86rem', lineHeight: '1.5' }}>
                      {doctor.bio}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Appointment Booking Form */}
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarCheck size={20} color="#0d6efd" />
                  <span>Select Consultation Time</span>
                </h3>

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

                <form onSubmit={handleBookingSubmit} noValidate>
                  {/* Date Selector */}
                  <div className="form-group">
                    <label className="form-label" htmlFor="appointmentDate">
                      1. Select Appointment Date *
                    </label>
                    <input
                      type="date"
                      id="appointmentDate"
                      className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                      min={todayStr}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    {errors.date && <div className="invalid-feedback">{errors.date}</div>}
                  </div>

                  {/* Slot Selector */}
                  <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label">
                      2. Available Time Slots on {selectedDate} *
                    </label>

                    {loadingSlots ? (
                      <LoadingSpinner message="Checking available slots..." />
                    ) : slots.length === 0 ? (
                      <div
                        style={{
                          backgroundColor: '#fff3cd',
                          padding: '14px',
                          borderRadius: '8px',
                          color: '#856404',
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <AlertCircle size={18} />
                        <span>No consultation slots opened by this doctor on this date. Please try another date.</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                        {slots.map((slot) => {
                          const isSelected = selectedSlot === slot.time;
                          return (
                            <button
                              key={slot._id || slot.time}
                              type="button"
                              disabled={slot.isBooked || isSubmitting}
                              onClick={() => {
                                setSelectedSlot(slot.time);
                                if (errors.slot) setErrors((prev) => ({ ...prev, slot: '' }));
                              }}
                              className="btn btn-sm"
                              style={{
                                backgroundColor: slot.isBooked
                                  ? '#e9ecef'
                                  : isSelected
                                  ? 'var(--primary-color)'
                                  : '#ffffff',
                                color: slot.isBooked
                                  ? '#adb5bd'
                                  : isSelected
                                  ? '#ffffff'
                                  : 'var(--text-main)',
                                borderColor: slot.isBooked
                                  ? '#dee2e6'
                                  : isSelected
                                  ? 'var(--primary-color)'
                                  : 'var(--border-color)',
                                cursor: slot.isBooked ? 'not-allowed' : 'pointer',
                                fontWeight: isSelected ? 600 : 400,
                              }}
                            >
                              <Clock size={13} />
                              <span>{slot.time}</span>
                              {slot.isBooked && (
                                <span style={{ fontSize: '0.72rem', marginLeft: '4px', color: '#6c757d' }}>
                                  (Booked)
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                    {errors.slot && <div className="invalid-feedback" style={{ display: 'block' }}>{errors.slot}</div>}
                  </div>

                  {/* Reason for Visit */}
                  <div className="form-group" style={{ marginTop: '20px' }}>
                    <label className="form-label" htmlFor="reason">
                      3. Reason for Visit / Medical Symptoms *
                    </label>
                    <textarea
                      id="reason"
                      rows={3}
                      className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
                      placeholder="Briefly describe your symptoms or reason for visit (e.g. routine checkup, persistent chest pain, headache)..."
                      value={reason}
                      onChange={(e) => {
                        setReason(e.target.value);
                        if (errors.reason) setErrors((prev) => ({ ...prev, reason: '' }));
                      }}
                      disabled={isSubmitting}
                    />
                    {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', marginTop: '12px', fontSize: '1rem' }}
                    disabled={isSubmitting || !selectedSlot}
                  >
                    <CalendarCheck size={18} />
                    <span>
                      {isSubmitting
                        ? 'Confirming with Doctor...'
                        : selectedSlot
                        ? `Confirm Booking for ${selectedSlot}`
                        : 'Select a Time Slot Above'}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookAppointment;
