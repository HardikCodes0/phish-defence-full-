import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play, Clock, Users, Star, BookOpen, CheckCircle,
  Lock, Unlock, Download, Share2, Heart, ChevronDown, ChevronRight,
  Award, Globe, Zap, FileText, Medal, FolderOpen, ExternalLink,
  User, MapPin, Calendar, GraduationCap, TrendingUp, MessageCircle, Mail, XCircle, Target
} from 'lucide-react';
import axios from 'axios';
import { enrollUserInCourse, deleteCourse, completeLesson, updateCourse, updateLesson, deleteLesson, deleteLessonResource, createStripeCheckoutSession, verifyPayment } from '../api/course';
import { AuthContext } from '../context/authcontext';
import { DashboardRefreshContext } from '../contexts/DashboardRefreshContext';
import RatingSystem from '../components/RatingSystem';
import { useTheme } from '../contexts/ThemeContext';

const CERTIFICATE_OPTIONS = ['Included', 'Not Included', 'On Completion'];
const ACCESS_OPTIONS = ['Lifetime', '1 Year', '6 Months', 'No Access'];

const API_URL = import.meta.env.VITE_API_URL || 'https://phish-defence-full.onrender.com';

const CourseDetail = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);
  const [openResourcesDropdown, setOpenResourcesDropdown] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { triggerRefresh } = useContext(DashboardRefreshContext);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [checkingEnrollment, setCheckingEnrollment] = useState(false);
  const [lessonResources, setLessonResources] = useState({}); // {lessonId: [resources]}
  const [editLessons, setEditLessons] = useState([]);
  const [editLessonModal, setEditLessonModal] = useState({ open: false, lesson: null });
  const [newLesson, setNewLesson] = useState({ title: '', content: '', videourl: '', pdfurl: '', order: 1 });
  const [addingLesson, setAddingLesson] = useState(false);
  const [resourceInput, setResourceInput] = useState({ name: '', type: 'PDF', url: '' });
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceUploadingLesson, setResourceUploadingLesson] = useState(null);
  const [resourceUploadProgress, setResourceUploadProgress] = useState(0);
  // Track completed lessons for the user
  const [completedLessonsByUser, setCompletedLessonsByUser] = useState({});
  const [markingLesson, setMarkingLesson] = useState({});
  // Track video progress for automatic completion
  const [videoProgress, setVideoProgress] = useState({});
  const [autoCompleting, setAutoCompleting] = useState({});
  const [showAutoCompleteNotification, setShowAutoCompleteNotification] = useState(false);
  const [autoCompletedLesson, setAutoCompletedLesson] = useState(null);
  // Quiz state
  const [quizAttempt, setQuizAttempt] = useState(null);
  const [quizEligibility, setQuizEligibility] = useState(null);

  // Calculate total lessons and duration
  const totalLessons = lessons.length;
  const totalDuration = lessons.length > 0
    ? lessons.reduce((acc, l) => acc + (parseInt(l.duration) || 0), 0)
    : (course?.duration || 0);

  // Get instructor data from course - only return data if instructor has meaningful information
  const getInstructorData = () => {
    if (!course || !course.instructor) return null;
    
    // Check if instructor has meaningful data (not just default/empty values)
    const instructor = course.instructor;
    const hasName = instructor.name && instructor.name.trim() !== '';
    const hasTitle = instructor.title && instructor.title.trim() !== '';
    const hasAbout = instructor.about && instructor.about.trim() !== '';
    const hasExperience = instructor.experience && instructor.experience.trim() !== '';
    const hasEducation = instructor.education && instructor.education.trim() !== '';

    const hasSpecializations = instructor.specializations && instructor.specializations.length > 0;
    const hasAchievements = instructor.achievements && instructor.achievements.length > 0;
    
    // Only return instructor data if there's meaningful information
    if (!hasName && !hasTitle && !hasAbout && !hasExperience && !hasEducation && !hasSpecializations && !hasAchievements) {
      return null;
    }
    
    return {
      name: instructor.name || 'Instructor',
      title: instructor.title || 'Senior Software Engineer & Educator',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: instructor.about || 'Experienced instructor with expertise in cybersecurity and software development.',
      experience: instructor.experience || '5+ Years Experience',
      students: instructor.students || '12,000+ Students Taught',
      courses: instructor.courses || '15 Courses Created',
      rating: instructor.rating || '4.8',
      location: instructor.location || 'San Francisco, CA',
      education: instructor.education || 'M.S. Computer Science, Stanford University',
      specializations: instructor.specializations || ['Web Development', 'JavaScript', 'React', 'Node.js', 'Full-Stack Development'],
      achievements: instructor.achievements || [
        'Top-rated instructor on multiple platforms',
        'Former Senior Engineer at Google',
        'Speaker at tech conferences worldwide',
        'Published author of 3 programming books'
      ],
      linkedinProfile: instructor.linkedinProfile || '',
      email: instructor.email || ''
    };
  };

  const instructor = getInstructorData();

  // Fetch completed lessons for the user
  useEffect(() => {
    const fetchCompletedLessons = async () => {
      if (!user || !user._id || !course?._id) return;
      try {
        const res = await axios.get(`${API_URL}/api/enroll/progress/${user._id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const courseProgress = Array.isArray(res.data)
          ? res.data.find(p => p.course && p.course._id === course._id)
          : null;
        if (courseProgress && Array.isArray(courseProgress.completedlessons)) {
          const completedMap = {};
          courseProgress.completedlessons.forEach(l => {
            if (typeof l === 'string') completedMap[l] = true;
            else if (l && l._id) completedMap[l._id] = true;
          });
          setCompletedLessonsByUser(completedMap);
        } else {
          setCompletedLessonsByUser({});
        }
      } catch (err) {
        setCompletedLessonsByUser({});
      }
    };
    if (isEnrolled) fetchCompletedLessons();
  }, [user, course, isEnrolled, lessons.length, triggerRefresh]);

  // Handler for video progress tracking and automatic completion
  const handleVideoProgress = (lessonId, currentTime, duration) => {
    if (!duration || duration === 0) return;
    
    const progress = (currentTime / duration) * 100;
    setVideoProgress(prev => ({ ...prev, [lessonId]: progress }));
    
    // Save progress to localStorage
    const progressKey = `videoProgress_${course?._id}_${lessonId}`;
    localStorage.setItem(progressKey, progress.toString());
    
    // Auto-complete lesson when user reaches 99% of video
    if (progress >= 99 && !completedLessonsByUser[lessonId] && !autoCompleting[lessonId]) {
      handleAutoCompleteLesson(lessonId);
    }
  };

  // Auto-complete lesson function
  const handleAutoCompleteLesson = async (lessonId) => {
    if (!user || !user._id || !course?._id || completedLessonsByUser[lessonId]) return;
    
    setAutoCompleting(prev => ({ ...prev, [lessonId]: true }));
    try {
      await completeLesson(user._id, course._id, lessonId);
      setCompletedLessonsByUser(prev => ({ ...prev, [lessonId]: true }));
      triggerRefresh();
      
      // Show notification
      const lesson = lessons.find(l => l._id === lessonId);
      setAutoCompletedLesson(lesson);
      setShowAutoCompleteNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowAutoCompleteNotification(false);
        setAutoCompletedLesson(null);
      }, 3000);
      
      console.log(`✅ Lesson ${lessonId} auto-completed at 99% progress`);
    } catch (err) {
      console.error('Failed to auto-complete lesson:', err);
    } finally {
      setAutoCompleting(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  // Handler for lesson completion checkbox
  const handleLessonCompleteCheckbox = async (lessonId, checked) => {
    if (!user || !user._id || !course?._id) return;
    setMarkingLesson(prev => ({ ...prev, [lessonId]: true }));
    try {
      if (checked) {
        await completeLesson(user._id, course._id, lessonId);
        setCompletedLessonsByUser(prev => ({ ...prev, [lessonId]: true }));
      } else {
        // Unmarking: remove from completed lessons (custom endpoint needed)
        await axios.post(`${API_URL}/api/enroll/uncomplete-lesson`, {
          student: user._id,
          course: course._id,
          lesson: lessonId
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setCompletedLessonsByUser(prev => {
          const copy = { ...prev };
          delete copy[lessonId];
          return copy;
        });
        
        // Clear video progress when manually unchecked
        const progressKey = `videoProgress_${course._id}_${lessonId}`;
        localStorage.removeItem(progressKey);
        setVideoProgress(prev => {
          const copy = { ...prev };
          delete copy[lessonId];
          return copy;
        });
      }
      triggerRefresh();
    } catch (err) {
      alert('Failed to update lesson completion.');
    } finally {
      setMarkingLesson(prev => ({ ...prev, [lessonId]: false }));
    }
  };

  // Calculate completed lessons and progress
  const completedLessons = Object.keys(completedLessonsByUser).length;
  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/courses/${id}`);
        setCourse(res.data);
      } catch (err) {
        console.error('Error fetching course:', err);
      }
    };
    fetchCourse();
  }, [id]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        console.log('🔍 Fetching lessons for course:', id, 'with auth:', !!token);
        const res = await axios.get(`${API_URL}/api/lesson/${id}`, { headers });
        console.log('📚 Fetched lessons:', res.data);
        setLessons(res.data);
        
        // Load saved video progress from localStorage
        if (res.data.length > 0 && course?._id) {
          const savedProgress = {};
          res.data.forEach(lesson => {
            if (lesson.videourl) {
              const progressKey = `videoProgress_${course._id}_${lesson._id}`;
              const saved = localStorage.getItem(progressKey);
              if (saved) {
                savedProgress[lesson._id] = parseFloat(saved);
              }
            }
          });
          setVideoProgress(savedProgress);
        }
      } catch (err) {
        console.error('❌ Error fetching lessons:', err.response?.data || err.message);
        setLessons([]);
      }
    };
    if (id) fetchLessons();
  }, [id, course?._id]);

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!user || !user._id || !course?._id) return;
      
      console.log('🔍 Checking enrollment for:', { userId: user._id, courseId: course._id });
      
      try {
        const res = await axios.get(`${API_URL}/api/enroll/${user._id}`);
        const enrolledCourses = res.data;
        console.log('📚 Enrolled courses:', enrolledCourses);
        
        const alreadyEnrolled = enrolledCourses.some(c => c && c._id === course._id);
        console.log('✅ Already enrolled:', alreadyEnrolled);
        
        setIsEnrolled(alreadyEnrolled);
        
        // Check if user just returned from successful payment
        const urlParams = new URLSearchParams(window.location.search);
        const paymentStatus = urlParams.get('payment');
        console.log('💰 Payment status from URL:', paymentStatus);
        
        if (paymentStatus === 'success') {
          // Get session ID from URL
          const sessionId = urlParams.get('session_id');
          console.log('💰 Payment success with session ID:', sessionId);
          
          if (sessionId) {
            // Verify payment and enroll user
            setCheckingEnrollment(true);
            try {
              console.log('🔍 Verifying payment...');
              const verifyRes = await verifyPayment(sessionId);
              console.log('✅ Payment verification result:', verifyRes.data);
              
              if (verifyRes.data.success && verifyRes.data.enrolled) {
                setIsEnrolled(true);
                alert('Payment successful! You are now enrolled in this course.');
                triggerRefresh();
              } else {
                alert('Payment verification failed. Please contact support.');
              }
            } catch (err) {
              console.error('❌ Payment verification failed:', err);
              alert('Payment verification failed. Please try refreshing the page or contact support.');
            } finally {
              setCheckingEnrollment(false);
            }
          } else {
            // Fallback: check if already enrolled
            if (alreadyEnrolled) {
              alert('Payment successful! You are now enrolled in this course.');
            } else {
              alert('Payment successful! Please refresh the page to see your enrollment.');
            }
          }
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (paymentStatus === 'cancel') {
          alert('Payment was cancelled.');
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (err) {
        console.error('❌ Enrollment check failed:', err);
        setIsEnrolled(false);
      }
    };
    checkEnrollment();
  }, [user, course, triggerRefresh]);

  useEffect(() => {
    if (course) {
      setEditForm({
        title: course.title || '',
        description: course.description || '',
        certificate: course.certificate || '',
        access: course.access || '',
        price: course.price || 0,
        category: course.category || '',
        thumbnail: course.thumbnail || '',
      });
    }
  }, [course]);

  // Fetch resources for all lessons after lessons are loaded
  useEffect(() => {
    const fetchAllResources = async () => {
      if (!lessons.length) return;
      const resourcesMap = {};
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log('🔍 Fetching resources for', lessons.length, 'lessons with auth:', !!token);
      
      for (const lesson of lessons) {
        try {
          const res = await axios.get(`${API_URL}/api/lesson/resource/${lesson._id}`, { headers });
          resourcesMap[lesson._id] = res.data;
        } catch (err) {
          // For non-authenticated users, resources might not be accessible
          console.log(`ℹ️ Resources not accessible for lesson ${lesson._id} (auth required)`);
          resourcesMap[lesson._id] = [];
        }
      }
      setLessonResources(resourcesMap);
    };
    fetchAllResources();
  }, [lessons]);

  // When opening edit modal, also load lessons for editing
  useEffect(() => {
    if (showEditModal) {
      setEditLessons(lessons);
    }
  }, [showEditModal, lessons]);

  // Fetch quiz attempt and eligibility
  useEffect(() => {
    const fetchQuizData = async () => {
      if (!user || !user._id || !course?._id || !isEnrolled) return;
      
      try {
        // Check quiz eligibility
        const eligibilityRes = await axios.get(`${API_URL}/api/quiz/course/${course._id}/eligibility`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setQuizEligibility(eligibilityRes.data);
        
        // If user has attempted, get the attempt
        if (eligibilityRes.data.hasAttempted) {
          setQuizAttempt(eligibilityRes.data.attempt);
        }
      } catch (err) {
        console.log('Quiz not available for this course or user not eligible');
      }
    };
    
    fetchQuizData();
  }, [user, course, isEnrolled, progress]);

  const handleEnroll = async () => {
    if (!user || !user._id) {
      alert('You must be logged in to enroll.');
      return;
    }
    if (!course?._id) {
      alert('Course information is missing.');
      return;
    }
    console.log('Enroll debug:', { userId: user._id, courseId: course._id, isFree: course.isFree });
    setEnrollLoading(true);
    setEnrollError("");
    try {
      if (course.isFree) {
        // Free course: Direct enrollment
        await enrollUserInCourse(user._id, course._id);
        // Re-check enrollment status from backend
        const res = await axios.get(`${API_URL}/api/enroll/${user._id}`);
        const enrolledCourses = res.data;
        const alreadyEnrolled = enrolledCourses.some(c => c && c._id === course._id);
        setIsEnrolled(alreadyEnrolled);
        if (alreadyEnrolled) {
          alert('Successfully enrolled!');
          triggerRefresh();
        }
      } else {
        // Paid course: Start Stripe payment
        const res = await createStripeCheckoutSession(course._id);
        if (res.data && res.data.url) {
          window.location.href = res.data.url;
        } else {
          setEnrollError('Failed to start payment. Please try again.');
        }
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message === 'Already enrolled') {
        setEnrollError('You are already enrolled in this course.');
        setIsEnrolled(true);
      } else {
        setEnrollError('Enrollment failed. Please try again.');
        console.error('Enroll error:', err);
      }
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleLessonClick = (lessonId, isFree) => {
    if (isFree || isEnrolled) {
      setActiveLesson(lessonId);
    } else {
      alert('Please enroll to access this lesson.');
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModule(prev => (prev === moduleId ? null : moduleId));
  };

  const toggleResourcesDropdown = (lessonId) => {
    setOpenResourcesDropdown(prev => (prev === lessonId ? null : lessonId));
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this course and all its lessons?')) return;
    
    // Check if user is logged in and is admin
    if (!user || !user.isAdmin) {
      alert('You must be logged in as an admin to delete courses.');
      return;
    }
    
    // Check if token exists
    const token = localStorage.getItem('token');
    console.log('🔑 Token check before delete:', { hasToken: !!token, user: user?.username, isAdmin: user?.isAdmin });
    
    if (!token) {
      alert('No authentication token found. Please log in again.');
      return;
    }
    
    try {
      console.log('🗑️ Attempting to delete course:', course?._id);
      await deleteCourse(course?._id);
      alert('Course deleted successfully.');
      navigate('/courses');
    } catch (err) {
      console.error('❌ Delete course error:', err);
      let errorMessage = 'Failed to delete course.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    }
  };

  const handleMarkLessonComplete = async (lessonId) => {
    if (!user || !user._id || !course?._id) {
      alert('You must be logged in and enrolled to complete lessons.');
      return;
    }
    try {
      await completeLesson(user._id, course._id, lessonId);
      alert('Lesson marked as complete!');
      triggerRefresh();
    } catch (err) {
      alert('Failed to mark lesson as complete.');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const updated = await updateCourse(course?._id, editForm);
      setCourse(updated.data);
      setShowEditModal(false);
      alert('Course updated successfully!');
    } catch (err) {
      alert('Failed to update course.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDownloadCertificate = () => {
    // Placeholder for certificate download logic
    alert('Certificate download functionality will be implemented soon!');
  };

  // Add/Edit/Delete Lesson Handlers
  const handleEditLessonChange = (idx, field, value) => {
    setEditLessons(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));
  };
  const handleSaveLesson = async (idx) => {
    const lesson = editLessons[idx];
    try {
      const updated = await updateLesson(lesson._id, lesson);
      setEditLessons(prev => prev.map((l, i) => i === idx ? updated.data : l));
      setLessons(prev => prev.map((l, i) => i === idx ? updated.data : l));
      setEditLessonModal({ open: false, lesson: null });
      alert('Lesson updated!');
    } catch {
      alert('Failed to update lesson.');
    }
  };
  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await deleteLesson(lessonId);
      setEditLessons(prev => prev.filter(l => l._id !== lessonId));
      setLessons(prev => prev.filter(l => l._id !== lessonId));
      alert('Lesson deleted!');
    } catch {
      alert('Failed to delete lesson.');
    }
  };
  const handleAddLesson = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.post(`${API_URL}/api/lesson/addlesson`, {
        course: course?._id,
        ...newLesson,
        order: editLessons.length + 1,
      }, { headers });
      setEditLessons(prev => [...prev, res.data]);
      setLessons(prev => [...prev, res.data]);
      setNewLesson({ title: '', content: '', videourl: '', pdfurl: '', order: editLessons.length + 2 });
      setAddingLesson(false);
      alert('Lesson added!');
    } catch (err) {
      console.error('❌ Error adding lesson:', err.response?.data || err.message);
      alert('Failed to add lesson.');
    }
  };
  // Resource Handlers
  const handleDeleteResource = async (lessonId, resIdx) => {
    try {
      await deleteLessonResource(lessonId, resIdx);
      setLessonResources(prev => ({
        ...prev,
        [lessonId]: prev[lessonId].filter((_, i) => i !== resIdx),
      }));
      alert('Resource deleted!');
    } catch {
      alert('Failed to delete resource.');
    }
  };
  const handleAddResourceLink = async (lessonId) => {
    if (!resourceInput.name || !resourceInput.url) return;
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.post(`${API_URL}/api/lesson/resource/${lessonId}`, { ...resourceInput, type: 'Link' }, { headers });
      setLessonResources(prev => ({
        ...prev,
        [lessonId]: [...(prev[lessonId] || []), { ...resourceInput, type: 'Link' }],
      }));
      setResourceInput({ name: '', type: 'PDF', url: '' });
      alert('Resource added!');
    } catch (err) {
      console.error('❌ Error adding resource link:', err.response?.data || err.message);
      alert('Failed to add resource.');
    }
  };

  // Add this function to handle resource file upload
  const handleResourceFileChange = async (lessonId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setResourceUploadingLesson(lessonId);
    setResourceUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${API_URL}/api/lesson/resource/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setResourceUploadProgress(percent);
        },
      });
      // Add resource to lesson
      const resource = {
        name: file.name,
        type: file.type.endsWith('pdf') ? 'PDF' : file.type.endsWith('zip') ? 'ZIP' : 'File',
        url: res.data.url,
      };
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_URL}/api/lesson/resource/${lessonId}`, resource, { headers });
      setLessonResources(prev => ({
        ...prev,
        [lessonId]: [...(prev[lessonId] || []), resource],
      }));
      alert('Resource uploaded and added!');
    } catch (err) {
      alert('Resource upload failed.');
    } finally {
      setResourceUploadingLesson(null);
      setResourceUploadProgress(0);
    }
  };

  // Sample resources data (you can replace this with actual data from your backend)
  // const getResourcesForLesson = (lessonId) => {
  //   return [
  //     { id: 1, name: 'Lesson Notes', type: 'PDF', url: '#' },
  //     { id: 2, name: 'Code Examples', type: 'ZIP', url: '#' },
  //     { id: 3, name: 'Additional Reading', type: 'Link', url: '#' },
  //   ];
  // };

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg font-medium">Loading course...</p>
        </div>
      </div>
    );
  }



  const firstVideoLesson = lessons.find(l => l.videourl);
  const selectedLesson = activeLesson ? lessons.find(l => l._id === activeLesson) : firstVideoLesson;

  const isEligibleForCertificate = isEnrolled && progress >= 90 && quizAttempt && quizAttempt.passed;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gray-50'}`}>
      {/* Course Header */}
      <div className={`${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-50 text-cyan-600 border border-cyan-200'}`}>
                <Zap size={12} className="mr-1" />
                Featured Course
              </span>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={`${i < Math.floor(course.averageRating || 0) ? 'text-yellow-400 fill-current' : isDarkMode ? 'text-gray-400' : 'text-gray-300'}`} 
                  />
                ))}
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} ml-2`}>
                  {course.averageRating ? course.averageRating.toFixed(1) : 'No ratings'} 
                  {course.totalRatings > 0 && ` (${course.totalRatings} reviews)`}
                </span>
              </div>
            </div>
            
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-tight`}>
              {course.title}
            </h1>
            

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center space-x-2`}>
                <Users size={16} className={isDarkMode ? 'text-emerald-400' : 'text-cyan-500'} />
                <span className="text-sm font-medium">{course.studentsEnrolled ?? 0} students</span>
              </div>
              
              <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center space-x-2`}>
                <Clock size={16} className="text-blue-500" />
                <span className="text-sm font-medium">{course.duration ? `${course.duration} min` : 'N/A'}</span>
              </div>
              
              <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center space-x-2`}>
                <Award size={16} className="text-purple-500" />
                <span className="text-sm font-medium">{course.certificate || 'Certificate included'}</span>
              </div>
              
              <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} flex items-center space-x-2`}>
                <Globe size={16} className="text-orange-500" />
                <span className="text-sm font-medium">{course.access || 'Lifetime access'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Left Column - Video & Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Video Player */}
            <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl overflow-hidden shadow-lg`}>
              <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-gray-900'} aspect-video relative`}>
                {selectedLesson && selectedLesson.videourl ? (
                  <div className="relative">
                    <video 
                      src={selectedLesson.videourl} 
                      controls 
                      className="w-full h-full" 
                      onError={e => { 
                        e.target.poster = course.thumbnail; 
                        e.target.onerror = null; 
                      }}
                      onTimeUpdate={e => {
                        if (selectedLesson._id && isEnrolled) {
                          handleVideoProgress(selectedLesson._id, e.target.currentTime, e.target.duration);
                        }
                      }}
                      onLoadedMetadata={e => {
                        // Initialize progress tracking when video loads
                        if (selectedLesson._id && isEnrolled) {
                          setVideoProgress(prev => ({ ...prev, [selectedLesson._id]: 0 }));
                        }
                      }}
                    >
                      Sorry, your browser doesn't support embedded videos.
                    </video>
                    

                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={course.thumbnail}
                      alt="Course Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              
              {selectedLesson && (
                <div className={`p-6 ${isDarkMode ? 'border-t border-slate-700/50' : 'border-t border-gray-200'}`}>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>{selectedLesson.title}</h3>
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>{selectedLesson.content}</p>
                </div>
              )}
              {selectedLesson && lessonResources[selectedLesson._id] && lessonResources[selectedLesson._id].length > 0 && (
                <div className={`p-6 ${isDarkMode ? 'border-t border-slate-700/50' : 'border-t border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Resources</h4>
                  <ul className="space-y-2">
                    {lessonResources[selectedLesson._id].map((res, idx) => (
                      <li key={idx} className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <FileText size={14} />
                        <a href={res.url} target="_blank" rel="noopener noreferrer" className={`underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-cyan-600 hover:text-cyan-700'}`}>{res.name} ({res.type})</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Course Content/Curriculum */}
            <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl shadow-lg`}>
              <div className={`p-6 ${isDarkMode ? 'border-b border-slate-700/50' : 'border-b border-gray-200'}`}>
                <h2 className={`text-2xl font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <BookOpen className={isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} size={24} />
                  <span className="ml-3">Course Content</span>
                </h2>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                  {totalLessons} lessons • {totalDuration} minutes total
                  {!course.isFree && lessons.some(l => l.free) && (
                    <span className="ml-2 text-green-500">
                      • {lessons.filter(l => l.free).length} free lessons available
                    </span>
                  )}
                </p>
              </div>
              
              <div className="p-6">
                {lessons.length === 0 ? (
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center py-8`}>No lessons available for this course.</p>
                ) : (
                  <div className="space-y-3 relative">
                    {lessons.map((lesson, idx) => (
                      <div key={lesson._id} className={`border rounded-xl ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200'} ${openResourcesDropdown === lesson._id ? 'overflow-visible' : 'overflow-hidden'} transition-all duration-200 hover:shadow-md`}>
                        <div className="relative">
                          <button
                            onClick={() => handleLessonClick(lesson._id, lesson.free)}
                            className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                              activeLesson === lesson._id 
                                ? isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-cyan-50 border-cyan-200'
                                : isDarkMode ? 'hover:bg-slate-700/30' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {lesson.videourl ? (
                                  <Play size={16} className={isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} />
                                ) : (
                                  <BookOpen size={16} className="text-blue-500" />
                                )}
                              </div>
                              <div>
                                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{lesson.title}</h3>
                                <div className={`flex items-center space-x-3 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  <span>{lesson.duration || '5 min'}</span>
                                  {lesson.free && !course.isFree && (
                                    <span className="flex items-center text-green-600">
                                      <Unlock size={12} className="mr-1" />
                                      Free
                                    </span>
                                  )}
                                  {!lesson.free && !isEnrolled && !course.isFree && (
                                    <span className={`flex items-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                      <Lock size={12} className="mr-1" />
                                      Premium
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {/* Completed Checkbox */}
                              {isEnrolled && (
                                <input
                                  type="checkbox"
                                  checked={completedLessonsByUser[lesson._id] || false}
                                  onChange={e => handleLessonCompleteCheckbox(lesson._id, e.target.checked)}
                                  className="w-4 h-4 text-emerald-500 bg-slate-700 border-slate-600 rounded focus:ring-emerald-500 focus:ring-2"
                                  disabled={markingLesson[lesson._id] || autoCompleting[lesson._id]}
                                />
                              )}
                              
                              {/* Resources Dropdown */}
                              <span
                                role="button"
                                tabIndex={0}
                                onClick={e => {
                                  e.stopPropagation();
                                  toggleResourcesDropdown(lesson._id);
                                }}
                                onKeyDown={e => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.stopPropagation();
                                    toggleResourcesDropdown(lesson._id);
                                  }
                                }}
                                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                  isDarkMode 
                                    ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-600/30' 
                                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                                }`}
                              >
                                <FolderOpen size={14} />
                                <span>Resources</span>
                                <ChevronDown size={14} className={`transform transition-transform ${openResourcesDropdown === lesson._id ? 'rotate-180' : ''}`} />
                              </span>
                              <ChevronRight size={16} className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            </div>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Enrollment Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Enrollment Card */}
              <div className={`${isDarkMode ? 'bg-slate-800/80 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl p-6 shadow-lg`}>
                {isEnrolled && (
                  <div className={`mb-6 p-4 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-cyan-50 border-cyan-200'} rounded-lg`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-emerald-400' : 'text-cyan-700'}`}>Your Progress</span>
                      <span className={`text-sm ${isDarkMode ? 'text-emerald-400' : 'text-cyan-700'}`}>{Math.round(progress)}%</span>
                    </div>
                    <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} w-full rounded-full h-2`}>
                      <div 
                        className={`${isDarkMode ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-cyan-500 to-cyan-400'} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {completedLessons} of {totalLessons} lessons completed
                    </p>
                  </div>
                )}

                {!course.isFree && (
                  <div className="text-center mb-6">
                    <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      ${course.price}
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>One-time payment</p>
                    {lessons.some(l => l.free) && (
                      <p className={`text-sm text-green-600 mt-1`}>
                        {lessons.filter(l => l.free).length} free lessons included
                      </p>
                    )}
                  </div>
                )}

                {!isEnrolled ? (
                  <button
                    onClick={handleEnroll}
                    className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/25' : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-cyan-500/25'} text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg mb-4 disabled:opacity-60 disabled:cursor-not-allowed`}
                    disabled={enrollLoading || checkingEnrollment}
                  >
                    {enrollLoading ? 'Processing...' : checkingEnrollment ? 'Verifying Payment...' : (course.isFree ? 'Enroll for Free' : `Buy Now - $${course.price}`)}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className={`flex items-center justify-center space-x-2 ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-cyan-50 border-cyan-200 text-cyan-700'} font-semibold py-4 px-6 rounded-xl border`}>
                      <CheckCircle size={20} />
                      <span>Enrolled</span>
                    </div>
                    
                    {/* Quiz Button */}
                    {quizEligibility && (
                      <div className="space-y-2">
                        {quizEligibility.eligible && !quizAttempt && (
                          <button
                            onClick={() => navigate(`/courses/${course._id}/quiz`)}
                            className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-purple-500/25' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-purple-500/25'} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg`}
                          >
                            Take Course Quiz
                          </button>
                        )}
                        
                        {quizAttempt && (
                          <div className={`${isDarkMode ? 'bg-slate-700/50 border-slate-600/50' : 'bg-gray-100 border-gray-200'} rounded-xl border p-4`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quiz Result</span>
                              <span className={`text-sm font-bold ${quizAttempt.passed ? 'text-green-500' : 'text-red-500'}`}>
                                {quizAttempt.percentage}%
                              </span>
                            </div>
                            <div className={`${isDarkMode ? 'bg-slate-600' : 'bg-gray-200'} w-full rounded-full h-2`}>
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${quizAttempt.passed ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${quizAttempt.percentage}%` }}
                              ></div>
                            </div>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {quizAttempt.passed ? 'Passed' : 'Failed'} • {quizAttempt.score}/{quizAttempt.totalQuestions} correct
                            </p>
                          </div>
                        )}
                        
                        {!quizEligibility.eligible && progress < 90 && (
                          <div className={`${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'} rounded-xl border p-3`}>
                            <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                              Complete 90% of course to unlock quiz
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {enrollError && (
                  <div className="text-red-500 text-center text-sm mt-2">{enrollError}</div>
                )}

                <div className="space-y-3">
                  <div className="flex space-x-3">
                    <button
                      className={`flex-1 flex items-center justify-center space-x-2 ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} py-3 px-4 rounded-lg transition-colors`}
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Course link copied to clipboard!');
                      }}
                    >
                      <Share2 size={16} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Course Stats */}
                <div className={`mt-6 pt-6 space-y-3 ${isDarkMode ? 'border-t border-slate-700/50' : 'border-t border-gray-200'}`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Students enrolled</span>
                    <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-medium`}>{course.studentsEnrolled ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Duration</span>
                    <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-medium`}>{course.duration ? `${course.duration} min` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Certificate</span>
                    <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-medium`}>{course.certificate || 'Yes'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Access</span>
                    <span className={`${isDarkMode ? 'text-white' : 'text-slate-900'} font-medium`}>{course.access || 'Lifetime'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Description & Details */}
        <div className="mt-12 space-y-8">
          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl p-8 shadow-lg`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>About This Course</h2>
            <div className="prose max-w-none">
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-lg whitespace-pre-line`}>
                {course.detailedDescription || course.description}
              </p>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl p-8 shadow-lg`}>
            <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>What You'll Learn</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Master the fundamentals',
                'Build real-world projects',
                'Best practices and patterns',
                'Advanced techniques',
                'Industry standards',
                'Professional workflows'
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle size={20} className={isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} />
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* About Instructor */}
          {instructor && (
            <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl shadow-lg overflow-hidden`}>
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <User className={isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} size={28} />
                  <h2 className={`text-2xl font-bold ml-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>About Your Instructor</h2>
                </div>
                
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Instructor Profile */}
                  <div className="lg:col-span-1">
                    <div className="text-center">
                      <div className="relative mb-4">
                        <img
                          src={instructor.avatar}
                          alt={instructor.name}
                          className="w-32 h-32 rounded-full mx-auto object-cover shadow-lg border-4 border-white dark:border-slate-700"
                        />
                        <div className="absolute -bottom-2 -right-2">
                          <div className={`${isDarkMode ? 'bg-emerald-500' : 'bg-cyan-500'} text-white rounded-full p-2 shadow-lg`}>
                            <GraduationCap size={16} />
                          </div>
                        </div>
                      </div>
                      
                      <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {instructor.name}
                      </h3>
                      <p className={`${isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} font-medium mb-3`}>
                        {instructor.title}
                      </p>
                      
                      {/* Quick Stats */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-center space-x-2 text-sm">
                          <Star className="text-yellow-500" size={14} />
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {instructor.rating} Instructor Rating
                          </span>
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-sm">
                          <MapPin className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={14} />
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {instructor.location}
                          </span>
                        </div>
                      </div>

                      {/* Contact Buttons */}
                      <div className="space-y-2">
                        {instructor.email && (
                          <a
                            href={`mailto:${instructor.email}`}
                            className={`w-full ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300'} border font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2`}
                          >
                            <Mail size={16} />
                            <span>Email Instructor</span>
                          </a>
                        )}
                        {instructor.linkedinProfile && (
                          <a
                            href={instructor.linkedinProfile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-full ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-300'} border font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2`}
                          >
                            <ExternalLink size={16} />
                            <span>LinkedIn Profile</span>
                          </a>
                        )}
                        {!instructor.email && !instructor.linkedinProfile && (
                          <button className={`w-full ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300'} border font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2`}>
                            <MessageCircle size={16} />
                            <span>Contact Instructor</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Instructor Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Bio */}
                    <div>
                      <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        About
                      </h4>
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                        {instructor.bio}
                      </p>
                    </div>

                    {/* Experience Stats */}
                    <div>
                      <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Experience & Impact
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className={`${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 text-center`}>
                          <TrendingUp className={`${isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} mx-auto mb-2`} size={24} />
                          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {instructor.experience}
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Teaching & Development
                          </p>
                        </div>
                        
                        <div className={`${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 text-center`}>
                          <Users className="text-blue-500 mx-auto mb-2" size={24} />
                          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {instructor.students}
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Students Worldwide
                          </p>
                        </div>
                        
                        <div className={`${isDarkMode ? 'bg-slate-700/50 border-slate-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 text-center`}>
                          <BookOpen className="text-purple-500 mx-auto mb-2" size={24} />
                          <div className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            {instructor.courses}
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Online Courses
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Education & Specializations */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          Education
                        </h4>
                        <div className="flex items-start space-x-3">
                          <GraduationCap className={isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} size={20} />
                          <div>
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {instructor.education}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          Specializations
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {instructor.specializations.map((spec, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                isDarkMode 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                              }`}
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Achievements */}
                    <div>
                      <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Key Achievements
                      </h4>
                      <div className="space-y-2">
                        {instructor.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <CheckCircle size={16} className={`${isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} mt-0.5`} />
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {achievement}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Certificate Section */}
          <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl shadow-lg overflow-hidden`}>
            <div className="p-8">
              <div className="flex items-center mb-6">
                <Medal className="text-yellow-500 mr-3" size={28} />
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Certificate of Completion</h2>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* Certificate Preview */}
                <div className="relative">
                  <div className={`${isDarkMode ? 'bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600' : 'bg-gradient-to-br from-white to-gray-50 border-gray-300'} border-2 rounded-xl p-8 shadow-xl`}>
                    <div className="text-center space-y-4">
                      <div className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} text-4xl font-bold`}>
                        <Award size={48} className="mx-auto mb-2" />
                        Certificate
                      </div>
                      <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} text-lg`}>
                        of Completion
                      </div>
                      <div className={`${isDarkMode ? 'text-white' : 'text-slate-900'} text-xl font-semibold border-b-2 border-yellow-500 pb-2 mb-4`}>
                        {course.title}
                      </div>
                      <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        {user && isEnrolled ? user.username || user.email : 'Student Name'}
                      </div>
                      <div className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'} text-xs`}>
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Certificate Badge */}
                  <div className="absolute -top-3 -right-3">
                    <div className={`${isDarkMode ? 'bg-yellow-500' : 'bg-yellow-500'} text-white rounded-full p-3 shadow-lg`}>
                      <FileText size={20} />
                    </div>
                  </div>
                </div>
                
                {/* Certificate Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Certificate Benefits
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle size={16} className={isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Official recognition of course completion
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle size={16} className={isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Shareable on LinkedIn and other platforms
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle size={16} className={isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Downloadable PDF format
                        </span>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle size={16} className={isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Industry-recognized credential
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Certificate Action */}
                  <div className="space-y-3">
                    {isEligibleForCertificate ? (
                      <div className="space-y-3">
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-emerald-400' : 'text-cyan-600'} text-sm font-medium`}>
                          <CheckCircle size={16} />
                          <span>Congratulations! You've earned your certificate</span>
                        </div>
                        <button
                          onClick={handleDownloadCertificate}
                          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-yellow-500/25 flex items-center justify-center space-x-2"
                        >
                          <Download size={18} />
                          <span>Download Certificate</span>
                        </button>
                      </div>
                    ) : !isEnrolled ? (
                      <div className="space-y-3">
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                          <Lock size={16} />
                          <span>Enroll in course to earn certificate</span>
                        </div>
                        <button
                          onClick={handleEnroll}
                          className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/25' : 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-cyan-500/25'} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg`}
                        >
                          {course.isFree ? 'Enroll for Free' : `Enroll Now - $${course.price}`}
                        </button>
                      </div>
                    ) : progress < 90 ? (
                      <div className="space-y-3">
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} text-sm font-medium`}>
                          <Clock size={16} />
                          <span>Complete 90% of lessons to unlock quiz</span>
                        </div>
                        <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} w-full rounded-full h-2`}>
                          <div 
                            className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                          {completedLessons} of {totalLessons} lessons completed ({progress}%)
                        </p>
                      </div>
                    ) : !quizAttempt ? (
                      <div className="space-y-3">
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'} text-sm font-medium`}>
                          <Target size={16} />
                          <span>Take the quiz to earn your certificate</span>
                        </div>
                        <button
                          onClick={() => navigate(`/courses/${course._id}/quiz`)}
                          className={`w-full ${isDarkMode ? 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-purple-500/25' : 'bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 shadow-purple-500/25'} text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg`}
                        >
                          Take Course Quiz
                        </button>
                      </div>
                    ) : !quizAttempt.passed ? (
                      <div className="space-y-3">
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'} text-sm font-medium`}>
                          <XCircle size={16} />
                          <span>Quiz failed. Retake to earn certificate</span>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                          You scored {quizAttempt.percentage}%. Need 80% to pass.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'} text-sm font-medium`}>
                          <CheckCircle size={16} />
                          <span>Quiz passed! You're eligible for certificate</span>
                        </div>
                        <button
                          onClick={handleDownloadCertificate}
                          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-yellow-500/25 flex items-center justify-center space-x-2"
                        >
                          <Download size={18} />
                          <span>Download Certificate</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rating System */}
          <RatingSystem courseId={course?._id} isEnrolled={isEnrolled} />
        </div>

        {/* Admin Controls */}
        {user && user.isAdmin && (
          <div className="mt-12 flex justify-center space-x-4">
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-200"
            >
              Edit Course
            </button>
            <button
              onClick={handleDeleteCourse}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-200"
            >
              Delete Course
            </button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Course</h2>
              <button
                className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                onClick={() => setShowEditModal(false)}
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={editForm.title} 
                  onChange={handleEditChange} 
                  className={`w-full ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white focus:ring-emerald-500' : 'bg-gray-100 border-gray-300 text-gray-900 focus:ring-emerald-600'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2`} 
                  required 
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                <textarea 
                  name="description" 
                  value={editForm.description} 
                  onChange={handleEditChange} 
                  className={`w-full ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white focus:ring-emerald-500' : 'bg-gray-100 border-gray-300 text-gray-900 focus:ring-emerald-600'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2`} 
                  rows="4" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Certificate</label>
                  <select
                    name="certificate"
                    value={editForm.certificate}
                    onChange={handleEditChange}
                    className={`w-full ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border rounded-lg px-4 py-3`}
                  >
                    {CERTIFICATE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Access</label>
                  <select
                    name="access"
                    value={editForm.access}
                    onChange={handleEditChange}
                    className={`w-full ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border rounded-lg px-4 py-3`}
                  >
                    {ACCESS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Price</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={editForm.price} 
                    onChange={handleEditChange} 
                    className={`w-full ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white focus:ring-emerald-500' : 'bg-gray-100 border-gray-300 text-gray-900 focus:ring-emerald-600'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2`} 
                    min="0" 
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className={`w-full ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-100 border-gray-300 text-gray-900'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                  >
                    <option value="">Select a category</option>
                    {[
                      'Cybersecurity',
                      'Network Security',
                      'Web Security',
                      'Mobile Security',
                      'Cloud Security',
                      'Data Protection',
                      'Incident Response',
                      'Security Awareness',
                      'Penetration Testing',
                      'Ethical Hacking',
                      'Digital Forensics',
                      'Compliance & Governance',
                      'Risk Management',
                      'Security Architecture',
                      'Cryptography',
                      'Malware Analysis',
                      'Threat Intelligence',
                      'Security Operations',
                      'Identity & Access Management',
                      'Application Security'
                    ].map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Thumbnail URL</label>
                <input 
                  type="text" 
                  name="thumbnail" 
                  value={editForm.thumbnail} 
                  onChange={handleEditChange} 
                  className={`w-full ${isDarkMode ? 'bg-slate-700 border-slate-600 text-white focus:ring-emerald-500' : 'bg-gray-100 border-gray-300 text-gray-900 focus:ring-emerald-600'} border rounded-lg px-4 py-3 focus:outline-none focus:ring-2`} 
                />
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)} 
                  className={`px-6 py-3 ${isDarkMode ? 'bg-slate-600 hover:bg-slate-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-900'} rounded-lg font-medium transition-colors`}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`px-6 py-3 ${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'} rounded-lg font-medium transition-colors`} 
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>

            {/* Lessons Management */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Lessons</h3>
                <button type="button" onClick={() => setAddingLesson(true)} className="bg-emerald-600 px-3 py-1 rounded text-white">Add Lesson</button>
              </div>
              <ul className="space-y-2">
                {editLessons.map((lesson, idx) => (
                  <li key={lesson._id} className="bg-slate-700 rounded p-3 flex flex-col mb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{lesson.title}</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setEditLessonModal({ open: true, lesson: { ...lesson, idx } })} className="text-blue-400">Edit</button>
                        <button type="button" onClick={() => handleDeleteLesson(lesson._id)} className="text-red-400">Delete</button>
                      </div>
                    </div>
                    {/* Resources for this lesson */}
                    <div className="mt-2">
                      <div className="font-medium text-sm mb-1">Resources</div>
                      <ul className="space-y-1">
                        {(lessonResources[lesson._id] || []).map((res, resIdx) => (
                          <li key={resIdx} className="flex items-center gap-2 text-sm text-gray-300">
                            <FileText size={14} />
                            <span>{res.name} ({res.type})</span>
                            <button type="button" onClick={() => handleDeleteResource(lesson._id, resIdx)} className="text-red-400 ml-2">Remove</button>
                          </li>
                        ))}
                      </ul>
                      {/* Add resource link and file upload */}
                      <div className="flex gap-2 mt-2 flex-wrap items-center">
                        <input
                          type="text"
                          placeholder="Resource Name"
                          value={resourceInput.name}
                          onChange={e => setResourceInput(prev => ({ ...prev, name: e.target.value }))}
                          className="bg-slate-800 border border-gray-600 rounded-lg px-2 py-1 text-white"
                        />
                        <input
                          type="text"
                          placeholder="Resource Link (URL)"
                          value={resourceInput.url}
                          onChange={e => setResourceInput(prev => ({ ...prev, url: e.target.value }))}
                          className="bg-slate-800 border border-gray-600 rounded-lg px-2 py-1 text-white"
                        />
                        <button type="button" onClick={() => handleAddResourceLink(lesson._id)} className="bg-blue-600 px-2 py-1 rounded text-white">Add Link</button>
                        <input
                          type="file"
                          accept="application/pdf,application/zip,application/x-zip-compressed"
                          onChange={e => handleResourceFileChange(lesson._id, e)}
                          className="bg-slate-800 border border-gray-600 rounded-lg px-2 py-1 text-white"
                          disabled={resourceUploadingLesson === lesson._id}
                        />
                        {resourceUploadingLesson === lesson._id && (
                          <span className="text-teal-400 ml-2">Uploading: {resourceUploadProgress}%</span>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {/* Add Lesson Modal */}
              {addingLesson && (
                <div className="mt-4 bg-slate-900 p-4 rounded">
                  <input
                    type="text"
                    placeholder="Lesson Title"
                    value={newLesson.title}
                    onChange={e => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-2 mb-2"
                  />
                  <textarea
                    placeholder="Lesson Content"
                    value={newLesson.content}
                    onChange={e => setNewLesson(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full bg-slate-800 border border-gray-600 rounded-lg px-4 py-2 mb-2"
                  />
                  <button type="button" onClick={handleAddLesson} className="bg-emerald-600 px-4 py-2 rounded text-white">Add</button>
                  <button type="button" onClick={() => setAddingLesson(false)} className="ml-2 text-gray-400">Cancel</button>
                </div>
              )}
              {/* Edit Lesson Modal */}
              {editLessonModal.open && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                  <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md">
                    <h3 className="text-lg font-bold mb-4 text-white">Edit Lesson</h3>
                    <input
                      type="text"
                      value={editLessons[editLessonModal.lesson.idx].title}
                      onChange={e => handleEditLessonChange(editLessonModal.lesson.idx, 'title', e.target.value)}
                      className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 mb-2 text-white"
                    />
                    <textarea
                      value={editLessons[editLessonModal.lesson.idx].content}
                      onChange={e => handleEditLessonChange(editLessonModal.lesson.idx, 'content', e.target.value)}
                      className="w-full bg-slate-700 border border-gray-600 rounded-lg px-4 py-2 mb-2 text-white"
                    />
                    <div className="flex justify-end gap-2 mt-4">
                      <button type="button" onClick={() => setEditLessonModal({ open: false, lesson: null })} className="bg-gray-600 px-4 py-2 rounded text-white">Cancel</button>
                      <button type="button" onClick={() => handleSaveLesson(editLessonModal.lesson.idx)} className="bg-emerald-600 px-4 py-2 rounded text-white">Save</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Resources Popup Modal */}
      {openResourcesDropdown && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20" 
            onClick={() => setOpenResourcesDropdown(null)}
          ></div>
          
          {/* Popup Content */}
          <div className={`relative w-80 max-w-sm mx-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-xl shadow-2xl`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Lesson Resources
                </h4>
                <button
                  onClick={() => setOpenResourcesDropdown(null)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                >
                  <span className="text-xl">&times;</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {(lessonResources[openResourcesDropdown] && lessonResources[openResourcesDropdown].length > 0) ? (
                  lessonResources[openResourcesDropdown].map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors border ${
                        isDarkMode 
                          ? 'hover:bg-slate-700/50 text-gray-300 border-slate-700/50' 
                          : 'hover:bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText size={16} className="text-gray-400" />
                        <span className="text-sm font-medium">{resource.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDarkMode 
                            ? 'bg-slate-600 text-slate-300' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {resource.type}
                        </span>
                        <ExternalLink size={12} className="text-gray-400" />
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-gray-400 text-center">No resources for this lesson.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-complete Notification */}
      {showAutoCompleteNotification && autoCompletedLesson && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-4 rounded-lg shadow-lg border border-emerald-400 animate-slideIn">
          <div className="flex items-center space-x-3">
            <CheckCircle size={20} className="text-emerald-100" />
            <div>
              <h4 className="font-semibold">Lesson Completed!</h4>
              <p className="text-sm text-emerald-100">
                "{autoCompletedLesson.title}" has been automatically marked as complete.
              </p>
            </div>
            <button
              onClick={() => setShowAutoCompleteNotification(false)}
              className="text-emerald-100 hover:text-white transition-colors"
            >
              <span className="text-xl">&times;</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;