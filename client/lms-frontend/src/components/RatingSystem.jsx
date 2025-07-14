import React, { useState, useEffect, useContext } from 'react';
import { Star, MessageSquare, Trash2, Edit3 } from 'lucide-react';
import { submitRating, getCourseRatings, getUserRating, deleteRating } from '../api/rating';
import { AuthContext } from '../context/authcontext';
import { useTheme } from '../contexts/ThemeContext';

const RatingSystem = ({ courseId, isEnrolled }) => {
  const [userRating, setUserRating] = useState(null);
  const [courseRatings, setCourseRatings] = useState([]);
  const [pagination, setPagination] = useState({});
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useContext(AuthContext);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (courseId) {
      fetchCourseRatings();
      if (user && isEnrolled) {
        fetchUserRating();
      }
    }
  }, [courseId, user, isEnrolled, currentPage]);

  const fetchCourseRatings = async () => {
    try {
      const response = await getCourseRatings(courseId, currentPage, 5);
      setCourseRatings(response.ratings);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching course ratings:', error);
    }
  };

  const fetchUserRating = async () => {
    try {
      const response = await getUserRating(courseId);
      if (response.rating) {
        setUserRating(response.rating);
        setRating(response.rating.rating);
        setReview(response.rating.review || '');
      }
    } catch (error) {
      console.error('Error fetching user rating:', error);
    }
  };

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      alert('Please select a rating');
      return;
    }

    setLoading(true);
    try {
      await submitRating(courseId, rating, review);
      await fetchUserRating();
      await fetchCourseRatings();
      setShowRatingForm(false);
      alert(userRating ? 'Rating updated successfully!' : 'Rating submitted successfully!');
    } catch (error) {
      alert(error.message || 'Error submitting rating');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!window.confirm('Are you sure you want to delete your rating?')) return;

    setLoading(true);
    try {
      await deleteRating(courseId);
      setUserRating(null);
      setRating(0);
      setReview('');
      await fetchCourseRatings();
      alert('Rating deleted successfully!');
    } catch (error) {
      alert(error.message || 'Error deleting rating');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (ratingValue, interactive = false, size = 20) => {
    return [...Array(5)].map((_, index) => {
      const starValue = index + 1;
      const filled = interactive ? starValue <= hoveredStar : starValue <= ratingValue;
      
      return (
        <Star
          key={index}
          size={size}
          className={`cursor-pointer transition-colors ${
            filled 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-400 hover:text-yellow-300'
          }`}
          onMouseEnter={() => interactive && setHoveredStar(starValue)}
          onMouseLeave={() => interactive && setHoveredStar(0)}
          onClick={() => interactive && setRating(starValue)}
        />
      );
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl p-6`}>
        <h3 className={`text-2xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
          <Star className="text-yellow-400 mr-2" size={24} />
          Course Ratings
        </h3>
        
        {courseRatings.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <div className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  {(courseRatings.reduce((acc, r) => acc + r.rating, 0) / courseRatings.length).toFixed(1)}
                </div>
                <div>
                  <div className="flex items-center space-x-1 mb-1">
                    {renderStars(courseRatings.reduce((acc, r) => acc + r.rating, 0) / courseRatings.length)}
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {courseRatings.length} review{courseRatings.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No ratings yet. Be the first to rate this course!</p>
        )}
      </div>

      {/* User Rating Section */}
      {user && isEnrolled && (
        <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className={`text-xl font-semibold flex items-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
              <MessageSquare className="mr-2" size={20} />
              {userRating ? 'Your Rating' : 'Rate This Course'}
            </h4>
            {userRating && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowRatingForm(true)}
                  className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Edit3 size={16} />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDeleteRating}
                  disabled={loading}
                  className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {userRating && !showRatingForm ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                {renderStars(userRating.rating)}
                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>{userRating.rating}/5</span>
              </div>
              {userRating.review && (
                <p className={`${isDarkMode ? 'text-gray-300 bg-slate-700/50' : 'text-gray-700 bg-gray-50'} rounded-lg p-3`}>
                  {userRating.review}
                </p>
              )}
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Rated on {formatDate(userRating.createdAt)}
              </p>
            </div>
          ) : (
            <form onSubmit={handleRatingSubmit} className="space-y-4">
              <div>
                <label className={`block font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Your Rating</label>
                <div className="flex items-center space-x-1">
                  {renderStars(rating, true)}
                  <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>{rating}/5</span>
                </div>
              </div>
              
              <div>
                <label className={`block font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>Review (Optional)</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your thoughts about this course..."
                  className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${isDarkMode ? 'bg-slate-700/50 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-black placeholder-gray-500'}`}
                  rows="4"
                  maxLength="1000"
                />
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {review.length}/1000 characters
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading || !rating}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  {loading ? 'Submitting...' : (userRating ? 'Update Rating' : 'Submit Rating')}
                </button>
                {showRatingForm && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowRatingForm(false);
                      setRating(userRating?.rating || 0);
                      setReview(userRating?.review || '');
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      )}

      {/* All Ratings */}
      {courseRatings.length > 0 && (
        <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl p-6`}>
          <h4 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>All Reviews</h4>
          
          <div className="space-y-4">
            {courseRatings.map((rating) => (
              <div key={rating._id} className={`border-b pb-4 last:border-b-0 ${isDarkMode ? 'border-slate-700/50' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {rating.user?.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-black'}`}>
                      {rating.user?.username || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(rating.rating, false, 16)}
                  </div>
                </div>
                
                {rating.review && (
                  <p className={`mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{rating.review}</p>
                )}
                
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatDate(rating.createdAt)}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrevPage}
                className={`px-3 py-1 rounded transition-colors ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700 disabled:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 text-black'}`}
              >
                Previous
              </button>
              
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!pagination.hasNextPage}
                className={`px-3 py-1 rounded transition-colors ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700 disabled:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 text-black'}`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Not Enrolled Message */}
      {user && !isEnrolled && (
        <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl p-6`}>
          <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            You need to enroll in this course to rate it.
          </p>
        </div>
      )}

      {/* Not Logged In Message */}
      {!user && (
        <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-gray-200'} backdrop-blur-sm border rounded-2xl p-6`}>
          <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Please log in and enroll in this course to rate it.
          </p>
        </div>
      )}
    </div>
  );
};

export default RatingSystem; 