import { STORAGE_KEYS } from '../constants/storage';

export const storageUtils = {
  // Token management
  setToken: (token) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  },
  
  getToken: () => {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
  
  removeToken: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
  
  // User data management
  setUserData: (userData) => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  },
  
  getUserData: () => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  },
  
  removeUserData: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  },
  
  // Clear all storage
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  },
};