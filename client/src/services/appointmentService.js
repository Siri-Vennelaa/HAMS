import api from './api';

const appointmentService = {
  /**
   * Book a new appointment (Patient)
   */
  bookAppointment: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  /**
   * Get patient's appointments and summary statistics
   */
  getMyAppointments: async () => {
    const response = await api.get('/appointments/my');
    return response.data;
  },

  /**
   * Get doctor's appointments with optional filters (filter=today, upcoming, etc.)
   */
  getDoctorAppointments: async (params = {}) => {
    const response = await api.get('/appointments/doctor', { params });
    return response.data;
  },

  /**
   * Update appointment status (Doctor: confirmed, rejected, completed)
   */
  updateAppointmentStatus: async (appointmentId, status, notes = '') => {
    const response = await api.patch(`/appointments/${appointmentId}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  /**
   * Cancel an appointment (Patient, Doctor, or Admin)
   */
  cancelAppointment: async (appointmentId, reason = '') => {
    const response = await api.patch(`/appointments/${appointmentId}/cancel`, {
      reason,
    });
    return response.data;
  },
};

export default appointmentService;
