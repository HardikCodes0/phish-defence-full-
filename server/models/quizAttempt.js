const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: false // Make optional for blocking records
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  passed: {
    type: Boolean,
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean
  }],
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  certificateEligible: {
    type: Boolean,
    default: false
  },
  blockedUntil: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Ensure one attempt per user per course (for now, can be modified to allow retakes)
quizAttemptSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema); 