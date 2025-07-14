import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Login function
export const login = (email, password) => {
  return axios.post(`${API_URL}/api/auth/login`, { email, password });
};

// Register function
export const registerUser = (userData) => {
  return axios.post(`${API_URL}/api/auth/register`, userData);
};
