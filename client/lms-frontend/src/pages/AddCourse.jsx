import React, { useState, useContext, useEffect } from 'react';
import { createCourse } from '../api/course';
import { createQuiz } from '../api/quiz';
import {
  Upload,
  Save,
  X,
  Image as ImageIcon,
  Video,
  DollarSign,
  BookOpen,
  User,
  Tag,
  FileText,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Link as LinkIcon,
  Upload as UploadIcon,
  HelpCircle,
  Clock,
  Target,
  CheckCircle
} from 'lucide-react';
import { AuthContext } from '../context/authcontext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '../contexts/ThemeContext';

const AddCourse = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // Predefined categories for courses
  const COURSE_CATEGORIES = [
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
  ];

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/addcourse');
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: {
      name: '',
      experience: '',
      education: '',
      specializations: [],
      achievements: [],
      about: '',
      linkedinProfile: '',
      email: '',
      title: '',
      location: '',
      students: '',
      courses: '',
      rating: ''
    },
    category: '',
    thumbnail: '',
    isFree: true,
    price: 0,
    type: 'video',
    detailedDescription: '',
    duration: '',
    level: 'beginner',
  });

  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [lessonInput, setLessonInput] = useState({ title: '', videourl: '', pdfurl: '', content: '', order: 1, free: false });
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [lessonFile, setLessonFile] = useState(null);
  const [lessonFileType, setLessonFileType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lessonResources, setLessonResources] = useState({});
  const [resourceUploading, setResourceUploading] = useState(false);
  const [resourceUploadProgress, setResourceUploadProgress] = useState(0);
  const [resourceInput, setResourceInput] = useState({ name: '', type: 'PDF', url: '' });
  const [resourceFile, setResourceFile] = useState(null);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState(0);
  const [instructorSpecialization, setInstructorSpecialization] = useState('');
  const [instructorAchievement, setInstructorAchievement] = useState('');
  
  // Quiz state
  const [quizData, setQuizData] = useState({
    title: 'Course Quiz',
    description: 'Test your knowledge of the course material',
    passingScore: 80,
    timeLimit: 0, // 0 means no time limit
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [showQuizSection, setShowQuizSection] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleInstructorChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      instructor: {
        ...prev.instructor,
        [field]: value,
      },
    }));
  };



  const addInstructorSpecialization = () => {
    if (instructorSpecialization.trim()) {
      handleInstructorChange('specializations', [...formData.instructor.specializations, instructorSpecialization.trim()]);
      setInstructorSpecialization('');
    }
  };

  const removeInstructorSpecialization = (index) => {
    const updatedSpecializations = formData.instructor.specializations.filter((_, i) => i !== index);
    handleInstructorChange('specializations', updatedSpecializations);
  };

  const addInstructorAchievement = () => {
    if (instructorAchievement.trim()) {
      handleInstructorChange('achievements', [...formData.instructor.achievements, instructorAchievement.trim()]);
      setInstructorAchievement('');
    }
  };

  const removeInstructorAchievement = (index) => {
    const updatedAchievements = formData.instructor.achievements.filter((_, i) => i !== index);
    handleInstructorChange('achievements', updatedAchievements);
  };

  // Quiz functions
  const handleQuizChange = (field, value) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (field, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options.map((option, i) => i === index ? value : option)
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.question.trim() || currentQuestion.options.some(opt => !opt.trim())) {
      alert('Please fill in the question and all options');
      return;
    }

    setQuizData(prev => ({
      ...prev,
      questions: [...prev.questions, { ...currentQuestion }]
    }));

    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setIsAddingQuestion(false);
  };

  const removeQuestion = (index) => {
    setQuizData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleThumbnailFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Thumbnail must be less than 5MB');
      return;
    }
    
    setThumbnailUploading(true);
    setThumbnailUploadProgress(0);
    const formDataObj = new FormData();
    formDataObj.append('file', file);
    
    try {
      console.log('📤 Uploading thumbnail:', {
        filename: file.name,
        type: file.type,
        size: file.size
      });
      
      // First test Cloudinary connection
      try {
        const testRes = await axios.get('http://localhost:5000/api/lesson/test-cloudinary');
        console.log('✅ Cloudinary test successful:', testRes.data);
      } catch (testErr) {
        console.warn('⚠️ Cloudinary test failed:', testErr.response?.data || testErr.message);
      }
      
      const res = await axios.post('http://localhost:5000/api/lesson/thumbnail-upload', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setThumbnailUploadProgress(percent);
        },
        timeout: 60000, // 60 second timeout
      });
      
      console.log('✅ Thumbnail upload successful:', res.data);
      setFormData((prev) => ({ ...prev, thumbnail: res.data.url }));
      setThumbnailPreview(res.data.url);
    } catch (err) {
      console.error('❌ Thumbnail upload error:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      let errorMessage = 'Thumbnail upload failed';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(`Thumbnail upload failed: ${errorMessage}`);
    } finally {
      setThumbnailUploading(false);
      setThumbnailUploadProgress(0);
    }
  };

  const handleLessonInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLessonInput((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleLessonFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLessonFile(file);
    setLessonFileType(file.type);
    setUploading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/lesson/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      });
      if (file.type.startsWith('video/')) {
        setLessonInput((prev) => ({ ...prev, videourl: res.data.url, pdfurl: '' }));
      } else if (file.type === 'application/pdf') {
        setLessonInput((prev) => ({ ...prev, pdfurl: res.data.url, videourl: '' }));
      }
    } catch (err) {
      alert('File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleResourceFileChange = async (e, lessonIdx) => {
    const file = e.target.files[0];
    if (!file) return;
    setResourceUploading(true);
    setResourceUploadProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:5000/api/lesson/resource/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setResourceUploadProgress(percent);
        },
      });
      const resource = {
        name: file.name,
        type: file.type.endsWith('pdf') ? 'PDF' : file.type.endsWith('zip') ? 'ZIP' : 'File',
        url: res.data.url,
      };
      setLessonResources((prev) => ({
        ...prev,
        [lessonIdx]: [...(prev[lessonIdx] || []), resource],
      }));
      setResourceInput({ name: '', type: 'PDF', url: '' });
      setResourceFile(null);
    } catch (err) {
      alert('Resource upload failed.');
    } finally {
      setResourceUploading(false);
      setResourceUploadProgress(0);
    }
  };

  const handleAddResourceLink = (lessonIdx) => {
    if (!resourceInput.name || !resourceInput.url) return;
    setLessonResources((prev) => ({
      ...prev,
      [lessonIdx]: [...(prev[lessonIdx] || []), { ...resourceInput, type: 'Link' }],
    }));
    setResourceInput({ name: '', type: 'PDF', url: '' });
  };

  const handleRemoveResource = (lessonIdx, resIdx) => {
    setLessonResources((prev) => ({
      ...prev,
      [lessonIdx]: prev[lessonIdx].filter((_, i) => i !== resIdx),
    }));
  };

  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!lessonInput.title) return;
    
    const newLesson = { 
      ...lessonInput, 
      order: lessons.length + 1, 
      resources: lessonResources[lessons.length] || []
    };
    
    setLessons((prev) => [...prev, newLesson]);
    setLessonInput({ title: '', videourl: '', pdfurl: '', content: '', order: lessons.length + 2, free: false });
    setLessonFile(null);
    setLessonFileType('');
    setIsAddingLesson(false);
    setLessonResources((prev) => {
      const newRes = { ...prev };
      delete newRes[lessons.length];
      return newRes;
    });
  };

  const handleRemoveLesson = (idx) => {
    setLessons((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        instructor: formData.instructor,
        category: formData.category,
        thumbnail: formData.thumbnail,
        isFree: formData.isFree,
        price: formData.isFree ? 0 : Number(formData.price),
      };

      const res = await createCourse(payload);
      const courseId = res.data._id;
      
      // Create lessons
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const lessonRes = await axios.post('http://localhost:5000/api/lesson/addlesson', {
          course: courseId,
          title: lesson.title,
          videourl: lesson.videourl,
          pdfurl: lesson.pdfurl,
          content: lesson.content,
          order: lesson.order,
          free: lesson.free || false,
        });
        const lessonId = lessonRes.data._id;
        const resources = lesson.resources || [];
        for (const resource of resources) {
          await axios.post(`http://localhost:5000/api/lesson/resource/${lessonId}`, resource);
        }
      }

      // Create quiz if questions are provided
      if (showQuizSection && quizData.questions.length > 0) {
        try {
          await createQuiz({
            courseId,
            title: quizData.title,
            description: quizData.description,
            passingScore: quizData.passingScore,
            timeLimit: quizData.timeLimit,
            questions: quizData.questions
          });
          console.log('✅ Quiz created successfully!');
        } catch (quizErr) {
          console.error('❌ Failed to create quiz:', quizErr.response?.data?.message || quizErr.message);
          alert('Course created but quiz creation failed. You can add the quiz later.');
        }
      }

      alert('✅ Course and lessons created successfully!');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        instructor: {
          name: '',
          experience: '',
          education: '',
          specializations: [],
          achievements: [],
          about: '',
          linkedinProfile: '',
          email: '',
          title: '',
          location: '',
          students: '',
          courses: '',
          rating: ''
        },
        category: '',
        thumbnail: '',
        isFree: true,
        price: 0,
        type: 'video',
        detailedDescription: '',
        duration: '',
        level: 'beginner',
      });
      setThumbnailPreview('');
      setLessons([]);
      setLessonResources({});
      setQuizData({
        title: 'Course Quiz',
        description: 'Test your knowledge of the course material',
        passingScore: 80,
        timeLimit: 0,
        questions: []
      });
      setShowQuizSection(false);

    } catch (err) {
      alert('❌ Failed to create course or lessons: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-black'}`}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Create New Course</h1>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Build engaging learning experiences for your students</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form - Left Column */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Course Details Card */}
              <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-teal-400" />
                  </div>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Course Information</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Course Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all`}
                      placeholder="Enter course title"
                      required
                    />
                  </div>

                  {/* Instructor Name */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Instructor Name *</label>
                    <div className="relative">
                      <User className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                      <input
                        type="text"
                        value={formData.instructor.name}
                        onChange={(e) => handleInstructorChange('name', e.target.value)}
                        className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all`}
                        placeholder="Instructor name"
                        required
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Category *</label>
                    <div className="relative">
                      <Tag className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white border-gray-300 text-black'} border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all appearance-none cursor-pointer`}
                        required
                      >
                        <option value="">Select a category</option>
                        {COURSE_CATEGORIES.map((cat, index) => (
                          <option key={index} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Course Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all resize-none`}
                      placeholder="Provide a detailed description of what students will learn..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Instructor Information Card */}
              <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Instructor Information</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Professional Title</label>
                    <input
                      type="text"
                      value={formData.instructor.title}
                      onChange={(e) => handleInstructorChange('title', e.target.value)}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                      placeholder="e.g., Senior Software Engineer & Educator"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Experience</label>
                    <input
                      type="text"
                      value={formData.instructor.experience}
                      onChange={(e) => handleInstructorChange('experience', e.target.value)}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                      placeholder="e.g., 8+ Years Experience"
                    />
                  </div>

                  {/* Education */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Education</label>
                    <input
                      type="text"
                      value={formData.instructor.education}
                      onChange={(e) => handleInstructorChange('education', e.target.value)}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                      placeholder="e.g., M.S. Computer Science, Stanford University"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Location</label>
                    <input
                      type="text"
                      value={formData.instructor.location}
                      onChange={(e) => handleInstructorChange('location', e.target.value)}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Email Address</label>
                    <input
                      type="email"
                      value={formData.instructor.email}
                      onChange={(e) => handleInstructorChange('email', e.target.value)}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                      placeholder="instructor@example.com"
                    />
                  </div>

                  {/* LinkedIn Profile */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>LinkedIn Profile</label>
                    <input
                      type="url"
                      value={formData.instructor.linkedinProfile}
                      onChange={(e) => handleInstructorChange('linkedinProfile', e.target.value)}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  {/* Students Taught */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Students Taught</label>
                    <input
                      type="text"
                      value={formData.instructor.students}
                      onChange={(e) => handleInstructorChange('students', e.target.value)}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                      placeholder="e.g., 12,000+ Students Taught"
                    />
                  </div>

                  {/* Courses Created */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Courses Created</label>
                    <input
                      type="text"
                      value={formData.instructor.courses}
                      onChange={(e) => handleInstructorChange('courses', e.target.value)}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                      placeholder="e.g., 15 Courses Created"
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Instructor Rating</label>
                    <input
                      type="text"
                      value={formData.instructor.rating}
                      onChange={(e) => handleInstructorChange('rating', e.target.value)}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                      placeholder="e.g., 4.8"
                    />
                  </div>

                  {/* About */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>About Instructor</label>
                    <textarea
                      value={formData.instructor.about}
                      onChange={(e) => handleInstructorChange('about', e.target.value)}
                      rows={4}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none`}
                      placeholder="Provide a detailed bio about the instructor's background, expertise, and teaching philosophy..."
                    />
                  </div>

                  {/* Specializations */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Specializations</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={instructorSpecialization}
                        onChange={(e) => setInstructorSpecialization(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInstructorSpecialization())}
                        className={`flex-1 ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                        placeholder="Add specialization (e.g., Web Development)"
                      />
                      <button
                        type="button"
                        onClick={addInstructorSpecialization}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.instructor.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm"
                        >
                          {spec}
                          <button
                            type="button"
                            onClick={() => removeInstructorSpecialization(index)}
                            className="text-blue-300 hover:text-blue-100 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Key Achievements</label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={instructorAchievement}
                        onChange={(e) => setInstructorAchievement(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInstructorAchievement())}
                        className={`flex-1 ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all`}
                        placeholder="Add achievement (e.g., Top-rated instructor on multiple platforms)"
                      />
                      <button
                        type="button"
                        onClick={addInstructorAchievement}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.instructor.achievements.map((achievement, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2"
                        >
                          <span className="text-green-400 text-sm">{achievement}</span>
                          <button
                            type="button"
                            onClick={() => removeInstructorAchievement(index)}
                            className="text-green-300 hover:text-green-100 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnail & Pricing Card */}
              <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border p-6`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Media & Pricing</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Thumbnail */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Course Thumbnail *</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailFileChange}
                        className="hidden"
                        id="thumbnail-upload"
                        required
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:border-teal-500/50 transition-all ${isDarkMode ? 'border-slate-600/50 bg-slate-700/20' : 'border-gray-300 bg-white'}`}
                      >
                        {thumbnailPreview ? (
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail"
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <>
                            <UploadIcon className={`w-8 h-8 mb-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Click to upload thumbnail</span>
                          </>
                        )}
                      </label>
                      {thumbnailUploading && (
                        <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900/80' : 'bg-gray-900/80'} rounded-xl flex items-center justify-center`}>
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <span className="text-sm text-teal-400">{thumbnailUploadProgress}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Course Pricing</label>
                    <div className="space-y-4">
                      <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isDarkMode ? 'bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 text-slate-300' : 'bg-white border-gray-300 hover:bg-gray-100 text-black'}`}>
                        <input
                          type="checkbox"
                          name="isFree"
                          checked={formData.isFree}
                          onChange={handleInputChange}
                          className={`w-4 h-4 text-teal-500 rounded focus:ring-teal-500 focus:ring-2 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
                        />
                        <span>Free Course</span>
                      </label>
                                              {!formData.isFree && (
                          <div className="relative">
                            <DollarSign className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                            <input
                              type="number"
                              name="price"
                              value={formData.price}
                              onChange={handleInputChange}
                              className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all`}
                              placeholder="Course price"
                              min="0"
                              step="0.01"
                            />
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quiz Section */}
              <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border p-6`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <HelpCircle className="w-5 h-5 text-purple-400" />
                    </div>
                    <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Course Quiz</h2>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={showQuizSection}
                      onChange={(e) => setShowQuizSection(e.target.checked)}
                      className={`w-4 h-4 text-purple-500 rounded focus:ring-purple-500 focus:ring-2 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'}`}
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Add Quiz</span>
                  </label>
                </div>

                {showQuizSection && (
                  <div className="space-y-6">
                    {/* Quiz Settings */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Quiz Title</label>
                        <input
                          type="text"
                          value={quizData.title}
                          onChange={(e) => handleQuizChange('title', e.target.value)}
                          className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all`}
                          placeholder="Course Quiz"
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Passing Score (%)</label>
                        <input
                          type="number"
                          value={quizData.passingScore}
                          onChange={(e) => handleQuizChange('passingScore', Number(e.target.value))}
                          min="0"
                          max="100"
                          className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all`}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Time Limit (minutes)</label>
                        <input
                          type="number"
                          value={quizData.timeLimit}
                          onChange={(e) => handleQuizChange('timeLimit', Number(e.target.value))}
                          min="0"
                          className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all`}
                          placeholder="0 = No time limit"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Target className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} />
                        <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          Students need 90% course completion + {quizData.passingScore}% quiz score for certificate
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Quiz Description</label>
                      <textarea
                        value={quizData.description}
                        onChange={(e) => handleQuizChange('description', e.target.value)}
                        rows={3}
                        className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none`}
                        placeholder="Describe what students will be tested on..."
                      />
                    </div>

                    {/* Questions List */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Questions ({quizData.questions.length})</h3>
                        <button
                          type="button"
                          onClick={() => setIsAddingQuestion(true)}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Question
                        </button>
                      </div>

                      {/* Questions List */}
                      <div className="space-y-4">
                        {quizData.questions.map((q, index) => (
                          <div key={index} className={`${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-white border-gray-200'} rounded-xl border p-4`}>
                            <div className="flex items-start justify-between mb-3">
                              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>Question {index + 1}</h4>
                              <button
                                type="button"
                                onClick={() => removeQuestion(index)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className={`${isDarkMode ? 'text-slate-300' : 'text-gray-700'} mb-3`}>{q.question}</p>
                            <div className="space-y-2">
                              {q.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    optIndex === q.correctAnswer 
                                      ? 'border-green-500 bg-green-500' 
                                      : 'border-gray-300'
                                  }`}>
                                    {optIndex === q.correctAnswer && (
                                      <CheckCircle className="w-3 h-3 text-white" />
                                    )}
                                  </div>
                                  <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Question Form */}
                      {isAddingQuestion && (
                        <div className={`${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
                          <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Add New Question</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Question</label>
                              <textarea
                                value={currentQuestion.question}
                                onChange={(e) => handleQuestionChange('question', e.target.value)}
                                rows={3}
                                className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none`}
                                placeholder="Enter your question..."
                              />
                            </div>

                            <div>
                              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Options</label>
                              <div className="space-y-2">
                                {currentQuestion.options.map((option, index) => (
                                  <div key={index} className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name="correctAnswer"
                                      checked={currentQuestion.correctAnswer === index}
                                      onChange={() => handleQuestionChange('correctAnswer', index)}
                                      className="w-4 h-4 text-purple-500 bg-slate-700 border-slate-600 focus:ring-purple-500 focus:ring-2"
                                    />
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => handleOptionChange(index, e.target.value)}
                                      className={`flex-1 ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all`}
                                      placeholder={`Option ${index + 1}`}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-slate-300' : 'text-black'}`}>Explanation (Optional)</label>
                              <textarea
                                value={currentQuestion.explanation}
                                onChange={(e) => handleQuestionChange('explanation', e.target.value)}
                                rows={2}
                                className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none`}
                                placeholder="Explain why this is the correct answer..."
                              />
                            </div>

                            <div className="flex gap-2 pt-2">
                              <button
                                type="button"
                                onClick={addQuestion}
                                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-medium transition-colors"
                              >
                                Add Question
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsAddingQuestion(false)}
                                className="px-4 py-2 text-slate-400 hover:text-slate-300 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Course...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Save className="w-5 h-5" />
                    Create Course
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Lessons Panel - Right Column */}
          <div className="lg:col-span-1">
            <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm rounded-2xl border p-6 sticky top-6`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Video className="w-5 h-5 text-blue-400" />
                  </div>
                  <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>Course Lessons</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingLesson(true)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-4 h-4" />
                  Add Lesson
                </button>
              </div>

              {/* Lessons List */}
              <div className="space-y-3 mb-6">
                {lessons.length === 0 ? (
                  <div className="text-center py-8">
                    <Video className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>No lessons added yet</p>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Start building your course content</p>
                  </div>
                ) : (
                  lessons.map((lesson, idx) => (
                    <div key={idx} className={`${isDarkMode ? 'bg-slate-700/30 border-slate-600/50' : 'bg-white border-gray-200'} rounded-xl border p-4`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-black'}`}>{lesson.title}</h3>
                          <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            <span>Lesson {lesson.order}</span>
                            {!formData.isFree && lesson.free && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                                <Unlock size={10} />
                                Free
                              </span>
                            )}
                            {!formData.isFree && !lesson.free && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">
                                <Lock size={10} />
                                Paid
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLesson(idx)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Lesson Form */}
              {isAddingLesson && (
                <div className="bg-slate-900/50 rounded-xl border border-slate-600/50 p-4 space-y-4">
                  <h3 className="font-semibold text-white mb-4">Add New Lesson</h3>
                  
                  <div>
                    <input
                      type="text"
                      name="title"
                      value={lessonInput.title}
                      onChange={handleLessonInputChange}
                      placeholder="Lesson title"
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-sm`}
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="file"
                      accept="video/*,application/pdf"
                      onChange={handleLessonFileChange}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white border-gray-300 text-black'} border rounded-lg px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-teal-500 file:text-white hover:file:bg-teal-600 file:cursor-pointer`}
                    />
                    {uploading && (
                      <div className="text-teal-400 text-sm mt-1">Uploading: {uploadProgress}%</div>
                    )}
                  </div>

                  {lessonInput.videourl && (
                    <div>
                      <video src={lessonInput.videourl} controls className="w-full max-h-32 rounded-lg" />
                    </div>
                  )}

                  {lessonInput.pdfurl && (
                    <div>
                      <a href={lessonInput.pdfurl} target="_blank" rel="noopener noreferrer" className="text-teal-400 underline text-sm">View PDF</a>
                    </div>
                  )}

                  <div>
                    <textarea
                      name="content"
                      value={lessonInput.content}
                      onChange={handleLessonInputChange}
                      placeholder="Lesson description"
                      rows={3}
                      className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all text-sm resize-none`}
                    />
                  </div>

                  {!formData.isFree && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="free"
                        checked={lessonInput.free}
                        onChange={handleLessonInputChange}
                        className="w-4 h-4 text-teal-500 bg-slate-700 border-slate-600 rounded focus:ring-teal-500 focus:ring-2"
                      />
                      <span className="text-sm text-slate-300">Make this lesson free</span>
                    </label>
                  )}

                  {/* Resource Upload */}
                  <div className="border-t border-slate-600/50 pt-4">
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Lesson Resources</h4>
                    
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="application/pdf,application/zip,application/x-zip-compressed"
                        onChange={(e) => handleResourceFileChange(e, lessons.length)}
                        className={`w-full ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white' : 'bg-white border-gray-300 text-black'} border rounded-lg px-3 py-2 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer`}
                      />
                      {resourceUploading && <div className="text-blue-400 text-xs">Uploading: {resourceUploadProgress}%</div>}
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Resource name"
                          value={resourceInput.name}
                          onChange={e => setResourceInput(prev => ({ ...prev, name: e.target.value }))}
                          className={`flex-1 ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-lg px-2 py-1 text-xs`}
                        />
                        <input
                          type="text"
                          placeholder="Resource URL"
                          value={resourceInput.url}
                          onChange={e => setResourceInput(prev => ({ ...prev, url: e.target.value }))}
                          className={`flex-1 ${isDarkMode ? 'bg-slate-700/50 border-slate-600/50 text-white placeholder-slate-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'} border rounded-lg px-2 py-1 text-xs`}
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAddResourceLink(lessons.length)} 
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-lg text-xs transition-colors"
                        >
                          <LinkIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Resource List */}
                    {(lessonResources[lessons.length] || []).length > 0 && (
                      <div className="mt-3 space-y-1">
                        {(lessonResources[lessons.length] || []).map((res, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-slate-700/30 rounded px-2 py-1">
                            <div className="flex items-center gap-2">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-300">{res.name}</span>
                              <span className="text-xs text-slate-500">({res.type})</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveResource(lessons.length, idx)} 
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleAddLesson}
                      className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      Add Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingLesson(false)}
                      className="px-4 py-2 text-slate-400 hover:text-slate-300 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;