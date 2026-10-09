import api from './api';

const authService = {
  /**
   * Log in user
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  /**
   * Register a new patient
   * @param {object} userData
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Fetch current authenticated user's profile from token
   */
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
