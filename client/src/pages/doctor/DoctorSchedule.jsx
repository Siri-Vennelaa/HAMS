import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  CalendarCheck,
  ShieldAlert,
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import doctorService from '../../services/doctorService';
import '../../styles/dashboard.css';

const presetSlotOptions = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
];

const DoctorSchedule = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Add slots state
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [customTime, setCustomTime] = useState('');

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await doctorService.getMyAvailability();
      if (res && res.success) {
        setSchedules(res.data);
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to load doctor schedule.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  const toggleSlotSelection = (slotTime) => {
    if (selectedSlots.includes(slotTime)) {
      setSelectedSlots(selectedSlots.filter((t) => t !== slotTime));
    } else {
      setSelectedSlots([...selectedSlots, slotTime]);
    }
  };

  const selectAllMorning = () => {
    const morning = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
    setSelectedSlots([...new Set([...selectedSlots, ...morning])]);
  };

  const selectAllAfternoon = () => {
    const afternoon = ['02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];
    setSelectedSlots([...new Set([...selectedSlots, ...afternoon])]);
  };

  const handleAddCustomTime = (e) => {
    e.preventDefault();
    if (!customTime.trim()) return;
    if (!selectedSlots.includes(customTime.trim())) {
      setSelectedSlots([...selectedSlots, customTime.trim()]);
    }
    setCustomTime('');
  };

  const handleSaveAvailability = async (e) => {
    e.preventDefault();
    if (!selectedDate) {
      setMessage({ type: 'danger', text: 'Please pick a consultation date.' });
      return;
    }
    if (selectedSlots.length === 0) {
      setMessage({ type: 'danger', text: 'Please select at least one time slot to add.' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: '', text: '' });

      const payload = {
        date: selectedDate,
        slots: selectedSlots.map((time) => ({ time, isBooked: false })),
      };

      const res = await doctorService.addAvailability(payload);
      if (res && res.success) {
        setMessage({
          type: 'success',
          text: `Successfully saved ${selectedSlots.length} slot(s) for ${selectedDate}.`,
        });
        setSelectedSlots([]);
        await fetchSchedule();
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to update schedule slots.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (date, slot) => {
    if (slot.isBooked) {
      setMessage({
        type: 'danger',
        text: 'Cannot delete a slot that has already been booked by a patient.',
      });
      return;
    }

    try {
      const res = await doctorService.deleteSlot(date, slot._id);
      if (res && res.success) {
        setMessage({
          type: 'success',
          text: `Time slot ${slot.time} on ${date} removed.`,
        });
        await fetchSchedule();
      }
    } catch (err) {
      setMessage({
        type: 'danger',
        text: err.response?.data?.message || 'Failed to remove slot.',
      });
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-wrapper">
        <Navbar title="Doctor Schedule & Availability" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="page-container">
          <div className="page-header">
            <div>
              <h1>Manage Consultation Availability</h1>
              <p>Configure dates and time slots when patients can book appointments with you.</p>
            </div>
          </div>

          {message.text && (
            <div className={`alert alert-${message.type}`} role="alert">
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '28px' }}>
            {/* Create Schedule Card */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="#0d6efd" />
                <span>Add Time Slots for a Date</span>
              </h3>

              <form onSubmit={handleSaveAvailability}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" htmlFor="scheduleDate">
                      Select Date *
                    </label>
                    <input
                      type="date"
                      id="scheduleDate"
                      className="form-control"
                      min={todayStr}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Quick Presets</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={selectAllMorning}
                      >
                        + Morning Shift (9am-12pm)
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={selectAllAfternoon}
                      >
                        + Afternoon Shift (2pm-5pm)
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label">
                    Click Slots to Offer ({selectedSlots.length} selected):
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {presetSlotOptions.map((time) => {
                      const isSelected = selectedSlots.includes(time);
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => toggleSlotSelection(time)}
                          className="btn btn-sm"
                          style={{
                            backgroundColor: isSelected ? 'var(--primary-color)' : '#ffffff',
                            color: isSelected ? '#ffffff' : '#212529',
                            borderColor: isSelected ? 'var(--primary-color)' : '#ced4da',
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || selectedSlots.length === 0}
                >
                  <Plus size={16} />
                  <span>{submitting ? 'Saving Slots...' : `Save ${selectedSlots.length} Slots`}</span>
                </button>
              </form>
            </div>

            {/* Active Schedule Overview */}
            <div className="card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheck size={20} color="#198754" />
                <span>Your Active Schedule</span>
              </h3>

              {loading ? (
                <LoadingSpinner message="Loading your schedule..." />
              ) : schedules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
                  <ShieldAlert size={36} color="#adb5bd" style={{ marginBottom: '8px' }} />
                  <p>You have not published any availability slots yet. Use the form above to add slots.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {schedules.map((schedule) => (
                    <div
                      key={schedule._id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                          <Calendar size={18} color="#0d6efd" />
                          <span>Date: {schedule.date}</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                          {schedule.slots.filter((s) => s.isBooked).length} booked /{' '}
                          {schedule.slots.length} total
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {schedule.slots.map((slot) => (
                          <div
                            key={slot._id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              backgroundColor: slot.isBooked ? '#e7f1ff' : '#ffffff',
                              border: `1px solid ${slot.isBooked ? '#0d6efd' : '#ced4da'}`,
                              color: slot.isBooked ? '#084298' : '#212529',
                            }}
                          >
                            <Clock size={13} />
                            <strong>{slot.time}</strong>
                            {slot.isBooked ? (
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  backgroundColor: '#0d6efd',
                                  color: '#ffffff',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  marginLeft: '4px',
                                }}
                              >
                                Booked
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteSlot(schedule.date, slot)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#dc3545',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  marginLeft: '4px',
                                }}
                                title="Remove unbooked time slot"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DoctorSchedule;
