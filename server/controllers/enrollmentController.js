const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/lesson');

// Enroll a user in a course
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

    const idx = enrollment.completedlessons.findIndex(l => l.toString() === lesson);
    if (idx !== -1) {
      enrollment.completedlessons.splice(idx, 1);

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

// Get user's progress for all enrolled courses
const getUserProgress = async (req, res) => {
  try {
    const userId = req.params.userId;

    const enrollments = await Enrollment.find({ student: userId })
      .populate('course')
      .populate('completedlessons');

    const progressData = await Promise.all(enrollments
      .filter(e => e.course) // filter out deleted courses
      .map(async (e) => {
        const course = e.course;

        // Fetch all lessons for this course
        const allLessons = await Lesson.find({ course: course._id }, '_id');
        const allLessonIds = allLessons.map(lesson => lesson._id.toString());

        // Normalize completed lesson IDs
        const completedIds = e.completedlessons.map(lesson => lesson._id.toString());
        const filteredCompleted = completedIds.filter(id => allLessonIds.includes(id));

        const totalLessons = allLessonIds.length;
        const completedCount = filteredCompleted.length;

        let progress = 0;
        if (totalLessons > 0) {
          progress = Math.round((completedCount / totalLessons) * 100);
        }

        // Optional: Auto-mark course as completed
        if (progress === 100 && !e.iscompleted) {
          e.iscompleted = true;
          await e.save();
        }

        return {
          course,
          completedlessons: filteredCompleted,
          progress,
          iscompleted: e.iscompleted
        };
      })
    );

    res.status(200).json(progressData);
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  enrollUser,
  getUserEnrolledCourses,
  markLessonComplete,
  unmarkLessonComplete,
  getUserProgress
};
