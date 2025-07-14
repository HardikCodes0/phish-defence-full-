import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Sun,
  CheckCircle,
  XCircle,
  AlertCircle,
  Target,
  Award,
  BookOpen
} from 'lucide-react';
import { AuthContext } from '../context/authcontext';
import { useTheme } from '../contexts/ThemeContext';
import { getQuiz, submitQuiz, checkQuizEligibility, getUserQuizAttempt, blockUserForQuiz } from '../api/quiz';
import { useTheme as useThemeContext } from '../contexts/ThemeContext';
import { useRef } from 'react';

const Quiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useThemeContext();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [existingAttempt, setExistingAttempt] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const quizRef = useRef();
  // Add state for block info
  const [blockedUntil, setBlockedUntil] = useState(null);
  // Add missing shuffled state
  const [shuffled, setShuffled] = useState(false);
  // Add missing fullscreenRequired state
  const [fullscreenRequired, setFullscreenRequired] = useState(false);

  // Shuffle questions on first load
  useEffect(() => {
    if (quiz && !shuffled) {
      const shuffledQuestions = [...quiz.questions];
      for (let i = shuffledQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
      }
      setQuiz(prev => ({ ...prev, questions: shuffledQuestions }));
      setShuffled(true);
    }
  }, [quiz, shuffled]);

  // Anti-cheat: Tab switching/focus tracking
  useEffect(() => {
    if (showResults || loading) return;
    let blocked = false;
    const handleCheat = () => {
      if (blocked) return;
      blocked = true;
      if (user && !user.isAdmin) {
        blockUserForQuiz(courseId, user._id)
          .then(() => {
            alert('You have been blocked from taking this quiz for 10 days due to leaving the quiz screen.');
            navigate('/dashboard');
          })
          .catch(() => {
            alert('You have been blocked from taking this quiz for 10 days due to leaving the quiz screen.');
            navigate('/dashboard');
          });
      } else {
        alert('Anti-cheat: Admin bypass.');
      }
    };
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' || document.hidden) {
        handleCheat();
      }
    });
    window.addEventListener('blur', handleCheat);
    return () => {
      window.removeEventListener('visibilitychange', handleCheat);
      window.removeEventListener('blur', handleCheat);
    };
  }, [showResults, loading, user, courseId, navigate]);

  // Anti-cheat: Fullscreen enforcement
  useEffect(() => {
    if (showResults || loading) return;
    const requireFullscreen = () => {
      if (!document.fullscreenElement) {
        setFullscreenRequired(true);
      } else {
        setFullscreenRequired(false);
      }
    };
    document.addEventListener('fullscreenchange', requireFullscreen);
    // Request fullscreen on mount
    if (quizRef.current && !document.fullscreenElement) {
      quizRef.current.requestFullscreen?.();
    }
    return () => {
      document.removeEventListener('fullscreenchange', requireFullscreen);
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    };
  }, [showResults, loading]);

  // Anti-cheat: Disable right-click and copy/paste
  useEffect(() => {
    if (showResults || loading) return;
    const preventDefault = e => e.preventDefault();
    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', preventDefault);
    document.addEventListener('cut', preventDefault);
    document.addEventListener('paste', preventDefault);
    return () => {
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('copy', preventDefault);
      document.removeEventListener('cut', preventDefault);
      document.removeEventListener('paste', preventDefault);
    };
  }, [showResults, loading]);

  useEffect(() => {
    const checkEligibilityAndLoadQuiz = async () => {
      try {
        setLoading(true);
        
        // Check if user is eligible for the quiz
        const eligibilityRes = await checkQuizEligibility(courseId);
        setEligibility(eligibilityRes.data);
        if (eligibilityRes.data.blockedUntil) {
          setBlockedUntil(eligibilityRes.data.blockedUntil);
          setLoading(false);
          return;
        }
        
        if (eligibilityRes.data.hasAttempted) {
          setExistingAttempt(eligibilityRes.data.attempt);
          setShowResults(true);
          setLoading(false);
          return;
        }
        
        if (!eligibilityRes.data.eligible) {
          setError(eligibilityRes.data.message);
          setLoading(false);
          return;
        }
        
        // Load the quiz
        const quizRes = await getQuiz(courseId);
        setQuiz(quizRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading quiz:', err);
        setError(err.response?.data?.message || 'Failed to load quiz');
        setLoading(false);
      }
    };

    if (courseId) {
      checkEligibilityAndLoadQuiz();
    }
  }, [courseId]);

  useEffect(() => {
    if (!isQuizComplete && quiz && !loading) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isQuizComplete, quiz, loading]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit the quiz? You cannot change your answers after submission.')) {
      return;
    }
    
    setSubmitting(true);
    try {
      const answers = [];
      for (let i = 0; i < quiz.questions.length; i++) {
        answers.push(selectedAnswers[i] !== undefined ? selectedAnswers[i] : -1);
      }
      
      const result = await submitQuiz(courseId, answers, timeElapsed);
      setIsQuizComplete(true);
      setShowResults(true);
      
      // Store result for display
      setQuiz(prev => ({
        ...prev,
        result: result.data
      }));
    } catch (err) {
      console.error('Error submitting quiz:', err);
      alert(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateScore = () => {
    if (!quiz || !existingAttempt) return 0;
    return existingAttempt.score;
  };

  const getAnsweredCount = () => {
    return Object.keys(selectedAnswers).length;
  };

  // Add helper for fullscreen
  const enterFullscreen = () => {
    let el = quizRef.current;
    if (el && el.requestFullscreen) {
      el.requestFullscreen().catch(err => {
        // Fallback to document.documentElement
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {
            alert('Fullscreen request was denied by the browser. Please allow fullscreen mode.');
          });
        } else {
          alert('Fullscreen is not supported in this browser.');
        }
      });
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        alert('Fullscreen request was denied by the browser. Please allow fullscreen mode.');
      });
    } else {
      alert('Fullscreen is not supported in this browser.');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <header className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>phish</span>
                  <span className="text-xl font-bold text-teal-500 ml-1">defense.</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Error Content */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8 text-center`}>
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quiz Not Available</h1>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
              {error}
            </p>
            
            {eligibility && eligibility.completionPercentage && (
              <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} rounded-lg p-4 mb-6`}>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Your course completion: <span className="font-semibold">{eligibility.completionPercentage}%</span>
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  You need 90% completion to take the quiz
                </p>
              </div>
            )}
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => navigate(`/courses/${courseId}`)}
                className="bg-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = existingAttempt ? existingAttempt.percentage : 0;
    const passed = existingAttempt ? existingAttempt.passed : false;
    const certificateEligible = existingAttempt ? existingAttempt.certificateEligible : false;
    
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        {/* Header */}
        <header className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>phish</span>
                  <span className="text-xl font-bold text-teal-500 ml-1">defense.</span>
                </div>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-teal-500 font-medium">Home</a>
                <a href="#" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Courses</a>
                <a href="#" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Support</a>
              </nav>
              
              <div className="flex items-center space-x-4">
                <Sun className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <div className="flex items-center space-x-2">
                  <User className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {user?.username || user?.email || 'User'}
                  </span>
                </div>
                <Settings className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <LogOut className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
            </div>
          </div>
        </header>

        {/* Results */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8 text-center`}>
            <div className={`w-24 h-24 ${passed ? 'bg-green-500' : 'bg-red-500'} rounded-full flex items-center justify-center mx-auto mb-6`}>
              {passed ? (
                <CheckCircle className="w-12 h-12 text-white" />
              ) : (
                <XCircle className="w-12 h-12 text-white" />
              )}
            </div>
            <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {passed ? 'Quiz Passed!' : 'Quiz Failed'}
            </h1>
            <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-8`}>
              You scored {score} out of {existingAttempt?.totalQuestions || 0} questions correctly
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} rounded-lg p-4`}>
                <div className="text-2xl font-bold text-teal-500">{score}/{existingAttempt?.totalQuestions || 0}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Correct Answers</div>
              </div>
              <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} rounded-lg p-4`}>
                <div className="text-2xl font-bold text-teal-500">{percentage}%</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Score</div>
              </div>
              <div className={`${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} rounded-lg p-4`}>
                <div className="text-2xl font-bold text-teal-500">{formatTime(existingAttempt?.timeTaken || 0)}</div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Time Taken</div>
              </div>
            </div>

            {/* Certificate Eligibility */}
            {certificateEligible && (
              <div className={`${isDarkMode ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-200'} border rounded-lg p-4 mb-6`}>
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">Congratulations! You're eligible for a certificate!</span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'} mt-1`}>
                  You've completed 90% of the course and passed the quiz with {percentage}%
                </p>
              </div>
            )}

            {!certificateEligible && passed && (
              <div className={`${isDarkMode ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4 mb-6`}>
                <div className="flex items-center justify-center space-x-2 text-yellow-600">
                  <Target className="w-5 h-5" />
                  <span className="font-semibold">Great job! Complete more lessons for certificate eligibility</span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'} mt-1`}>
                  You need 90% course completion to be eligible for a certificate
                </p>
              </div>
            )}

            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => navigate(`/courses/${courseId}`)}
                className="bg-teal-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-600 transition-colors"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (fullscreenRequired && !showResults) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}> 
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Fullscreen Required</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">You must take the quiz in fullscreen mode. Please click below to continue.</p>
          <button
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium"
            onClick={enterFullscreen}
          >
            Enter Fullscreen
          </button>
        </div>
      </div>
    );
  }

  // Blocked message UI
  if (blockedUntil) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Quiz Blocked</h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            You have been blocked from taking this quiz due to rule violations.<br/>
            You can try again after: <b>{new Date(blockedUntil).toLocaleString()}</b>
          </p>
          <button
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-medium"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  return (
    <div ref={quizRef} className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow-sm border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>phish</span>
                <span className="text-xl font-bold text-teal-500 ml-1">defense.</span>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-teal-500 font-medium">Home</a>
              <a href="#" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Courses</a>
              <a href="#" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Support</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Sun className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <div className="flex items-center space-x-2">
                <User className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {user?.username || user?.email || 'User'}
                </span>
              </div>
              <Settings className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <LogOut className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
            </div>
          </div>
        </div>
      </header>

      {/* Quiz Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quiz Header */}
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-6 mb-6`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {quiz.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
              <div>
                Question {currentQuestion + 1} of {quiz.questions.length}
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className={`w-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'} rounded-full h-2`}>
            <div 
              className="bg-teal-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg p-8 mb-6`}>
          <div className="mb-8">
            <div className="text-sm text-teal-500 font-medium mb-2">
              Question {currentQuestion + 1}
            </div>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} leading-relaxed`}>
              {quiz.questions[currentQuestion].question}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {quiz.questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswers[currentQuestion] === index
                    ? 'border-teal-500 bg-teal-50 text-teal-900'
                    : `${isDarkMode ? 'border-slate-600 bg-slate-700 hover:border-teal-300 hover:bg-slate-600' : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-25'}`
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswers[currentQuestion] === index
                      ? 'border-teal-500 bg-teal-500'
                      : `${isDarkMode ? 'border-slate-500' : 'border-gray-300'}`
                  }`}>
                    {selectedAnswers[currentQuestion] === index && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentQuestion === 0
                ? `${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} cursor-not-allowed`
                : `${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'} ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {getAnsweredCount()} of {quiz.questions.length} questions answered
          </div>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={getAnsweredCount() < quiz.questions.length || submitting}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                getAnsweredCount() < quiz.questions.length || submitting
                  ? `${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} cursor-not-allowed`
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                selectedAnswers[currentQuestion] === undefined
                  ? `${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'} ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} cursor-not-allowed`
                  : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz; 