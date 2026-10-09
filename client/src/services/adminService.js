import api from './api';

const adminService = {
  /**
   * Get administrative statistics
   */
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  /**
   * Get all doctors list
   */
  getDoctors: async () => {
    const response = await api.get('/admin/doctors');
    return response.data;
  },

  /**
   * Create a new doctor user and profile
   */
  createDoctor: async (doctorData) => {
    const response = await api.post('/admin/doctors', doctorData);
    return response.data;
  },

  /**
   * Update existing doctor
   */
  updateDoctor: async (id, doctorData) => {
    const response = await api.put(`/admin/doctors/${id}`, doctorData);
    return response.data;
  },

  /**
   * Delete or deactivate doctor
   */
  deleteDoctor: async (id) => {
    const response = await api.delete(`/admin/doctors/${id}`);
    return response.data;
  },

  /**
   * Get all registered patients
   */
  getPatients: async () => {
    const response = await api.get('/admin/patients');
    return response.data;
  },

  /**
   * Delete patient account
   */
  deletePatient: async (id) => {
    const response = await api.delete(`/admin/patients/${id}`);
    return response.data;
  },

  /**
   * Get system-wide appointments with optional filters (date, status, doctorId)
   */
  getAppointments: async (params = {}) => {
    const response = await api.get('/admin/appointments', { params });
    return response.data;
  },
};

export default adminService;
