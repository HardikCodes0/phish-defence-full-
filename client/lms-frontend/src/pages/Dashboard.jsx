import React, { useState, useEffect, useContext } from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle,
  TrendingUp,
  Play,
  ArrowRight,
  Calendar,
  Target,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authcontext';
import { getUserProgress } from '../api/course';
import { DashboardRefreshContext } from '../contexts/DashboardRefreshContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); // Get real user from context
  const { refreshFlag } = useContext(DashboardRefreshContext);

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHours: 0,
    averageProgress: 0
  });

  useEffect(() => {
    if (!user || !user._id) return;
    getUserProgress(user._id)
      .then(res => {
        const progressData = res.data;
        setEnrolledCourses(progressData.map(p => ({
          ...p.course,
          progress: p.progress,
          iscompleted: p.iscompleted,
          completedlessons: p.completedlessons,
        })));
        // Calculate stats based on real progress
        const totalCourses = progressData.length;
        const completedCourses = progressData.filter(c => c.progress === 100).length;
        const totalHours = progressData.reduce((acc, c) => acc + (parseFloat(c.course.duration) || 0), 0);
        const avgProgress = totalCourses > 0 ? progressData.reduce((acc, c) => acc + (c.progress || 0), 0) / totalCourses : 0;
        setStats({
          totalCourses,
          completedCourses,
          totalHours: totalHours.toFixed(1),
          averageProgress: Math.round(avgProgress)
        });
      })
      .catch(err => {
        setEnrolledCourses([]);
        setStats({ totalCourses: 0, completedCourses: 0, totalHours: 0, averageProgress: 0 });
      });
  }, [user, refreshFlag]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'Intermediate': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'Advanced': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, <span className="text-teal-500">{user.username}!</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Continue your cybersecurity learning journey
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-500">{stats.averageProgress}%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Avg Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Courses" value={stats.totalCourses} Icon={BookOpen} color="teal" />
          <StatCard label="Completed" value={stats.completedCourses} Icon={CheckCircle} color="green" />
          <StatCard label="Learning Hours" value={stats.totalHours} Icon={Clock} color="blue" />
          <StatCard label="Avg Progress" value={`${stats.averageProgress}%`} Icon={TrendingUp} color="purple" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                  <BookOpen className="w-6 h-6 text-teal-500 mr-3" /> My Courses
                </h2>
                <button
                  onClick={() => navigate('/courses')}
                  className="text-teal-500 hover:text-teal-600 font-medium transition-colors flex items-center space-x-1"
                >
                  <span>Browse All</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {enrolledCourses.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No enrolled courses yet.</p>
                ) : (
                  enrolledCourses.map(course => (
                    <div
                      key={course._id}
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="bg-gray-50 dark:bg-slate-700/30 border border-gray-200 dark:border-slate-600/50 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">
                              {course.title}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyColor(course.difficulty)}`}>
                              {course.difficulty}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            by {typeof course.instructor === 'object' ? (course.instructor?.name || 'Expert Instructor') : (course.instructor || 'Expert Instructor')} • {course.duration} hours • {course.category}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 mr-4">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                <span className="text-gray-900 dark:text-white font-medium">{course.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${getProgressColor(course.progress)}`}
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                              <Play className="w-4 h-4" />
                              <span>{course.progress === 100 ? 'Review' : 'Continue'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <SidebarCard />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, Icon, color }) => (
  <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`w-12 h-12 bg-${color}-500/20 rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-${color}-500`} />
      </div>
    </div>
  </div>
);

const SidebarCard = () => (
  <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 rounded-2xl p-6">
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
      <Target className="w-5 h-5 text-purple-500 mr-2" /> Learning Goals
    </h3>
    <p className="text-gray-600 dark:text-gray-400">Complete your courses & track your progress here!</p>
  </div>
);

export default Dashboard;
