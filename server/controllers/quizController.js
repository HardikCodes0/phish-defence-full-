const Quiz = require('../models/quiz');
const QuizAttempt = require('../models/quizAttempt');
const Enrollment = require('../models/Enrollment');

// Create a new quiz for a course
const createQuiz = async (req, res) => {
  try {
    const { courseId, title, description, passingScore, timeLimit, questions } = req.body;

    // Check if quiz already exists for this course
    const existingQuiz = await Quiz.findOne({ course: courseId });
    if (existingQuiz) {
      return res.status(400).json({ message: 'Quiz already exists for this course' });
    }

    // Validate questions
    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options || q.options.length < 2 || q.correctAnswer === undefined) {
        return res.status(400).json({ 
          message: `Invalid question ${i + 1}: must have question text, at least 2 options, and correct answer` 
        });
      }
      if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
        return res.status(400).json({ 
          message: `Invalid correct answer for question ${i + 1}: must be a valid option index` 
        });
      }
    }

    const quiz = new Quiz({
      course: courseId,
      title: title || 'Course Quiz',
      description: description || 'Test your knowledge of the course material',
      passingScore: passingScore || 80,
      timeLimit: timeLimit || 0,
      questions
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Failed to create quiz', error: error.message });
  }
};

// Get quiz for a course
const getQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quiz = await Quiz.findOne({ course: courseId, isActive: true });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found for this course' });
    }

    // Return quiz without correct answers for security
    const quizForUser = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: q.options,
        explanation: q.explanation
      }))
    };

    res.status(200).json(quizForUser);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz', error: error.message });
  }
};

// Get quiz with answers (for admin)
const getQuizWithAnswers = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quiz = await Quiz.findOne({ course: courseId });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found for this course' });
    }

    res.status(200).json(quiz);
  } catch (error) {
    console.error('Get quiz with answers error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz', error: error.message });
  }
};

// Update quiz
const updateQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, passingScore, timeLimit, questions, isActive } = req.body;

    const quiz = await Quiz.findOne({ course: courseId });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found for this course' });
    }

    // Validate questions if provided
    if (questions) {
      if (questions.length === 0) {
        return res.status(400).json({ message: 'At least one question is required' });
      }

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question || !q.options || q.options.length < 2 || q.correctAnswer === undefined) {
          return res.status(400).json({ 
            message: `Invalid question ${i + 1}: must have question text, at least 2 options, and correct answer` 
          });
        }
        if (q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
          return res.status(400).json({ 
            message: `Invalid correct answer for question ${i + 1}: must be a valid option index` 
          });
        }
      }
    }

    // Update fields
    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (passingScore !== undefined) quiz.passingScore = passingScore;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (questions !== undefined) quiz.questions = questions;
    if (isActive !== undefined) quiz.isActive = isActive;

    await quiz.save();
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Failed to update quiz', error: error.message });
  }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quiz = await Quiz.findOneAndDelete({ course: courseId });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found for this course' });
    }

    // Also delete all attempts for this quiz
    await QuizAttempt.deleteMany({ quiz: quiz._id });

    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
  }
};

// Submit quiz attempt
const submitQuiz = async (req, res) => {
  try {
    const { courseId, answers, timeTaken } = req.body;
    const userId = req.user._id; // From auth middleware
    const isAdmin = req.user.isAdmin;

    // Admins can always submit
    if (!isAdmin) {
      // Check if user is blocked
      const blockAttempt = await QuizAttempt.findOne({ user: userId, course: courseId, blockedUntil: { $gt: new Date() } });
      if (blockAttempt && blockAttempt.blockedUntil) {
        return res.status(403).json({ message: 'You are blocked from taking this quiz due to rule violation.', blockedUntil: blockAttempt.blockedUntil });
      }
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({ 
      student: userId, 
      course: courseId 
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to take the quiz' });
    }

    // Check if user has completed 90% of the course
    const totalLessons = await require('../models/lesson').countDocuments({ course: courseId });
    const completedLessons = enrollment.completedlessons.length;
    const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    if (completionPercentage < 90) {
      return res.status(403).json({ 
        message: `You must complete at least 90% of the course before taking the quiz. Current progress: ${Math.round(completionPercentage)}%` 
      });
    }

    // Get the quiz
    const quiz = await Quiz.findOne({ course: courseId, isActive: true });
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found for this course' });
    }

    // Check if user has already attempted the quiz
    const existingAttempt = await QuizAttempt.findOne({ user: userId, course: courseId });
    if (existingAttempt) {
      return res.status(400).json({ message: 'You have already attempted this quiz' });
    }

    // Calculate score
    let score = 0;
    const answerDetails = [];

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) {
        score++;
      }

      answerDetails.push({
        questionIndex: index,
        selectedAnswer: userAnswer,
        isCorrect
      });
    });

    const percentage = Math.round((score / quiz.questions.length) * 100);
    const passed = percentage >= quiz.passingScore;
    const certificateEligible = passed && completionPercentage >= 90;

    // Create quiz attempt
    const quizAttempt = new QuizAttempt({
      user: userId,
      course: courseId,
      quiz: quiz._id,
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      passed,
      answers: answerDetails,
      timeTaken: timeTaken || 0,
      certificateEligible
    });

    await quizAttempt.save();

    res.status(200).json({
      score,
      totalQuestions: quiz.questions.length,
      percentage,
      passed,
      certificateEligible,
      passingScore: quiz.passingScore,
      courseCompletion: completionPercentage
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Failed to submit quiz', error: error.message });
  }
};

// Get user's quiz attempt for a course
const getUserQuizAttempt = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const attempt = await QuizAttempt.findOne({ user: userId, course: courseId });
    
    if (!attempt) {
      return res.status(404).json({ message: 'No quiz attempt found for this course' });
    }

    res.status(200).json(attempt);
  } catch (error) {
    console.error('Get user quiz attempt error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz attempt', error: error.message });
  }
};

// Get all quiz attempts for a course (admin only)
const getCourseQuizAttempts = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const attempts = await QuizAttempt.find({ course: courseId })
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    res.status(200).json(attempts);
  } catch (error) {
    console.error('Get course quiz attempts error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz attempts', error: error.message });
  }
};

// Check if user is eligible for quiz
const checkQuizEligibility = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.isAdmin;

    // Admins are always eligible
    if (isAdmin) {
      return res.status(200).json({ eligible: true, message: 'Admin bypass: eligible', admin: true });
    }

    // Check if user is blocked
    const blockAttempt = await QuizAttempt.findOne({ user: userId, course: courseId, blockedUntil: { $gt: new Date() } });
    if (blockAttempt && blockAttempt.blockedUntil) {
      return res.status(403).json({ eligible: false, message: 'You are blocked from taking this quiz due to rule violation.', blockedUntil: blockAttempt.blockedUntil });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({ 
      student: userId, 
      course: courseId 
    });
    
    if (!enrollment) {
      return res.status(403).json({ 
        eligible: false, 
        message: 'You must be enrolled in this course to take the quiz' 
      });
    }

    // Check course completion
    const totalLessons = await require('../models/lesson').countDocuments({ course: courseId });
    const completedLessons = enrollment.completedlessons.length;
    const completionPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    if (completionPercentage < 90) {
      return res.status(403).json({ 
        eligible: false,
        message: `You must complete at least 90% of the course before taking the quiz. Current progress: ${Math.round(completionPercentage)}%`,
        completionPercentage: Math.round(completionPercentage)
      });
    }

    // Check if quiz exists
    const quiz = await Quiz.findOne({ course: courseId, isActive: true });
    if (!quiz) {
      return res.status(404).json({ 
        eligible: false, 
        message: 'No quiz available for this course' 
      });
    }

    // Check if already attempted
    const existingAttempt = await QuizAttempt.findOne({ user: userId, course: courseId });
    if (existingAttempt) {
      return res.status(200).json({ 
        eligible: false, 
        message: 'You have already attempted this quiz',
        hasAttempted: true,
        attempt: existingAttempt
      });
    }

    res.status(200).json({ 
      eligible: true, 
      message: 'You are eligible to take the quiz',
      completionPercentage: Math.round(completionPercentage)
    });
  } catch (error) {
    console.error('Check quiz eligibility error:', error);
    res.status(500).json({ message: 'Failed to check eligibility', error: error.message });
  }
};

// Block user from quiz for 10 days
const blockUserForQuiz = async (req, res) => {
  try {
    const { courseId, userId } = req.body;
    // Only block non-admins
    const user = req.user;
    if (user.isAdmin) {
      return res.status(200).json({ message: 'Admin cannot be blocked.' });
    }
    // Find or create QuizAttempt for this user/course
    let attempt = await QuizAttempt.findOne({ user: userId, course: courseId });
    if (!attempt) {
      attempt = new QuizAttempt({
        user: userId,
        course: courseId,
        quiz: null,
        score: 0,
        totalQuestions: 0,
        percentage: 0,
        passed: false,
        answers: [],
        timeTaken: 0,
        certificateEligible: false
      });
    }
    // Set blockedUntil to 10 days from now
    const blockUntil = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    attempt.blockedUntil = blockUntil;
    await attempt.save();
    res.status(200).json({ message: 'User blocked from quiz for 10 days', blockedUntil: blockUntil });
  } catch (error) {
    console.error('Block user for quiz error:', error);
    res.status(500).json({ message: 'Failed to block user', error: error.message });
  }
};

module.exports = {
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
};
