const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/lesson');

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
    const enrollments = await Enrollment.find({ student: userId })
      .populate('course');
    const courses = enrollments.map(e => e.course);
    res.status(200).json(courses);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mark a lesson as completed for a user in a course
const markLessonComplete = async (req, res) => {
  const { student, course, lesson } = req.body;
  try {
    const enrollment = await Enrollment.findOne({ student, course });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    if (!enrollment.completedlessons.includes(lesson)) {
      enrollment.completedlessons.push(lesson);
      // Optionally, mark as completed if all lessons are done
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

// Unmark a lesson as completed for a user in a course
const unmarkLessonComplete = async (req, res) => {
  const { student, course, lesson } = req.body;
  try {
    const enrollment = await Enrollment.findOne({ student, course });
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    const idx = enrollment.completedlessons.findIndex(l => l.toString() === lesson);
    if (idx !== -1) {
      enrollment.completedlessons.splice(idx, 1);
      // Optionally, mark as not completed if not all lessons are done
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

// Get all enrollments for a user, with progress for each course
const getUserProgress = async (req, res) => {
  try {
    const userId = req.params.userId;
    const enrollments = await Enrollment.find({ student: userId })
      .populate('course')
      .populate('completedlessons');
    // For each enrollment, calculate progress
    const progressData = await Promise.all(enrollments
      .filter(e => e.course) // Only process enrollments with a valid course
      .map(async (e) => {
        const course = e.course;
        let currentLessons;
        if (course.isFree) {
          // Free course: all lessons are visible
          currentLessons = await Lesson.find({ course: course._id }, '_id');
        } else {
          // Paid course: check if user is enrolled (always true here), so show all lessons
          currentLessons = await Lesson.find({ course: course._id }, '_id');
        }
        // Filter out lessons that are not visible to the user (match lessonController logic)
        // For paid courses, if not enrolled, only count free lessons
        // But since this is called for enrolled users, all lessons are visible
        // If you want to be extra safe, you can check for lesson.free logic here if needed
        const currentLessonIds = currentLessons.map(l => l._id.toString());
        // Only count completed lessons that still exist in the course
        const filteredCompleted = e.completedlessons.filter(l => currentLessonIds.includes(l._id.toString()));
        const totalLessons = currentLessonIds.length;
        let progress = 0;
        if (totalLessons === 0) {
          progress = 0;
        } else if (filteredCompleted.length >= totalLessons) {
          progress = 100;
        } else {
          progress = Math.round((filteredCompleted.length / totalLessons) * 100);
        }
        return {
          course: e.course,
          completedlessons: filteredCompleted,
          progress,
          iscompleted: e.iscompleted || false,
        };
      })
    );
    res.status(200).json(progressData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { enrollUser, getUserEnrolledCourses, markLessonComplete, getUserProgress, unmarkLessonComplete };
