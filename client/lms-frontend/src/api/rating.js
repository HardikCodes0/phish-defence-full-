import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Set auth header
const setAuthHeader = () => {
  const token = getAuthToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Submit or update a rating
export const submitRating = async (courseId, rating, review = '') => {
  try {
    setAuthHeader();
    const response = await axios.post(`${API_BASE_URL}/ratings/submit`, {
      courseId,
      rating,
      review
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error submitting rating' };
  }
};

// Get all ratings for a course
export const getCourseRatings = async (courseId, page = 1, limit = 10) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/ratings/course/${courseId}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching ratings' };
  }
};

// Get user's rating for a specific course
export const getUserRating = async (courseId) => {
  try {
    setAuthHeader();
    const response = await axios.get(`${API_BASE_URL}/ratings/user/${courseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching user rating' };
  }
};

// Delete user's rating
export const deleteRating = async (courseId) => {
  try {
    setAuthHeader();
    const response = await axios.delete(`${API_BASE_URL}/ratings/${courseId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting rating' };
  }
}; 