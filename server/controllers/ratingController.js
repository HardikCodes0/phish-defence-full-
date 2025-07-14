const Rating = require('../models/Rating');
const Course = require('../models/course');
const Enrollment = require('../models/Enrollment');

// Submit or update a rating for a course
const submitRating = async (req, res) => {
  try {
    const { courseId, rating, review } = req.body;
    const userId = req.user._id; // From auth middleware

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: userId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ 
        message: 'You must be enrolled in this course to rate it' 
      });
    }

    // Check if rating is valid
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    // Find existing rating or create new one
    let userRating = await Rating.findOne({ user: userId, course: courseId });
    
    if (userRating) {
      // Update existing rating
      const oldRating = userRating.rating;
      userRating.rating = rating;
      userRating.review = review;
      userRating.updatedAt = new Date();
      await userRating.save();
      
      // Update course statistics
      await updateCourseRatingStats(courseId, oldRating, rating, false);
    } else {
      // Create new rating
      userRating = await Rating.create({
        user: userId,
        course: courseId,
        rating,
        review
      });
      
      // Update course statistics
      await updateCourseRatingStats(courseId, null, rating, true);
    }

    // Populate user info for response
    await userRating.populate('user', 'username');

    res.status(200).json({
      message: 'Rating submitted successfully',
      rating: userRating
    });

  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({ message: 'Error submitting rating' });
  }
};

// Get ratings for a specific course
const getCourseRatings = async (req, res) => {
  try {
    const { courseId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find({ course: courseId })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalRatings = await Rating.countDocuments({ course: courseId });

    res.status(200).json({
      ratings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalRatings / limit),
        totalRatings,
        hasNextPage: page * limit < totalRatings,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ message: 'Error fetching ratings' });
  }
};

// Get user's rating for a specific course
const getUserRating = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOne({ user: userId, course: courseId });

    res.status(200).json({ rating });

  } catch (error) {
    console.error('Error fetching user rating:', error);
    res.status(500).json({ message: 'Error fetching user rating' });
  }
};

// Delete user's rating
const deleteRating = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findOneAndDelete({ user: userId, course: courseId });

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    // Update course statistics
    await updateCourseRatingStats(courseId, rating.rating, null, false, true);

    res.status(200).json({ message: 'Rating deleted successfully' });

  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ message: 'Error deleting rating' });
  }
};

// Helper function to update course rating statistics
const updateCourseRatingStats = async (courseId, oldRating, newRating, isNew = false, isDelete = false) => {
  try {
    const course = await Course.findById(courseId);
    if (!course) return;

    let totalRatings = course.totalRatings || 0;
    let totalRatingSum = (course.averageRating || 0) * totalRatings;
    let ratingDistribution = course.ratingDistribution || {
      '1': 0, '2': 0, '3': 0, '4': 0, '5': 0
    };

    if (isDelete) {
      // Remove old rating
      totalRatings--;
      totalRatingSum -= oldRating;
      ratingDistribution[oldRating.toString()] = Math.max(0, ratingDistribution[oldRating.toString()] - 1);
    } else if (isNew) {
      // Add new rating
      totalRatings++;
      totalRatingSum += newRating;
      ratingDistribution[newRating.toString()] = (ratingDistribution[newRating.toString()] || 0) + 1;
    } else {
      // Update existing rating
      totalRatingSum = totalRatingSum - oldRating + newRating;
      ratingDistribution[oldRating.toString()] = Math.max(0, ratingDistribution[oldRating.toString()] - 1);
      ratingDistribution[newRating.toString()] = (ratingDistribution[newRating.toString()] || 0) + 1;
    }

    // Calculate new average
    const averageRating = totalRatings > 0 ? totalRatingSum / totalRatings : 0;

    // Update course
    await Course.findByIdAndUpdate(courseId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalRatings,
      ratingDistribution
    });

  } catch (error) {
    console.error('Error updating course rating stats:', error);
  }
};

module.exports = {
  submitRating,
  getCourseRatings,
  getUserRating,
  deleteRating
}; 