import axiosClient from './axiosClient';
import { API_ENDPOINTS } from '../constants/api';
import { storageUtils } from '../utils/storage';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await axiosClient.post(API_ENDPOINTS.LOGIN, credentials);
      const { access_token } = response.data;

      storageUtils.setToken(access_token);

      // Get user data after login
      const userData = await authService.getCurrentUser();
      storageUtils.setUserData(userData);

      return { success: true, token: access_token, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  },

  logout: () => {
    storageUtils.clearAll();
    return { success: true };
  },

  getCurrentUser: async () => {
    try {
      const token = storageUtils.getToken();
      if (!token) throw new Error('No token');
      const response = await axiosClient.get(`${API_ENDPOINTS.GET_USER}/${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  isAuthenticated: () => {
    return storageUtils.isAuthenticated();
  },

  getStoredUser: () => {
    return storageUtils.getUserData();
  },
};