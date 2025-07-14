// user.js
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'https://phish-defence-full.onrender.com';
const API = `${API_URL}/api/auth`;
export const registerUser = (data) => axios.post(`${API}/register`, data);
export const getUserById = (id) => axios.get(`${API_URL}/api/users/${id}`);
export const changePassword = (data, token) => axios.put(`${API_URL}/api/users/changepassword`, data, { headers: { Authorization: `Bearer ${token}` } });