const express = require('express');
const router = express.Router();
const {
  createQuiz,
  getQuiz,
  getQuizWithAnswers,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getUserQuizAttempt,
  getCourseQuizAttempts,
  checkQuizEligibility,
  blockUserForQuiz
} = require('../controllers/quizController');
const authMiddleware = require('../middleware/authmiddleware');

// Public routes (no auth required)
router.get('/course/:courseId', getQuiz);
router.get('/course/:courseId/eligibility', authMiddleware, checkQuizEligibility);

// Protected routes (auth required)
router.post('/create', authMiddleware, createQuiz);
router.get('/course/:courseId/with-answers', authMiddleware, getQuizWithAnswers);
router.put('/course/:courseId', authMiddleware, updateQuiz);
router.delete('/course/:courseId', authMiddleware, deleteQuiz);
router.post('/submit', authMiddleware, submitQuiz);
router.post('/block', authMiddleware, blockUserForQuiz);
router.get('/course/:courseId/attempt', authMiddleware, getUserQuizAttempt);
router.get('/course/:courseId/attempts', authMiddleware, getCourseQuizAttempts);

module.exports = router;