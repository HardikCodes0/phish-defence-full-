const express = require('express');
const router = express.Router();
const {enrollUser, getUserEnrolledCourses, markLessonComplete, getUserProgress} = require('../controllers/enrollmentController')
const protect = require('../middleware/authmiddleware');

router.post('/enroll', protect, enrollUser)
// GET /enrollments/:userId - get all courses a user is enrolled in
router.get('/:userId', getUserEnrolledCourses)
// POST /enroll/complete-lesson - mark a lesson as completed
router.post('/complete-lesson', protect, markLessonComplete)
// POST /enroll/uncomplete-lesson - unmark a lesson as completed
const { unmarkLessonComplete } = require('../controllers/enrollmentController');
router.post('/uncomplete-lesson', protect, unmarkLessonComplete);
// GET /enroll/progress/:userId - get progress for all enrollments
router.get('/progress/:userId', protect, getUserProgress)
module.exports= router;