const express = require('express');
const router = express.Router();
const { submitRating, getCourseRatings, getUserRating, deleteRating } = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authmiddleware');

// Submit or update a rating
router.post('/submit', authMiddleware, submitRating);

// Get all ratings for a course (public endpoint - no auth required)
router.get('/course/:courseId', getCourseRatings);

// Get user's rating for a specific course
router.get('/user/:courseId', authMiddleware, getUserRating);

// Delete user's rating
router.delete('/:courseId', authMiddleware, deleteRating);

module.exports = router; 