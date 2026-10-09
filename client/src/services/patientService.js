import api from './api';

const patientService = {
  /**
   * Get patient profile
   */
  getProfile: async () => {
    const response = await api.get('/patients/profile');
    return response.data;
  },

  /**
   * Update patient profile
   */
  updateProfile: async (profileData) => {
    const response = await api.put('/patients/profile', profileData);
    return response.data;
  },
};

export default patientService;
