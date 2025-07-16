const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/lesson');

// Enroll user in a course
const enrollUser = async (req, res) => {
  const { student, course } = req.body;

  try {
    const existing = await Enrollment.findOne({ student, course });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });

    const enrollment = await Enrollment.create({ student, course });
    res.status(201).json(enrollment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all courses a user is enrolled in
const getUserEnrolledCourses = async (req, res) => {
  try {
    const userId = req.params.userId;
    const enrollments = await Enrollment.find({ student: userId }).populate('course');
    const courses = enrollments.map(e => e.course);
    res.status(200).json(courses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mark a lesson as completed
const markLessonComplete = async (req, res) => {
  const { student, course, lesson } = req.body;
  try {
    const enrollment = await Enrollment.findOne({ student, course });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    if (!enrollment.completedlessons.includes(lesson)) {
      enrollment.completedlessons.push(lesson);
      const totalLessons = await Lesson.countDocuments({ course });
      if (enrollment.completedlessons.length >= totalLessons) {
        enrollment.iscompleted = true;
      }
      await enrollment.save();
    }

    res.status(200).json(enrollment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Unmark a lesson as completed
const unmarkLessonComplete = async (req, res) => {
  const { student, course, lesson } = req.body;
  try {
    const enrollment = await Enrollment.findOne({ student, course });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    const index = enrollment.completedlessons.findIndex(l => l.toString() === lesson);
    if (index !== -1) {
      enrollment.completedlessons.splice(index, 1);
      const totalLessons = await Lesson.countDocuments({ course });
      if (enrollment.completedlessons.length < totalLessons) {
        enrollment.iscompleted = false;
      }
      await enrollment.save();
    }

    res.status(200).json(enrollment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ FIXED: Get user progress for each enrolled course
const getUserProgress = async (req, res) => {
  try {
    const userId = req.params.userId;
    const enrollments = await Enrollment.find({ student: userId })
      .populate('course')
      .populate('completedlessons');

    const progressData = await Promise.all(enrollments
      .filter(e => e.course) // Skip deleted/invalid courses
      .map(async (e) => {
        const courseId = e.course._id;

        // Get all lesson IDs for this course
        const lessons = await Lesson.find({ course: courseId }, '_id');
        const totalLessons = lessons.length;
        const lessonIds = lessons.map(lesson => lesson._id.toString());

        // Convert completed lesson IDs to string
        const completedIds = e.completedlessons.map(l => l._id.toString());

        // Count how many completed lessons are valid for this course
        const completedCount = completedIds.filter(id => lessonIds.includes(id)).length;

        // Calculate progress percentage
        const progress = totalLessons > 0
          ? Math.round((completedCount / totalLessons) * 100)
          : 0;

        // Update iscompleted if 100% complete and not marked yet
        if (progress === 100 && !e.iscompleted) {
          e.iscompleted = true;
          await e.save();
        }

        return {
          course: e.course,
          completedlessons: completedIds,
          progress,
          iscompleted: e.iscompleted
        };
      })
    );

    res.status(200).json(progressData);
  } catch (error) {
    console.error('❌ Progress fetch error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  enrollUser,
  getUserEnrolledCourses,
  markLessonComplete,
  unmarkLessonComplete,
  getUserProgress
};
