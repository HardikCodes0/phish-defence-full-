const Lesson = require('../models/lesson');
const cloudinary = require('../config/cloudinary');
const Enrollment = require('../models/Enrollment');

const addLesson = async (req, res) => {
  try {
    const { course, title, videourl, pdfurl, content, order, free } = req.body;

    const lesson = await Lesson.create({
      course,
      title,
      content,
      order,
      videourl,
      pdfurl,
      free: free || false, // Include free field with default false
    });

    res.status(201).json(lesson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Helper to check enrollment
async function isUserEnrolled(userId, courseId) {
  if (!userId || !courseId) return false;
  const enrollment = await Enrollment.findOne({ student: userId, course: courseId });
  return !!enrollment;
}

// Get lessons by course: returns all lessons for free courses, or free lessons + enrolled lessons for paid courses
const getLessonsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const userId = req.user?._id;
    const course = await require('../models/course').findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    let lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });
    
    if (!course.isFree) {
      // Paid course: check enrollment
      const isEnrolled = userId && (await isUserEnrolled(userId, courseId));
      
      if (!isEnrolled) {
        // If not enrolled, only return free lessons
        lessons = lessons.filter(lesson => lesson.free === true);
      }
    }
    
    console.log(`📚 Returning ${lessons.length} lessons for course ${courseId} (user: ${userId || 'anonymous'})`);
    res.status(200).json(lessons);
  } catch (err) {
    console.error('❌ Error fetching lessons:', err);
    res.status(500).json({ message: err.message });
  }
};

// Upload a resource file to Cloudinary
const uploadResource = async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'Upload failed' });
  }
  res.json({
    url: req.file.path,
    type: req.file.mimetype,
  });
};

// Add a resource to a lesson
const addResourceToLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { name, type, url } = req.body;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    lesson.resources.push({ name, type, url });
    await lesson.save();
    res.status(200).json(lesson.resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Protect resources: Only allow access if enrolled
const getResourcesForLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    const course = await require('../models/course').findById(lesson.course);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const userId = req.user?._id;
    if (!course.isFree) {
      if (!userId || !(await isUserEnrolled(userId, course._id))) {
        return res.status(403).json({ message: 'You must purchase this course to access resources.' });
      }
    }
    res.status(200).json(lesson.resources || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a lesson
const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const updateFields = req.body;
    const updated = await Lesson.findByIdAndUpdate(lessonId, updateFields, { new: true });
    if (!updated) return res.status(404).json({ message: 'Lesson not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a lesson
const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const deleted = await Lesson.findByIdAndDelete(lessonId);
    if (!deleted) return res.status(404).json({ message: 'Lesson not found' });
    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a resource from a lesson
const deleteResourceFromLesson = async (req, res) => {
  try {
    const { lessonId, resourceIndex } = req.params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    if (!lesson.resources || lesson.resources.length <= resourceIndex) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    lesson.resources.splice(resourceIndex, 1);
    await lesson.save();
    res.status(200).json(lesson.resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addLesson,
  getLessonsByCourse,
  uploadResource,
  addResourceToLesson,
  getResourcesForLesson,
  updateLesson,
  deleteLesson,
  deleteResourceFromLesson,
};
