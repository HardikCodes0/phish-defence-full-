const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true, // One quiz per course
  },
  title: {
    type: String,
    required: true,
    default: 'Course Quiz'
  },
  description: {
    type: String,
    default: 'Test your knowledge of the course material'
  },
  passingScore: {
    type: Number,
    required: true,
    default: 80, // 80% passing score
    min: 0,
    max: 100
  },
  timeLimit: {
    type: Number, // in minutes, 0 means no time limit
    default: 0
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      options: [{
        type: String,
        required: true
      }],
      correctAnswer: {
        type: Number, // index of correct option
        required: true
      },
      explanation: {
        type: String,
        default: ''
      }
    }
  ],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
