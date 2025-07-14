// user.js
import axios from 'axios';
const API = 'http://localhost:5000/api/auth'; // Changed to /api/auth
export const registerUser = (data) => axios.post(`${API}/register`, data);
export const getUserById = (id) => axios.get(`http://localhost:5000/api/users/${id}`);
export const changePassword = (data, token) => axios.put('http://localhost:5000/api/users/changepassword', data, { headers: { Authorization: `Bearer ${token}` } });