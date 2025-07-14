import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Helper to set auth header
const setAuthHeader = () => {
  const token = localStorage.getItem('token');
  console.log('🔑 Setting auth header, token exists:', !!token);
  
  if (token) {
    // Basic token validation
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const currentTime = Date.now() / 1000;
        console.log('🔑 Token expiry check:', { exp: payload.exp, current: currentTime, valid: payload.exp > currentTime });
        
        if (payload.exp > currentTime) {
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          console.log('✅ Auth header set successfully');
          return true;
        } else {
          console.log('❌ Token expired');
        }
      } else {
        console.log('❌ Invalid token format');
      }
    } catch (error) {
      console.error('❌ Token validation error:', error);
    }
    
    // Clear invalid token
    console.log('🧹 Clearing invalid token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete API.defaults.headers.common['Authorization'];
    return false;
  } else {
    console.log('❌ No token found');
    delete API.defaults.headers.common['Authorization'];
    return false;
  }
};

// Add response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔒 API - Unauthorized, clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const fetchCourses = () => API.get('/courses');
export const createCourse = (courseData) => {
  if (!setAuthHeader()) {
    return Promise.reject(new Error('No valid authentication token'));
  }
  return API.post('/courses/add', courseData);
};
export const fetchCourseById = (id) => API.get(`/courses/${id}`);
export const deleteCourse = (id) => {
  console.log('🗑️ Delete course called for ID:', id);
  
  // Force set auth header before making the request
  const authSet = setAuthHeader();
  console.log('🔑 Auth header set result:', authSet);
  
  if (!authSet) {
    console.error('❌ Failed to set auth header for delete course');
    return Promise.reject(new Error('No valid authentication token'));
  }
  
  console.log('✅ Making delete request with headers:', API.defaults.headers.common);
  return API.delete(`/courses/${id}`);
};
export const updateCourse = (id, data) => {
  if (!setAuthHeader()) {
    return Promise.reject(new Error('No valid authentication token'));
  }
  return API.patch(`/courses/${id}`, data);
};

// LESSON MANAGEMENT
export const updateLesson = (lessonId, data) => {
  if (!setAuthHeader()) {
    return Promise.reject(new Error('No valid authentication token'));
  }
  return API.patch(`/lesson/${lessonId}`, data);
};

export const deleteLesson = (lessonId) => {
  if (!setAuthHeader()) {
    return Promise.reject(new Error('No valid authentication token'));
  }
  return API.delete(`/lesson/${lessonId}`);
};

export const deleteLessonResource = (lessonId, resourceIndex) => {
  if (!setAuthHeader()) {
    return Promise.reject(new Error('No valid authentication token'));
  }
  return API.delete(`/lesson/resource/${lessonId}/${resourceIndex}`);
};

// Fetch all courses a user is enrolled in
export const getUserEnrolledCourses = (userId) => {
  if (!setAuthHeader()) {
    return Promise.reject(new Error('No valid authentication token'));
  }
  return API.get(`/enroll/${userId}`);
};

// Enroll a user in a course
export const enrollUserInCourse = (userId, courseId) => {
  if (!setAuthHeader()) {
    return Promise.reject(new Error('No valid authentication token'));
  }
  return API.post('/enroll/enroll', { student: userId, course: courseId });
};

// Mark a lesson as completed
export const completeLesson = (student, course, lesson) => {
  if (!setAuthHeader()) {
    return Promise.reject(new Error('No valid authentication token'));
  }
  return API.post('/enroll/complete-lesson', { student, course, lesson });
};

// Get all enrollments with progress for a user
export const getUserProgress = (userId) => {
  if (!setAuthHeader()) {
    return Promise.reject(new Error('No valid authentication token'));
  }
  return API.get(`/enroll/progress/${userId}`);
};

// Create Stripe Checkout Session
export const createStripeCheckoutSession = (courseId) => {
  const token = localStorage.getItem('token');
  return API.post('/payment/create-checkout-session', { courseId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Verify payment and enroll user
export const verifyPayment = (sessionId) => {
  const token = localStorage.getItem('token');
  return API.post('/payment/verify-payment', { sessionId }, {
    headers: { Authorization: `Bearer ${token}` }
  });
};