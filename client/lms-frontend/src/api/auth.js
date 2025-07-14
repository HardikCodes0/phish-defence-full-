import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://phish-defence-full.onrender.com';

// Login function
export const login = (email, password) => {
  return axios.post(`${API_URL}/api/auth/login`, { email, password });
};

// Register function
export const registerUser = (userData) => {
  return axios.post(`${API_URL}/api/auth/register`, userData);
};
