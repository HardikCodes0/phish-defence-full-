import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Set auth header for requests
const setAuthHeader = () => {
  const token = getAuthToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Create a new quiz for a course
export const createQuiz = async (quizData) => {
  setAuthHeader();
  try {
    const response = await axios.post(`${API_BASE_URL}/quiz/create`, quizData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get quiz for a course (without answers)
export const getQuiz = async (courseId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/quiz/course/${courseId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get quiz with answers (for admin)
export const getQuizWithAnswers = async (courseId) => {
  setAuthHeader();
  try {
    const response = await axios.get(`${API_BASE_URL}/quiz/course/${courseId}/with-answers`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update quiz
export const updateQuiz = async (courseId, quizData) => {
  setAuthHeader();
  try {
    const response = await axios.put(`${API_BASE_URL}/quiz/course/${courseId}`, quizData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete quiz
export const deleteQuiz = async (courseId) => {
  setAuthHeader();
  try {
    const response = await axios.delete(`${API_BASE_URL}/quiz/course/${courseId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Submit quiz attempt
export const submitQuiz = async (courseId, answers, timeTaken) => {
  setAuthHeader();
  try {
    const response = await axios.post(`${API_BASE_URL}/quiz/submit`, {
      courseId,
      answers,
      timeTaken
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Get user's quiz attempt for a course
export const getUserQuizAttempt = async (courseId) => {
  setAuthHeader();
  try {
    const response = await axios.get(`${API_BASE_URL}/quiz/course/${courseId}/attempt`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Get all quiz attempts for a course (admin only)
export const getCourseQuizAttempts = async (courseId) => {
  setAuthHeader();
  try {
    const response = await axios.get(`${API_BASE_URL}/quiz/course/${courseId}/attempts`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Check if user is eligible for quiz
export const checkQuizEligibility = async (courseId) => {
  setAuthHeader();
  try {
    const response = await axios.get(`${API_BASE_URL}/quiz/course/${courseId}/eligibility`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Block user from quiz for 10 days
export const blockUserForQuiz = async (courseId, userId) => {
  setAuthHeader();
  try {
    const response = await axios.post(`${API_BASE_URL}/quiz/block`, { courseId, userId });
    return response;
  } catch (error) {
    throw error;
  }
}; 