import api from './api';

const doctorService = {
  /**
   * Fetch all doctors with optional query params (search, specialization, department)
   */
  getDoctors: async (params = {}) => {
    const response = await api.get('/doctors', { params });
    return response.data;
  },

  /**
   * Get doctor by ID
   */
  getDoctorById: async (id) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },

  /**
   * Get doctor availability slots for a specific date
   */
  getDoctorAvailability: async (doctorId, date) => {
    const response = await api.get(`/doctors/${doctorId}/availability`, {
      params: { date },
    });
    return response.data;
  },

  /**
   * Get logged-in doctor profile
   */
  getMyDoctorProfile: async () => {
    const response = await api.get('/doctors/profile/me');
    return response.data;
  },

  /**
   * Update logged-in doctor profile
   */
  updateDoctorProfile: async (profileData) => {
    const response = await api.put('/doctors/profile', profileData);
    return response.data;
  },

  /**
   * Add availability slots (Doctor only)
   */
  addAvailability: async (availabilityData) => {
    const response = await api.post('/doctors/availability', availabilityData);
    return response.data;
  },

  /**
   * Get all schedule dates for logged-in doctor
   */
  getMyAvailability: async () => {
    const response = await api.get('/doctors/availability/me');
    return response.data;
  },

  /**
   * Delete slot by date and slot ID
   */
  deleteSlot: async (date, slotId) => {
    const response = await api.delete(`/doctors/availability/${date}/slots/${slotId}`);
    return response.data;
  },
};

export default doctorService;
