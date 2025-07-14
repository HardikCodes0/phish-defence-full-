import React, { useEffect, useState, useContext } from 'react';
import { fetchCourses } from '../api/course';
import { Play, Users, Star, Clock, BookOpen, Award, Search, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { AuthContext } from '../context/authcontext';
import axios from 'axios';

const Courses = () => {
  const { isDarkMode } = useTheme();
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetchCourses();
        setCourses(res.data);
      } catch (err) {
        console.error('Failed to fetch courses:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  // Fetch user's enrolled courses if user is logged in
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user || !user._id) {
        setEnrolledCourses([]);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const res = await axios.get(`http://localhost:5000/api/enroll/${user._id}`, { headers });
        const enrolledCourseIds = res.data.map(enrollment => enrollment._id);
        setEnrolledCourses(enrolledCourseIds);
      } catch (err) {
        console.error('Failed to fetch enrolled courses:', err.message);
        setEnrolledCourses([]);
      }
    };

    fetchEnrolledCourses();
  }, [user]);

  // Check if user is enrolled in a specific course
  const isEnrolledInCourse = (courseId) => {
    return enrolledCourses.includes(courseId);
  };

  // Predefined categories that match the AddCourse categories
  const PREDEFINED_CATEGORIES = [
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

  const categories = [
    { id: 'all', name: 'All Courses' },
    ...PREDEFINED_CATEGORIES.map((cat) => ({
      id: cat,
      name: cat,
    })),
  ];

  // Filter by category
  let filteredCourses = filter === 'all' ? courses : courses.filter((course) => course.category === filter);
  // Further filter by search
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filteredCourses = filteredCourses.filter((course) => {
      const title = course.title?.toLowerCase() || '';
      const instructor = typeof course.instructor === 'object'
        ? (course.instructor?.name?.toLowerCase() || '')
        : (course.instructor?.toLowerCase() || '');
      const category = course.category?.toLowerCase() || '';
      return title.includes(q) || instructor.includes(q) || category.includes(q);
    });
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <section className={`py-20 ${isDarkMode ? 'bg-slate-800' : 'bg-white'} border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className={`text-5xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Cybersecurity{' '}
            <span className="text-teal-500">Training Courses</span>
          </h1>
          <p className={`text-xl leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
            Master phishing defense, security awareness, and threat detection through our comprehensive training modules designed for modern cybersecurity challenges.
          </p>
        </div>
      </section>

      {/* Search & Filters Section */}
      <section className={`py-8 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            {/* Search Bar */}
            <div className="flex-1 flex items-center max-w-md w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2 shadow-sm">
              <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search courses by title, instructor, or category..."
                className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
            {/* Category Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 appearance-none cursor-pointer ${
                  isDarkMode
                    ? 'bg-slate-800 text-gray-300 border border-slate-700 hover:bg-slate-700'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 shadow-sm'
                }`}
                style={{ paddingRight: '2.5rem' }}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Course Grid */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {filteredCourses.map((course) => {
              const isEnrolled = isEnrolledInCourse(course._id);
              
              return (
                <div
                  key={course._id}
                  className={`group ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-200'} rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-full h-48 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} flex items-center justify-center`}>
                        <BookOpen className={`h-16 w-16 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`} />
                      </div>
                    )}
                    {course.isFree && (
                      <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Free
                      </div>
                    )}
                    {isEnrolled && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Enrolled
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    {/* Category Badge */}
                    {course.category && (
                      <div className="mb-3">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                          {course.category}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className={`text-xl font-bold mb-3 leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 line-clamp-2 leading-relaxed`}>
                      {course.description}
                    </p>

                    {/* Instructor */}
                    <div className={`flex items-center gap-2 mb-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Award className="h-4 w-4" />
                      <span>
                        By{' '}
                        <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium`}>
                          {typeof course.instructor === 'object' ? (course.instructor?.name || 'Expert Instructor') : (course.instructor || 'Expert Instructor')}
                        </span>
                      </span>
                    </div>

                    {/* Stats Row */}
                    <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.totalRatings || 0} students</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{course.averageRating ? course.averageRating.toFixed(1) : 'New'}</span>
                        {course.totalRatings > 0 && (
                          <span className="text-xs">({course.totalRatings})</span>
                        )}
                      </div>
                    </div>

                    {/* Price and Action */}
                    <div className="flex items-center justify-between">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {course.isFree ? 'Free' : `$${course.price}`}
                      </div>
                      
                      <button
                        onClick={() => navigate(`/courses/${course._id}`)}
                        className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 hover:shadow-lg ${
                          isEnrolled
                            ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-emerald-500/25'
                            : 'bg-teal-500 hover:bg-teal-600 text-white hover:shadow-teal-500/25'
                        }`}
                      >
                        {isEnrolled ? (
                          <>
                            <Play className="h-4 w-4" />
                            Go to Course
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            {course.isFree ? 'Start Free' : 'Enroll'}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className={`h-16 w-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} mx-auto mb-4`} />
              <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No courses found
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No courses available in this category or matching your search. Try a different filter or search term.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Courses;